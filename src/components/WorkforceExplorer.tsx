'use client';

import React, { useMemo, useState } from 'react';
import { BudgetItem, AdministrativeUnit } from '@/types/budget';
import { FUNCTIONAL_CATEGORIES } from '@/data/categories';
import {
  Users,
  Building2,
} from 'lucide-react';

interface WorkforceExplorerProps {
  departments: BudgetItem[];
  administrativeUnits: AdministrativeUnit[];
  onSelectBureau?: (bureau: BudgetItem) => void;
}

export default function WorkforceExplorer({
  departments,
  administrativeUnits,
  onSelectBureau,
}: WorkforceExplorerProps) {
  const [activeTab, setActiveTab] = useState<'agency' | 'function'>('agency');

  // Total FTE across all agencies
  const totalFte = useMemo(() => {
    return departments.reduce((sum, d) => sum + (d.authorizedFte || 0), 0);
  }, [departments]);

  // Aggregate by agency
  const agencyStaffing = useMemo(() => {
    return administrativeUnits.map(unit => {
      const unitDepts = departments.filter(d => d.administrativeUnitId === unit.id);
      const fte = unitDepts.reduce((sum, d) => sum + (d.authorizedFte || 0), 0);
      const totalBudget = unitDepts.reduce((sum, d) => sum + d.totalExpense, 0);
      return {
        unit,
        fte: fte || unit.headcount || 0,
        totalBudget,
        depts: unitDepts.sort((a, b) => (b.authorizedFte || 0) - (a.authorizedFte || 0)),
      };
    }).sort((a, b) => b.fte - a.fte);
  }, [departments, administrativeUnits]);

  // Aggregate by functional category
  const functionStaffing = useMemo(() => {
    const map = new Map<string, { fte: number; budget: number; count: number }>();
    Object.keys(FUNCTIONAL_CATEGORIES).forEach(k => {
      map.set(k, { fte: 0, budget: 0, count: 0 });
    });

    departments.forEach(d => {
      const cat = d.functionalCategory || 'governance-support';
      const entry = map.get(cat) || { fte: 0, budget: 0, count: 0 };
      entry.fte += d.authorizedFte || 0;
      entry.budget += d.totalExpense;
      entry.count += 1;
      map.set(cat, entry);
    });

    return Array.from(map.entries())
      .map(([catId, data]) => ({
        catId,
        meta: FUNCTIONAL_CATEGORIES[catId],
        ...data,
      }))
      .sort((a, b) => b.fte - a.fte);
  }, [departments]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Public Workforce & Staffing (FTE)
            </h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Behind the budget dollars are over 23,700 authorized full-time equivalent public employees serving Portland every day.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 text-xs font-medium">
          <button
            onClick={() => setActiveTab('agency')}
            className={`px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'agency'
                ? 'bg-white text-gray-900 shadow-sm font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 inline mr-1" />
            By Government Agency
          </button>
          <button
            onClick={() => setActiveTab('function')}
            className={`px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'function'
                ? 'bg-white text-gray-900 shadow-sm font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 inline mr-1" />
            By Service Area
          </button>
        </div>
      </div>

      {/* High-Level Overview Metrics */}
      <div className="py-6 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
          <span className="text-[11px] font-semibold text-gray-500 uppercase">Total Regional Workforce</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {Math.round(totalFte).toLocaleString()} <span className="text-xs font-normal text-gray-500">FTE</span>
          </p>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Across 5 local taxing bodies</span>
        </div>

        <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
          <span className="text-[11px] font-semibold text-orange-700 uppercase">Teachers & School Staff</span>
          <p className="text-2xl font-bold text-orange-950 mt-1">
            5,995 <span className="text-xs font-normal text-orange-700">FTE</span>
          </p>
          <span className="text-[11px] text-orange-700 mt-0.5 block">25.3% of public workers</span>
        </div>

        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
          <span className="text-[11px] font-semibold text-blue-700 uppercase">First Responders & Safety</span>
          <p className="text-2xl font-bold text-blue-950 mt-1">
            3,863 <span className="text-xs font-normal text-blue-700">FTE</span>
          </p>
          <span className="text-[11px] text-blue-700 mt-0.5 block">Police, Fire, 911, Sheriff, Courts</span>
        </div>

        <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
          <span className="text-[11px] font-semibold text-purple-700 uppercase">Health & Social Services</span>
          <p className="text-2xl font-bold text-purple-950 mt-1">
            2,808 <span className="text-xs font-normal text-purple-700">FTE</span>
          </p>
          <span className="text-[11px] text-purple-700 mt-0.5 block">Nurses, social workers, case managers</span>
        </div>
      </div>

      {/* Tab 1: By Agency */}
      {activeTab === 'agency' && (
        <div className="pt-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-900">
            Workforce by Governing Body
          </h3>

          <div className="space-y-4">
            {agencyStaffing.map(item => {
              const pct = ((item.fte / (totalFte || 1)) * 100).toFixed(1);
              return (
                <div
                  key={item.unit.id}
                  className="p-5 rounded-2xl border border-gray-200 bg-white shadow-2xs hover:border-blue-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <h4 className="text-base font-bold text-gray-900">
                        {item.unit.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {item.unit.type} • Serves {item.unit.population.toLocaleString()} residents
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xl font-bold text-gray-900">
                        {Math.round(item.fte).toLocaleString()} <span className="text-xs font-normal text-gray-500">FTE</span>
                      </p>
                      <span className="text-xs font-medium text-blue-600">
                        {pct}% of region’s public workers
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden mb-4">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Top Bureaus by Headcount */}
                  <div className="pt-3 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                      Largest Departments by Staffing:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {item.depts.slice(0, 3).map(dept => (
                        <div
                          key={dept.id}
                          onClick={() => onSelectBureau && onSelectBureau(dept)}
                          className="p-2.5 rounded-lg bg-gray-50 hover:bg-blue-50/50 cursor-pointer border border-gray-100 transition-colors flex items-center justify-between"
                        >
                          <span className="text-xs font-semibold text-gray-800 truncate mr-2">
                            {dept.name}
                          </span>
                          <span className="text-xs font-bold text-gray-900 shrink-0">
                            {Math.round(dept.authorizedFte || 0)} FTE
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: By Function */}
      {activeTab === 'function' && (
        <div className="pt-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-900">
            Workforce by Functional Service Area
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {functionStaffing.map(item => {
              const pct = ((item.fte / (totalFte || 1)) * 100).toFixed(1);
              return (
                <div
                  key={item.catId}
                  className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-blue-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.meta?.color || '#3b82f6' }}
                      />
                      <h4 className="font-bold text-sm text-gray-900">
                        {item.meta?.name}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-base text-gray-900">
                        {Math.round(item.fte).toLocaleString()} <span className="text-xs font-normal text-gray-500">FTE</span>
                      </p>
                      <span className="text-[11px] text-gray-500">
                        {pct}% of workforce
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-3">
                    {item.meta?.description}
                  </p>

                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.meta?.color || '#3b82f6',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
