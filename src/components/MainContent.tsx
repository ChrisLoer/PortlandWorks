'use client';

import React, { useState, useMemo } from 'react';
import { BudgetItem, BudgetData, AdministrativeUnitsData, SpendingFilter as SpendingFilterType } from '@/types/budget';
import InteractiveTreemap from '@/components/InteractiveTreemap';
import TaxDollarCalculator from '@/components/TaxDollarCalculator';
import CrossAgencyDeepDive from '@/components/CrossAgencyDeepDive';
import WorkforceExplorer from '@/components/WorkforceExplorer';
import BureauDirectory from '@/components/BureauDirectory';
import BureauDetailModal from '@/components/BureauDetailModal';
import PerCapitaMultiDonutChart from '@/components/charts/PerCapitaMultiDonutChart';
import FundingSourcesChart from '@/components/charts/FundingSourcesChart';
import BudgetBreakdownSelector from '@/components/BudgetBreakdownSelector';
import SpendingFilter from '@/components/SpendingFilter';
import { formatDollarAmount } from '@/utils/budget-utils';
import {
  LayoutDashboard,
  Calculator,
  Compass,
  Users,
  Search,
  PieChart,
  ExternalLink,
  Building2,
} from 'lucide-react';

interface MainContentProps {
  budgetData: BudgetData;
  adminUnitsData: AdministrativeUnitsData;
  transformedDepartments: BudgetItem[];
  topLevelDepartments: BudgetItem[];
}

type ActiveTab = 'treemap' | 'calculator' | 'spotlights' | 'workforce' | 'directory' | 'classic';

export default function MainContent({
  budgetData,
  adminUnitsData,
  transformedDepartments,
  topLevelDepartments,
}: MainContentProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('treemap');
  const [selectedBureau, setSelectedBureau] = useState<BudgetItem | null>(null);
  const [classicSpendingFilter, setClassicSpendingFilter] = useState<SpendingFilterType>('all');

  // Overall totals
  const totalExpenditure = useMemo(() => {
    return transformedDepartments.reduce((sum, d) => sum + d.totalExpense, 0);
  }, [transformedDepartments]);

  const totalFte = useMemo(() => {
    return transformedDepartments.reduce((sum, d) => sum + (d.authorizedFte || 0), 0);
  }, [transformedDepartments]);

  // Classic view filtered departments
  const filteredTopLevelDepartments = useMemo(() => {
    return topLevelDepartments.filter(dept => {
      switch (classicSpendingFilter) {
        case 'capital':
          return dept.classification === 'capital' || (dept.classification === 'mixed' && dept.capitalExpense);
        case 'operating':
          return dept.classification === 'operating' || (dept.classification === 'mixed' && dept.operatingExpense);
        case 'debt':
          return dept.classification === 'debt';
        default:
          return true;
      }
    });
  }, [topLevelDepartments, classicSpendingFilter]);

  const filteredTransformedDepartments = useMemo(() => {
    return transformedDepartments.filter(dept => {
      switch (classicSpendingFilter) {
        case 'capital':
          return dept.classification === 'capital' || (dept.classification === 'mixed' && dept.capitalExpense);
        case 'operating':
          return dept.classification === 'operating' || (dept.classification === 'mixed' && dept.operatingExpense);
        case 'debt':
          return dept.classification === 'debt';
        default:
          return true;
      }
    });
  }, [transformedDepartments, classicSpendingFilter]);

  return (
    <div className="min-h-screen bg-slate-50/70 text-gray-900 flex flex-col justify-between">
      {/* Top Banner & Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
                  <Building2 className="w-5 h-5" />
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-950">
                  Portland Works
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 tracking-wide uppercase">
                  Budget Explorer
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Visualizing public revenues, budgets, and workforce across Portland’s 5 overlapping governments.
              </p>
            </div>

            {/* Quick Stat Pill Strip */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0 overflow-x-auto pb-1 md:pb-0">
              <div className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-left">
                <span className="text-[10px] uppercase font-bold text-gray-400 block leading-tight">Combined Budget</span>
                <span className="text-sm font-black text-gray-900">{formatDollarAmount(totalExpenditure, 2)}</span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-left">
                <span className="text-[10px] uppercase font-bold text-gray-400 block leading-tight">Public Workforce</span>
                <span className="text-sm font-black text-gray-900">{Math.round(totalFte).toLocaleString()} FTE</span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-left">
                <span className="text-[10px] uppercase font-bold text-gray-400 block leading-tight">Governments</span>
                <span className="text-sm font-black text-gray-900">5 Taxing Bodies</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 border-t border-gray-100 pt-2 text-xs font-semibold no-scrollbar">
            <button
              onClick={() => setActiveTab('treemap')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'treemap'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Spending Treemap</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Tax Dollar Calculator</span>
            </button>

            <button
              onClick={() => setActiveTab('spotlights')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'spotlights'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Cross-Agency Spotlights</span>
            </button>

            <button
              onClick={() => setActiveTab('workforce')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'workforce'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Workforce & Staffing</span>
            </button>

            <button
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'directory'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Bureau Directory ({transformedDepartments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('classic')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'classic'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>Per-Capita & Charts</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Dynamic Tab Views */}
        {activeTab === 'treemap' && (
          <div>
            <InteractiveTreemap
              departments={transformedDepartments}
              administrativeUnits={adminUnitsData.units}
              onSelectBureau={dept => setSelectedBureau(dept)}
            />
          </div>
        )}

        {activeTab === 'calculator' && (
          <div>
            <TaxDollarCalculator />
          </div>
        )}

        {activeTab === 'spotlights' && (
          <div>
            <CrossAgencyDeepDive
              departments={transformedDepartments}
              onSelectBureau={dept => setSelectedBureau(dept)}
            />
          </div>
        )}

        {activeTab === 'workforce' && (
          <div>
            <WorkforceExplorer
              departments={transformedDepartments}
              administrativeUnits={adminUnitsData.units}
              onSelectBureau={dept => setSelectedBureau(dept)}
            />
          </div>
        )}

        {activeTab === 'directory' && (
          <div>
            <BureauDirectory
              departments={transformedDepartments}
              administrativeUnits={adminUnitsData.units}
              onSelectBureau={dept => setSelectedBureau(dept)}
            />
          </div>
        )}

        {activeTab === 'classic' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Per-Capita Comparisons</h2>
              <p className="text-sm text-gray-600 mb-6">
                Normalize public spending by population across the City (635k), County (815k), Metro (1.8M), TriMet (1.8M), and PPS (600k district / 44k students).
              </p>
              <div className="mb-6">
                <SpendingFilter value={classicSpendingFilter} onChange={setClassicSpendingFilter} />
              </div>
              <PerCapitaMultiDonutChart
                departments={filteredTopLevelDepartments}
                administrativeUnits={adminUnitsData.units}
                filter={classicSpendingFilter === 'all' ? undefined : classicSpendingFilter}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Total Budget Breakdown</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Select an administrative unit to explore its internal departmental shares.
                </p>
                <BudgetBreakdownSelector
                  administrativeUnits={adminUnitsData.units}
                  departments={filteredTransformedDepartments}
                />
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Funding Sources</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Distribution of revenue streams across regional bureaus and programs.
                </p>
                <FundingSourcesChart
                  departments={filteredTransformedDepartments}
                  showOnlyTopLevel={true}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bureau Detail Modal */}
      {selectedBureau && (
        <BureauDetailModal
          bureau={selectedBureau}
          onClose={() => setSelectedBureau(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 text-xs text-gray-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-700">
              Portland Works • An Open-Source Civic Data & Budget Exploration Project
            </p>
            <p className="mt-1 text-gray-500">
              Compiled from FY {budgetData.fiscalYear} Adopted Budgets (last updated: {budgetData.lastUpdated}) across City of Portland, Multnomah County, Metro, TriMet, and Portland Public Schools.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://www.tsccmultco.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              <span>TSCC Multnomah</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://github.com/ChrisLoer/PortlandWorks"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
