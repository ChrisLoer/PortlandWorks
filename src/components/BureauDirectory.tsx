'use client';

import React, { useState, useMemo } from 'react';
import { BudgetItem, AdministrativeUnit, SpendingFilter } from '@/types/budget';
import { FUNCTIONAL_CATEGORIES } from '@/data/categories';
import { formatDollarAmount } from '@/utils/budget-utils';
import {
  Search,
  ArrowUpDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface BureauDirectoryProps {
  departments: BudgetItem[];
  administrativeUnits: AdministrativeUnit[];
  onSelectBureau: (bureau: BudgetItem) => void;
}

type SortOption = 'budget-desc' | 'budget-asc' | 'fte-desc' | 'name-asc';

export default function BureauDirectory({
  departments,
  administrativeUnits,
  onSelectBureau,
}: BureauDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSpending, setSelectedSpending] = useState<SpendingFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('budget-desc');

  const filteredDepartments = useMemo(() => {
    return departments
      .filter(dept => {
        // Search term check
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchesName = dept.name.toLowerCase().includes(q);
          const matchesDesc = dept.description?.toLowerCase().includes(q);
          const matchesAdmin = dept.administrativeUnit.toLowerCase().includes(q);
          const matchesPrograms = dept.keyPrograms?.some(p => p.toLowerCase().includes(q));
          const matchesFunding = dept.fundingSources?.some(f => f.toLowerCase().includes(q));
          if (!matchesName && !matchesDesc && !matchesAdmin && !matchesPrograms && !matchesFunding) {
            return false;
          }
        }

        // Jurisdiction filter
        if (selectedUnit !== 'all' && dept.administrativeUnitId !== selectedUnit) {
          return false;
        }

        // Functional category filter
        if (selectedCategory !== 'all' && dept.functionalCategory !== selectedCategory) {
          return false;
        }

        // Spending filter
        if (selectedSpending !== 'all') {
          if (selectedSpending === 'operating' && dept.classification === 'capital') return false;
          if (selectedSpending === 'capital' && dept.classification === 'operating') return false;
          if (selectedSpending === 'debt' && dept.classification !== 'debt') return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case 'budget-desc':
            return b.totalExpense - a.totalExpense;
          case 'budget-asc':
            return a.totalExpense - b.totalExpense;
          case 'fte-desc':
            return (b.authorizedFte || 0) - (a.authorizedFte || 0);
          case 'name-asc':
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
  }, [departments, searchTerm, selectedUnit, selectedCategory, selectedSpending, sortOption]);

  const totalFilteredExpense = useMemo(() => {
    return filteredDepartments.reduce((sum, d) => sum + d.totalExpense, 0);
  }, [filteredDepartments]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
      {/* Header */}
      <div className="pb-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Public Agency & Bureau Directory
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Search across all 51 bureaus, divisions, and functions in the Portland metropolitan region. Filter by service category, jurisdiction, or keyword.
        </p>

        {/* Search & Filter Bar */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-6">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by bureau, service (e.g. 'police', 'potholes', 'pension', 'library', 'climate')..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              aria-label="Filter by Service Category"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Service Categories</option>
              {Object.values(FUNCTIONAL_CATEGORIES).map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.shortName}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-3">
            <div className="relative">
              <ArrowUpDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={sortOption}
                onChange={e => setSortOption(e.target.value as SortOption)}
                aria-label="Sort departments"
                className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="budget-desc">Highest Budget First</option>
                <option value="budget-asc">Lowest Budget First</option>
                <option value="fte-desc">Largest Staffing (FTE)</option>
                <option value="name-asc">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Controls Row: Spending Types & Jurisdictions */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Jurisdiction Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-semibold text-gray-400 uppercase tracking-wider text-[10px] mr-1">
              Jurisdiction:
            </span>
            <button
              onClick={() => setSelectedUnit('all')}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                selectedUnit === 'all'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Governments ({departments.length})
            </button>
            {administrativeUnits.map(unit => {
              const count = departments.filter(d => d.administrativeUnitId === unit.id).length;
              const isSelected = selectedUnit === unit.id;
              return (
                <button
                  key={unit.id}
                  onClick={() => setSelectedUnit(unit.id)}
                  className={`px-3 py-1 rounded-full font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {unit.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Spending Filter Buttons */}
          <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 text-xs font-medium self-start sm:self-auto">
            {(['all', 'operating', 'capital', 'debt'] as SpendingFilter[]).map(filter => (
              <button
                key={filter}
                onClick={() => setSelectedSpending(filter)}
                className={`px-2.5 py-1 rounded-md capitalize transition-all ${
                  selectedSpending === filter
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Meta */}
      <div className="flex items-center justify-between text-xs text-gray-500 py-4 px-1">
        <span>
          Showing <strong className="text-gray-800">{filteredDepartments.length}</strong> of{' '}
          {departments.length} departments
        </span>
        <span>
          Combined Volume: <strong className="text-gray-800">{formatDollarAmount(totalFilteredExpense, 2)}</strong>
        </span>
      </div>

      {/* Department Cards Grid */}
      {filteredDepartments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Sparkles className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h4 className="text-base font-semibold text-gray-700">No departments match your filters</h4>
          <p className="text-xs text-gray-500 mt-1">Try clearing your search term or selecting &quot;All Governments&quot;.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedUnit('all');
              setSelectedCategory('all');
              setSelectedSpending('all');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDepartments.map(dept => {
            const catMeta = dept.functionalCategory ? FUNCTIONAL_CATEGORIES[dept.functionalCategory] : null;

            return (
              <div
                key={dept.id}
                onClick={() => onSelectBureau(dept)}
                className="group p-5 rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-md bg-white transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 truncate">
                      {dept.administrativeUnit}
                    </span>

                    {catMeta && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full truncate ${catMeta.badgeBg}`}>
                        {catMeta.shortName}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-base text-gray-900 group-hover:text-blue-600 transition-colors leading-snug mb-1.5">
                    {dept.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                    {dept.description || 'Public service bureau delivering critical regional programs and services.'}
                  </p>
                </div>

                <div>
                  {/* Key Program Tags */}
                  {dept.keyPrograms && dept.keyPrograms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {dept.keyPrograms.slice(0, 2).map((prog, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100 text-gray-600 truncate max-w-full"
                        >
                          {prog}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bottom Stats & Action */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase">Annual Budget</span>
                      <p className="font-bold text-sm text-gray-900">
                        {formatDollarAmount(dept.totalExpense, 1)}
                      </p>
                    </div>

                    {dept.authorizedFte ? (
                      <div className="text-right">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase">Staffing</span>
                        <p className="font-bold text-sm text-gray-700">
                          {Math.round(dept.authorizedFte)} <span className="text-[11px] font-normal text-gray-500">FTE</span>
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        Details <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
