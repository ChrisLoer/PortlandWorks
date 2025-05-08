'use client';

import { useState } from 'react';
import { BudgetItem, CPIData, BudgetData, AdministrativeUnitsData, SpendingFilter as SpendingFilterType } from '@/types/budget';
import PerCapitaMultiDonutChart from '@/components/charts/PerCapitaMultiDonutChart';
import FundingSourcesChart from '@/components/charts/FundingSourcesChart';
import BudgetBreakdownSelector from '@/components/BudgetBreakdownSelector';
import SpendingFilter from '@/components/SpendingFilter';

interface MainContentProps {
  budgetData: BudgetData;
  adminUnitsData: AdministrativeUnitsData;
  transformedDepartments: BudgetItem[];
  topLevelDepartments: BudgetItem[];
  departmentsByAdminUnit: Record<string, BudgetItem[]>;
  sampleCPIData: CPIData;
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function MainContent({ 
  budgetData, 
  adminUnitsData, 
  transformedDepartments, 
  topLevelDepartments, 
  departmentsByAdminUnit,
  sampleCPIData 
}: MainContentProps) {
  const [spendingFilter, setSpendingFilter] = useState<SpendingFilterType>('all');

  // Filter departments based on spending type
  const filteredTopLevelDepartments = topLevelDepartments.filter(dept => {
    switch (spendingFilter) {
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

  const filteredTransformedDepartments = transformedDepartments.filter(dept => {
    switch (spendingFilter) {
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

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">Portland Metro Budget Explorer</h1>
        <p className="text-gray-700 mb-8">
          Data source: <a href={budgetData.dataSourceUrl} className="text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">{budgetData.dataSource}</a>
          <span className="mx-2">|</span>
          Last updated: {budgetData.lastUpdated}
        </p>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <SpendingFilter value={spendingFilter} onChange={setSpendingFilter} />
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Per Capita Spending by Administrative Unit</h2>
          <PerCapitaMultiDonutChart 
            departments={filteredTopLevelDepartments}
            administrativeUnits={adminUnitsData.units}
            cpiData={sampleCPIData}
            filter={spendingFilter === 'all' ? undefined : spendingFilter}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Total Budget by Administrative Unit</h2>
            <p className="text-gray-700 mb-4">
              Select an administrative unit to view its total budget breakdown.
            </p>
            <BudgetBreakdownSelector 
              administrativeUnits={adminUnitsData.units}
              departments={filteredTransformedDepartments}
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Funding Sources</h2>
            <p className="text-gray-700 mb-4">
              Distribution of funding sources across departments.
            </p>
            <FundingSourcesChart departments={filteredTransformedDepartments} showOnlyTopLevel={true} />
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Department Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTopLevelDepartments.map((dept, idx) => {
            const adminUnit = adminUnitsData.units.find(unit => {
              if (unit.name === 'Portland' && dept.administrativeUnit === 'City') {
                return true;
              }
              if (unit.name === 'Portland Metro' && dept.administrativeUnit === 'Metro') {
                return true;
              }
              return unit.name.toLowerCase() === dept.administrativeUnit.toLowerCase();
            });
            if (!adminUnit) return null;
            
            return (
              <div key={`${dept.id}-${idx}`} id={slugify(dept.name)} className="bg-white rounded-lg shadow p-4">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{dept.name}</h3>
                <p className="text-gray-700 mb-2">{dept.description}</p>
                <div className="mb-2 text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">Administrative Unit:</span> {adminUnit.name}
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div>
                    <span className="text-sm text-gray-700">Total Expense</span>
                    <p className="text-lg font-medium text-gray-900">${(dept.totalExpense / 1000000).toFixed(1)}M</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-700">Per Capita</span>
                    <p className="text-lg font-medium text-gray-900">${(dept.totalExpense / adminUnit.population).toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-700">Revenue</span>
                    <p className="text-lg font-medium text-gray-900">${(dept.totalRevenue / 1000000).toFixed(1)}M</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-700">% of Total</span>
                    <p className="text-lg font-medium text-gray-900">{(dept.allocation * 100).toFixed(1)}%</p>
                  </div>
                </div>
                {dept.classification && (
                  <div className="mb-2 text-sm text-gray-600">
                    <span className="font-semibold text-gray-800">Classification:</span> {dept.classification}
                    {dept.operatingExpense && (
                      <span className="ml-2">
                        (Operating: ${(dept.operatingExpense / 1000000).toFixed(1)}M)
                      </span>
                    )}
                    {dept.capitalExpense && (
                      <span className="ml-2">
                        (Capital: ${(dept.capitalExpense / 1000000).toFixed(1)}M)
                      </span>
                    )}
                  </div>
                )}
                <div className="mb-2">
                  <span className="text-sm text-gray-700">Funding Sources:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {dept.fundingSources.map((source, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
                {dept.children.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-700">Sub-departments:</span>
                    <ul className="list-disc list-inside text-sm mt-1">
                      {dept.children.map(childId => {
                        const child = filteredTransformedDepartments.find(d => d.id === childId);
                        return child ? (
                          <li key={childId} className="text-gray-700">
                            {child.name} (${(child.totalExpense / 1000000).toFixed(1)}M)
                          </li>
                        ) : null;
                      })}
                    </ul>
                  </div>
                )}
                {dept.notes && (
                  <div className="mt-2 text-sm text-gray-700 italic">
                    {dept.notes}
                  </div>
                )}
                {dept.references && dept.references.length > 0 && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-700">References:</span>
                    <ul className="list-disc list-inside mt-1">
                      {dept.references.map((ref, index) => (
                        <li key={index}>
                          <a href={ref.url} className="text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">
                            {ref.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {dept.metrics && dept.metrics.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-700 font-semibold">Metrics:</span>
                    <table className="min-w-full mt-1 text-sm border rounded">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-2 py-1 text-left font-medium text-gray-700">Name</th>
                          <th className="px-2 py-1 text-left font-medium text-gray-700">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dept.metrics.map((metric, i) => (
                          <tr key={metric.id || i} className="border-t">
                            <td className="px-2 py-1 text-gray-800">{metric.name}</td>
                            <td className="px-2 py-1 text-gray-800">{metric.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
} 
