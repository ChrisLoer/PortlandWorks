'use client';

import React, { useState, useMemo } from 'react';
import { TAX_DISTRIBUTION_ITEMS, FUNCTIONAL_CATEGORIES } from '@/data/categories';
import {
  DollarSign,
  GraduationCap,
  Shield,
  HeartPulse,
  Trees,
  BookOpen,
  Home,
  Bus,
  Scale,
  Landmark,
  Building2,
  Award,
  Compass,
  HeartHandshake,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  GraduationCap,
  Shield,
  HeartPulse,
  Trees,
  BookOpen,
  Home,
  Bus,
  Scale,
  Landmark,
  Building2,
  Award,
  Compass,
  HeartHandshake,
};

const PRESETS = [
  { label: 'Condo / Starter', amount: 3600 },
  { label: 'Portland Median', amount: 6800 },
  { label: 'Above Average', amount: 10500 },
  { label: 'High Value', amount: 16000 },
];

export default function TaxDollarCalculator() {
  const [taxAmount, setTaxAmount] = useState<number>(6800);
  const [showExplainer, setShowExplainer] = useState<boolean>(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  const calculatedItems = useMemo(() => {
    return TAX_DISTRIBUTION_ITEMS.map(item => {
      const personalDollars = taxAmount * item.sharePercent;
      const catMeta = FUNCTIONAL_CATEGORIES[item.category];
      return {
        ...item,
        personalDollars,
        monthlyDollars: personalDollars / 12,
        categoryMeta: catMeta,
      };
    });
  }, [taxAmount]);

  const jurisdictionTotals = useMemo(() => {
    const totals: Record<string, number> = {
      'Portland Public Schools & Education': 0,
      'City of Portland': 0,
      'Multnomah County': 0,
      'Metro Regional Government': 0,
      'Other Regional / City Services': 0,
    };

    calculatedItems.forEach(item => {
      if (item.jurisdiction.includes('Schools') || item.jurisdiction.includes('PCC')) {
        totals['Portland Public Schools & Education'] += item.personalDollars;
      } else if (item.jurisdiction === 'City of Portland') {
        totals['City of Portland'] += item.personalDollars;
      } else if (item.jurisdiction === 'Multnomah County') {
        totals['Multnomah County'] += item.personalDollars;
      } else if (item.jurisdiction === 'Metro') {
        totals['Metro Regional Government'] += item.personalDollars;
      } else {
        totals['Other Regional / City Services'] += item.personalDollars;
      }
    });

    return totals;
  }, [calculatedItems]);

  const filteredItems = useMemo(() => {
    if (activeCategoryFilter === 'all') return calculatedItems;
    return calculatedItems.filter(item => item.category === activeCategoryFilter);
  }, [calculatedItems, activeCategoryFilter]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <DollarSign className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Where Does My Tax Dollar Go?
            </h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Enter your annual property tax bill to see an exact estimated personal dollar breakdown across schools, emergency rescue, roads, health clinics, and parks.
          </p>
        </div>

        {/* Input & Presets */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Your Annual Tax:</span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input
                type="number"
                min="500"
                max="100000"
                step="100"
                value={taxAmount}
                onChange={e => setTaxAmount(Math.max(0, Number(e.target.value)))}
                aria-label="Annual property tax amount"
                className="w-36 pl-7 pr-3 py-1.5 text-right font-bold text-base text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {PRESETS.map(preset => (
              <button
                key={preset.amount}
                onClick={() => setTaxAmount(preset.amount)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  taxAmount === preset.amount
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {preset.label} (${preset.amount.toLocaleString()})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* High-Level Jurisdiction Summary Bar */}
      <div className="py-6 border-b border-gray-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          Agency Distribution Breakdown
        </h3>
        {/* Stacked Proportional Bar */}
        <div className="h-6 w-full rounded-xl overflow-hidden flex shadow-inner bg-gray-100 mb-3">
          <div
            style={{ width: `${(jurisdictionTotals['Portland Public Schools & Education'] / taxAmount) * 100}%` }}
            className="bg-amber-500 hover:opacity-90 transition-opacity"
            title={`Schools & Colleges: $${Math.round(jurisdictionTotals['Portland Public Schools & Education']).toLocaleString()}`}
          />
          <div
            style={{ width: `${(jurisdictionTotals['City of Portland'] / taxAmount) * 100}%` }}
            className="bg-blue-600 hover:opacity-90 transition-opacity"
            title={`City of Portland: $${Math.round(jurisdictionTotals['City of Portland']).toLocaleString()}`}
          />
          <div
            style={{ width: `${(jurisdictionTotals['Multnomah County'] / taxAmount) * 100}%` }}
            className="bg-indigo-600 hover:opacity-90 transition-opacity"
            title={`Multnomah County: $${Math.round(jurisdictionTotals['Multnomah County']).toLocaleString()}`}
          />
          <div
            style={{ width: `${(jurisdictionTotals['Metro Regional Government'] / taxAmount) * 100}%` }}
            className="bg-teal-500 hover:opacity-90 transition-opacity"
            title={`Metro: $${Math.round(jurisdictionTotals['Metro Regional Government']).toLocaleString()}`}
          />
          <div
            style={{ width: `${(jurisdictionTotals['Other Regional / City Services'] / taxAmount) * 100}%` }}
            className="bg-sky-500 hover:opacity-90 transition-opacity"
            title={`Bridges & Infrastructure: $${Math.round(jurisdictionTotals['Other Regional / City Services']).toLocaleString()}`}
          />
        </div>

        {/* Agency Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-[11px] font-semibold text-amber-800">Schools & Higher Ed</span>
            <p className="text-xl font-bold text-amber-950 mt-0.5">
              ${Math.round(jurisdictionTotals['Portland Public Schools & Education']).toLocaleString()}
            </p>
            <span className="text-[10px] text-amber-700">41.8% of bill</span>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <span className="text-[11px] font-semibold text-blue-800">City of Portland</span>
            <p className="text-xl font-bold text-blue-950 mt-0.5">
              ${Math.round(jurisdictionTotals['City of Portland']).toLocaleString()}
            </p>
            <span className="text-[10px] text-blue-700">29.5% of bill</span>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
            <span className="text-[11px] font-semibold text-indigo-800">Multnomah County</span>
            <p className="text-xl font-bold text-indigo-950 mt-0.5">
              ${Math.round(jurisdictionTotals['Multnomah County']).toLocaleString()}
            </p>
            <span className="text-[10px] text-indigo-700">18.1% of bill</span>
          </div>

          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
            <span className="text-[11px] font-semibold text-teal-800">Metro Government</span>
            <p className="text-xl font-bold text-teal-950 mt-0.5">
              ${Math.round(jurisdictionTotals['Metro Regional Government']).toLocaleString()}
            </p>
            <span className="text-[10px] text-teal-700">4.0% of bill</span>
          </div>

          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 col-span-2 md:col-span-1">
            <span className="text-[11px] font-semibold text-sky-800">Bridges & Local</span>
            <p className="text-xl font-bold text-sky-950 mt-0.5">
              ${Math.round(jurisdictionTotals['Other Regional / City Services']).toLocaleString()}
            </p>
            <span className="text-[10px] text-sky-700">6.6% of bill</span>
          </div>
        </div>
      </div>

      {/* Service-by-Service Personal Breakdown */}
      <div className="pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Detailed Line-Item Contributions
            </h3>
            <p className="text-xs text-gray-500">
              Where your annual contribution of ${taxAmount.toLocaleString()} goes each year and month.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1 text-xs">
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                activeCategoryFilter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Services
            </button>
            {Object.values(FUNCTIONAL_CATEGORIES).map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                  activeCategoryFilter === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.shortName}
              </button>
            ))}
          </div>
        </div>

        {/* List of items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredItems.map(item => {
            const IconComponent = ICON_MAP[item.icon] || Landmark;
            const pct = (item.sharePercent * 100).toFixed(1);

            return (
              <div
                key={item.id}
                className="flex items-start gap-3.5 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-blue-200 hover:shadow-xs transition-all"
              >
                <div
                  className="p-2.5 rounded-xl shrink-0 text-white"
                  style={{ backgroundColor: item.categoryMeta?.color || '#3b82f6' }}
                >
                  <IconComponent className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 leading-snug">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700">
                          {item.jurisdiction}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {pct}% of tax bill
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-base text-gray-900">
                        ${Math.round(item.personalDollars).toLocaleString()}
                        <span className="text-xs font-normal text-gray-500">/yr</span>
                      </p>
                      <p className="text-[11px] text-gray-500">
                        ${(item.monthlyDollars).toFixed(2)}/mo
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Measure 5 & 50 Explainer Accordion */}
      <div className="mt-8 pt-5 border-t border-gray-100">
        <button
          onClick={() => setShowExplainer(!showExplainer)}
          className="w-full flex items-center justify-between text-left text-xs font-semibold text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-500" />
            How do Oregon property tax laws (Measure 5 & 50) affect what you pay?
          </span>
          {showExplainer ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {showExplainer && (
          <div className="mt-3 p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-950 space-y-2 leading-relaxed">
            <p>
              <strong>Assessed Value (AV) vs Real Market Value (RMV):</strong> In Oregon, constitutional Measure 50 passed in 1997 rolled back assessed values to 1995 levels minus 10% and capped annual assessed value growth at 3% per year (unless major improvements or construction occur). Because market values grew much faster than 3% over the last 25 years, typical homes in Portland have an Assessed Value that is often 40% to 60% of their actual Real Market Value.
            </p>
            <p>
              <strong>Measure 5 Limits:</strong> Passed in 1990, Measure 5 limits general government taxes to $10 per $1,000 of RMV, and education taxes to $5 per $1,000 of RMV. Voter-approved capital bonds are exempt from these limits. When the calculated tax rate exceeds these thresholds, taxes are reduced in a process called <em>compression</em>.
            </p>
            <p className="text-blue-800 text-[11px] pt-1">
              Data source: Multnomah County Division of Assessment, Recording, and Taxation (DART) & Tax Supervising and Conservation Commission (TSCC) Annual Reports.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
