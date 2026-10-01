'use client';

import React, { useState } from 'react';
import { BudgetItem } from '@/types/budget';
import { formatDollarAmount } from '@/utils/budget-utils';
import { Shield, Home, Bus, Droplets, ArrowRight } from 'lucide-react';

interface CrossAgencyDeepDiveProps {
  departments: BudgetItem[];
  onSelectBureau?: (bureau: BudgetItem) => void;
}

const SPOTLIGHT_SERVICES = [
  {
    id: 'public-safety',
    title: 'Public Safety & Emergency Response',
    tagline: 'Combining City Police, Fire, County Sheriff, DA, 911, and Transit Police',
    icon: Shield,
    color: '#3b82f6',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-900',
    description: 'Public safety is divided across jurisdictions: the City handles local police patrol, fire rescue, and 911 call taking; Multnomah County operates the jails, criminal prosecutions, and adult probation; and TriMet provides dedicated transit security.',
  },
  {
    id: 'housing-homelessness',
    title: 'Housing & Homelessness Services',
    tagline: 'How City, County, and Metro coordinate regional shelter and affordable housing',
    icon: Home,
    color: '#0d9488',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    textColor: 'text-teal-900',
    description: 'Homelessness and housing services are funded regionally through Metro’s Supportive Housing Services (SHS) tax and affordable housing bonds, then implemented through the City-County Joint Office of Homeless Services (JOHS) and Portland Housing Bureau.',
  },
  {
    id: 'transportation',
    title: 'Transportation & Mobility',
    tagline: 'City streets, Willamette bridges, and regional transit lines',
    icon: Bus,
    color: '#0284c7',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    textColor: 'text-sky-900',
    description: 'The City of Portland (PBOT) maintains 4,800+ lane miles of local streets and traffic signals; Multnomah County owns and operates the 6 historic Willamette River bridges; and TriMet operates the tri-county bus, MAX light rail, and streetcar systems.',
  },
  {
    id: 'utilities-climate',
    title: 'Environment, Water & Climate Action',
    tagline: 'Bull Run drinking water, sewage treatment, PCEF, and regional waste',
    icon: Droplets,
    color: '#10b981',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-900',
    description: 'Funded primarily through utility ratepayer revenue and clean energy surcharges rather than property taxes. The Water Bureau and BES operate critical capital infrastructure, while PCEF invests directly in community climate justice projects.',
  },
];

export default function CrossAgencyDeepDive({
  departments,
  onSelectBureau,
}: CrossAgencyDeepDiveProps) {
  const [activeServiceId, setActiveServiceId] = useState<string>('public-safety');

  const activeService = SPOTLIGHT_SERVICES.find(s => s.id === activeServiceId) || SPOTLIGHT_SERVICES[0];

  const serviceDepartments = departments
    .filter(d => d.functionalCategory === activeServiceId)
    .sort((a, b) => b.totalExpense - a.totalExpense);

  const totalExpense = serviceDepartments.reduce((sum, d) => sum + d.totalExpense, 0);
  const totalFte = serviceDepartments.reduce((sum, d) => sum + (d.authorizedFte || 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
      {/* Title & Service Selector Tabs */}
      <div className="pb-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Cross-Agency Service Deep Dives
        </h2>
        <p className="text-sm text-gray-500 mt-1 mb-5">
          Citizens experience public services as a whole, but funding and operations are split between multiple independent local governments. Explore how the agencies connect:
        </p>

        {/* Tab Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {SPOTLIGHT_SERVICES.map(service => {
            const Icon = service.icon;
            const isActive = activeServiceId === service.id;
            return (
              <button
                key={service.id}
                onClick={() => setActiveServiceId(service.id)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-600'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div
                  className="p-2 rounded-lg text-white shrink-0"
                  style={{ backgroundColor: service.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className={`font-semibold text-xs leading-tight truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                    {service.title}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Service Overview Banner */}
      <div className={`mt-6 p-5 rounded-2xl border ${activeService.bgColor} ${activeService.borderColor} mb-6`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Cross-Jurisdictional Spotlight
            </span>
            <h3 className="text-xl font-bold text-gray-900 mt-0.5">
              {activeService.title}
            </h3>
            <p className="text-xs text-gray-700 mt-1.5 leading-relaxed max-w-2xl">
              {activeService.description}
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0 bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-white">
            <div>
              <span className="text-[10px] font-semibold text-gray-500 uppercase">Combined Budget</span>
              <p className="text-xl font-bold text-gray-900">
                {formatDollarAmount(totalExpense, 2)}
              </p>
            </div>
            {totalFte > 0 && (
              <div className="border-l border-gray-200 pl-6">
                <span className="text-[10px] font-semibold text-gray-500 uppercase">Total Personnel</span>
                <p className="text-xl font-bold text-gray-900">
                  {Math.round(totalFte).toLocaleString()} <span className="text-xs font-normal text-gray-500">FTE</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Proportional Agency Bar */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Who Funds & Delivers This Service?
        </h4>
        <div className="h-4 w-full rounded-full overflow-hidden flex bg-gray-100 shadow-inner">
          {serviceDepartments.map(dept => {
            const pct = (dept.totalExpense / (totalExpense || 1)) * 100;
            return (
              <div
                key={dept.id}
                style={{ width: `${pct}%` }}
                className="hover:opacity-90 transition-opacity"
                title={`${dept.name} (${dept.administrativeUnit}): ${formatDollarAmount(dept.totalExpense)} (${pct.toFixed(1)}%)`}
              />
            );
          })}
        </div>
      </div>

      {/* Constituent Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {serviceDepartments.map(dept => {
          const pct = ((dept.totalExpense / (totalExpense || 1)) * 100).toFixed(1);
          return (
            <div
              key={dept.id}
              onClick={() => onSelectBureau && onSelectBureau(dept)}
              className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xs bg-white transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 hover:text-blue-600 transition-colors">
                      {dept.name}
                    </h4>
                    <span className="inline-block mt-0.5 text-[11px] font-medium text-gray-600">
                      {dept.administrativeUnit}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm text-gray-900">
                      {formatDollarAmount(dept.totalExpense, 1)}
                    </p>
                    <span className="text-[10px] text-gray-500">
                      {pct}% of category
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-3">
                  {dept.description}
                </p>

                {dept.keyPrograms && dept.keyPrograms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {dept.keyPrograms.slice(0, 3).map((prog, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-700"
                      >
                        {prog}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-3 text-[11px]">
                  {dept.authorizedFte ? (
                    <span className="font-medium text-gray-700">
                      {dept.authorizedFte} FTE
                    </span>
                  ) : null}
                  <span className="capitalize text-gray-500">
                    {dept.classification || 'operating'}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-blue-600 font-semibold text-[11px] hover:underline">
                  View details <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
