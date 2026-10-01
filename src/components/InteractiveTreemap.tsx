'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { BudgetItem, AdministrativeUnit, SpendingFilter } from '@/types/budget';
import { FUNCTIONAL_CATEGORIES } from '@/data/categories';
import { computeTreemap, TreemapNode } from '@/utils/treemap';
import { formatDollarAmount } from '@/utils/budget-utils';
import { ArrowLeft, ZoomIn, Layers, Building2 } from 'lucide-react';

interface InteractiveTreemapProps {
  departments: BudgetItem[];
  administrativeUnits: AdministrativeUnit[];
  onSelectBureau?: (bureau: BudgetItem) => void;
}

type GroupByMode = 'category' | 'jurisdiction';

const JURISDICTION_COLORS: Record<string, string> = {
  'portland-city': '#2563eb', // blue
  'multnomah-county': '#4f46e5', // indigo
  'portland-metro': '#0d9488', // teal
  'trimet-district': '#059669', // emerald
  'pps-district': '#d97706', // amber
};

export default function InteractiveTreemap({
  departments,
  administrativeUnits,
  onSelectBureau,
}: InteractiveTreemapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 900, height: 520 });

  const [groupBy, setGroupBy] = useState<GroupByMode>('category');
  const [spendingFilter, setSpendingFilter] = useState<SpendingFilter>('all');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<TreemapNode<BudgetItem | null> | null>(null);

  // Resize observer to make SVG treemap 100% fluid & responsive
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth || 900;
        const h = Math.max(480, Math.min(620, Math.round(w * 0.58)));
        setDimensions({ width: w, height: h });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Filter department value based on spendingFilter
  const getDeptValue = useCallback((dept: BudgetItem): number => {
    switch (spendingFilter) {
      case 'operating':
        return dept.operatingExpense !== undefined ? dept.operatingExpense : (dept.classification === 'operating' ? dept.totalExpense : 0);
      case 'capital':
        return dept.capitalExpense !== undefined ? dept.capitalExpense : (dept.classification === 'capital' ? dept.totalExpense : 0);
      case 'debt':
        return dept.debtExpense !== undefined ? dept.debtExpense : (dept.classification === 'debt' ? dept.totalExpense : 0);
      default:
        return dept.totalExpense;
    }
  }, [spendingFilter]);

  // Build hierarchy and calculate treemap layout
  const { treemapNodes, totalValue, currentGroupMeta } = useMemo(() => {
    const activeDepts = departments
      .map(d => ({ ...d, calculatedValue: getDeptValue(d) }))
      .filter(d => d.calculatedValue > 0);

    const totalVal = activeDepts.reduce((sum, d) => sum + d.calculatedValue, 0);

    if (selectedGroup) {
      // Zoomed into a specific group (Category or Jurisdiction)
      let groupBureaus: (BudgetItem & { calculatedValue: number })[] = [];
      let groupTitle = selectedGroup;
      let groupColor = '#3b82f6';

      if (groupBy === 'category') {
        groupBureaus = activeDepts.filter(d => d.functionalCategory === selectedGroup);
        const catMeta = FUNCTIONAL_CATEGORIES[selectedGroup];
        if (catMeta) {
          groupTitle = catMeta.name;
          groupColor = catMeta.color;
        }
      } else {
        groupBureaus = activeDepts.filter(d => d.administrativeUnitId === selectedGroup);
        const unit = administrativeUnits.find(u => u.id === selectedGroup);
        if (unit) {
          groupTitle = unit.name;
          groupColor = JURISDICTION_COLORS[selectedGroup] || '#4f46e5';
        }
      }

      const groupTotal = groupBureaus.reduce((sum, d) => sum + d.calculatedValue, 0);

      const rootNode: TreemapNode<BudgetItem | null> = {
        id: selectedGroup,
        name: groupTitle,
        value: groupTotal,
        data: null,
        children: groupBureaus.map(b => ({
          id: b.id,
          name: b.name,
          value: b.calculatedValue,
          color: groupBy === 'category'
            ? (JURISDICTION_COLORS[b.administrativeUnitId] || groupColor)
            : (FUNCTIONAL_CATEGORIES[b.functionalCategory || 'governance-support']?.color || groupColor),
          data: b,
        })),
      };

      const nodes = computeTreemap(rootNode, dimensions.width, dimensions.height, 3);
      return {
        treemapNodes: nodes,
        totalValue: totalVal,
        currentGroupMeta: { title: groupTitle, total: groupTotal, count: groupBureaus.length, color: groupColor },
      };
    }

    // Top-Level Hierarchy View
    if (groupBy === 'category') {
      const categoryMap = new Map<string, { value: number; count: number; fte: number }>();
      Object.keys(FUNCTIONAL_CATEGORIES).forEach(catId => {
        categoryMap.set(catId, { value: 0, count: 0, fte: 0 });
      });

      activeDepts.forEach(d => {
        const catId = d.functionalCategory || 'governance-support';
        const entry = categoryMap.get(catId) || { value: 0, count: 0, fte: 0 };
        entry.value += d.calculatedValue;
        entry.count += 1;
        entry.fte += d.authorizedFte || 0;
        categoryMap.set(catId, entry);
      });

      const rootNode: TreemapNode<BudgetItem | null> = {
        id: 'root',
        name: 'Portland Metro Public Budget',
        value: totalVal,
        data: null,
        children: Array.from(categoryMap.entries())
          .filter(([, v]) => v.value > 0)
          .map(([catId, v]) => {
            const meta = FUNCTIONAL_CATEGORIES[catId];
            return {
              id: catId,
              name: meta?.name || catId,
              value: v.value,
              color: meta?.color || '#64748b',
              data: null,
            };
          }),
      };

      const nodes = computeTreemap(rootNode, dimensions.width, dimensions.height, 4);
      return { treemapNodes: nodes, totalValue: totalVal, currentGroupMeta: null };
    } else {
      // Group by Jurisdiction
      const unitMap = new Map<string, { value: number; count: number }>();
      administrativeUnits.forEach(u => unitMap.set(u.id, { value: 0, count: 0 }));

      activeDepts.forEach(d => {
        const entry = unitMap.get(d.administrativeUnitId) || { value: 0, count: 0 };
        entry.value += d.calculatedValue;
        entry.count += 1;
        unitMap.set(d.administrativeUnitId, entry);
      });

      const rootNode: TreemapNode<BudgetItem | null> = {
        id: 'root',
        name: 'Portland Metro Public Budget',
        value: totalVal,
        data: null,
        children: Array.from(unitMap.entries())
          .filter(([, v]) => v.value > 0)
          .map(([uId, v]) => {
            const unit = administrativeUnits.find(u => u.id === uId);
            return {
              id: uId,
              name: unit?.name || uId,
              value: v.value,
              color: JURISDICTION_COLORS[uId] || '#3b82f6',
              data: null,
            };
          }),
      };

      const nodes = computeTreemap(rootNode, dimensions.width, dimensions.height, 4);
      return { treemapNodes: nodes, totalValue: totalVal, currentGroupMeta: null };
    }
  }, [departments, administrativeUnits, groupBy, selectedGroup, dimensions, getDeptValue]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {selectedGroup ? currentGroupMeta?.title : 'Regional Spending Treemap'}
            </h2>
            {selectedGroup && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Drill-down
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {selectedGroup
              ? `Showing ${currentGroupMeta?.count} bureaus totaling ${formatDollarAmount(currentGroupMeta?.total || 0, 2)} (${((currentGroupMeta?.total || 0) / (totalValue || 1) * 100).toFixed(1)}% of metro total)`
              : `Interactive proportional breakdown of all ${formatDollarAmount(totalValue, 2)} in public expenditures across the Portland region`}
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedGroup ? (
            <button
              onClick={() => setSelectedGroup(null)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Overview
            </button>
          ) : (
            <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 text-xs font-medium">
              <button
                onClick={() => setGroupBy('category')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  groupBy === 'category'
                    ? 'bg-white text-gray-900 shadow-sm font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 inline mr-1" />
                By Service Category
              </button>
              <button
                onClick={() => setGroupBy('jurisdiction')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  groupBy === 'jurisdiction'
                    ? 'bg-white text-gray-900 shadow-sm font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 inline mr-1" />
                By Jurisdiction
              </button>
            </div>
          )}

          {/* Spending Filter */}
          <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 text-xs font-medium">
            {(['all', 'operating', 'capital', 'debt'] as SpendingFilter[]).map(filter => (
              <button
                key={filter}
                onClick={() => setSpendingFilter(filter)}
                className={`px-2.5 py-1 rounded-md capitalize transition-all cursor-pointer ${
                  spendingFilter === filter
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Helper notice */}
      <div className="flex items-center justify-between text-xs text-gray-500 py-2.5 px-1">
        <span className="flex items-center gap-1.5">
          <ZoomIn className="w-3.5 h-3.5 text-blue-500" />
          {selectedGroup
            ? 'Click any bureau tile below to inspect mission, staffing & funding details'
            : 'Click any category or jurisdiction tile below to zoom into its individual bureaus'}
        </span>
        <span className="font-medium text-gray-700">
          Total View Volume: {formatDollarAmount(totalValue, 2)}
        </span>
      </div>

      {/* SVG Canvas Container */}
      <div ref={containerRef} className="relative w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-900/5">
        <svg
          width={dimensions.width}
          height={dimensions.height}
          className="w-full select-none"
          style={{ height: `${dimensions.height}px` }}
        >
          {treemapNodes.map(node => {
            const isHovered = hoveredNode?.id === node.id;
            const w = node.width || 0;
            const h = node.height || 0;
            const x = node.x || 0;
            const y = node.y || 0;
            const percentOfTotal = ((node.value / (totalValue || 1)) * 100).toFixed(1);

            // Hide text on extremely tiny tiles to prevent clutter
            const showTitle = w >= 55 && h >= 32;
            const showSub = w >= 80 && h >= 52;
            const showDetails = w >= 110 && h >= 75;

            return (
              <g
                key={node.id}
                transform={`translate(${x}, ${y})`}
                onClick={() => {
                  if (!selectedGroup) {
                    setSelectedGroup(node.id);
                  } else if (node.data && onSelectBureau) {
                    onSelectBureau(node.data);
                  }
                }}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer transition-all duration-150"
              >
                {/* Tile Background */}
                <rect
                  width={w}
                  height={h}
                  rx={6}
                  fill={node.color || '#3b82f6'}
                  fillOpacity={isHovered ? 0.95 : 0.85}
                  stroke="#ffffff"
                  strokeWidth={isHovered ? 2.5 : 1}
                  className="transition-all duration-150"
                  style={{
                    filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none',
                  }}
                />

                {/* Text Content */}
                {showTitle && (
                  <foreignObject width={w} height={h} pointerEvents="none">
                    <div className="p-2 h-full flex flex-col justify-between text-white overflow-hidden leading-tight">
                      <div>
                        <p className={`font-semibold line-clamp-2 ${w < 120 ? 'text-[11px]' : 'text-xs'}`}>
                          {node.name}
                        </p>
                        {showSub && (
                          <p className="font-bold text-sm tracking-tight mt-0.5 text-white/95">
                            {formatDollarAmount(node.value)}
                          </p>
                        )}
                      </div>

                      {showDetails && (
                        <div className="flex items-center justify-between text-[10px] text-white/80 border-t border-white/20 pt-1">
                          <span>{percentOfTotal}% of total</span>
                          {node.data?.authorizedFte && (
                            <span>{Math.round(node.data.authorizedFte)} FTE</span>
                          )}
                        </div>
                      )}
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredNode && (
          <div
            className="absolute pointer-events-none z-30 bg-gray-900 text-white rounded-xl shadow-xl p-3.5 text-xs max-w-xs transition-opacity duration-150 border border-gray-700"
            style={{
              left: Math.min(
                dimensions.width - 240,
                Math.max(10, (hoveredNode.x || 0) + (hoveredNode.width || 0) / 2 - 100)
              ),
              top: Math.min(
                dimensions.height - 140,
                Math.max(10, (hoveredNode.y || 0) + 15)
              ),
            }}
          >
            <p className="font-bold text-sm text-white mb-1">{hoveredNode.name}</p>
            <div className="flex items-baseline justify-between gap-3 text-emerald-400 font-semibold mb-2">
              <span className="text-base">{formatDollarAmount(hoveredNode.value, 2)}</span>
              <span className="text-gray-300">
                {((hoveredNode.value / (totalValue || 1)) * 100).toFixed(1)}% of Metro Budget
              </span>
            </div>

            {hoveredNode.data && (
              <div className="space-y-1 text-gray-300 border-t border-gray-800 pt-2">
                <p>
                  <strong className="text-gray-200">Jurisdiction:</strong> {hoveredNode.data.administrativeUnit}
                </p>
                {hoveredNode.data.authorizedFte && (
                  <p>
                    <strong className="text-gray-200">Staffing:</strong> {hoveredNode.data.authorizedFte} Authorized FTE
                  </p>
                )}
                {hoveredNode.data.operatingExpense !== undefined && (
                  <p>
                    <strong className="text-gray-200">Operating:</strong> {formatDollarAmount(hoveredNode.data.operatingExpense)}
                    {hoveredNode.data.capitalExpense ? ` | Capital: ${formatDollarAmount(hoveredNode.data.capitalExpense)}` : ''}
                  </p>
                )}
                {hoveredNode.data.description && (
                  <p className="text-[11px] text-gray-400 line-clamp-2 pt-1 border-t border-gray-800/80">
                    {hoveredNode.data.description}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category / Jurisdiction Quick Legend */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2 text-xs">
        {groupBy === 'category' && !selectedGroup ? (
          Object.values(FUNCTIONAL_CATEGORIES).map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedGroup(cat.id)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 hover:border-gray-300 bg-white text-gray-700 transition-colors cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="font-medium">{cat.shortName}</span>
            </button>
          ))
        ) : groupBy === 'jurisdiction' && !selectedGroup ? (
          administrativeUnits.map(unit => (
            <button
              key={unit.id}
              onClick={() => setSelectedGroup(unit.id)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 hover:border-gray-300 bg-white text-gray-700 transition-colors cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: JURISDICTION_COLORS[unit.id] }} />
              <span className="font-medium">{unit.name}</span>
            </button>
          ))
        ) : null}
      </div>
    </div>
  );
}
