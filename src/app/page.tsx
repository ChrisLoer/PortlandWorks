import BudgetPieChart from '@/components/charts/BudgetPieChart';
import PerCapitaBarChart from '@/components/charts/PerCapitaBarChart';
import FundingSourcesChart from '@/components/charts/FundingSourcesChart';
import sampleData from '@/data/sample-budget.json';
import { BudgetItem, AdministrativeUnit, CPIData } from '@/types/budget';

// Create a default administrative unit for Portland
const portlandCity: AdministrativeUnit = {
  id: 'portland-city',
  name: 'Portland',
  type: 'City',
  state: 'Oregon',
  population: 600000,
  year: 2024,
  notes: 'Estimated population for 2024',
  references: [
    {
      title: 'Portland Population Estimates',
      url: 'https://www.census.gov/quickfacts/portlandcityoregon'
    }
  ]
};

// Create sample CPI data
const sampleCPIData: CPIData = {
  lastUpdated: '2024-04-09',
  dataSource: 'Bureau of Labor Statistics',
  dataSourceUrl: 'https://www.bls.gov/cpi/',
  baseYear: 2024,
  annualData: [
    { year: 2024, value: 100, notes: 'Base year' },
    { year: 2023, value: 98, notes: 'Previous year' },
    { year: 2022, value: 96, notes: 'Two years ago' },
    { year: 2021, value: 94, notes: 'Three years ago' },
    { year: 2020, value: 92, notes: 'Four years ago' }
  ]
};

// Transform the sample data to match the BudgetItem type
const transformedDepartments: BudgetItem[] = sampleData.departments.map(dept => ({
  ...dept,
  administrativeUnitId: portlandCity.id
}));

export default function Home() {
  // Get top-level departments only
  const topLevelDepartments = transformedDepartments.filter(dept => dept.parentId === null);
  
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Portland Metro Budget Explorer</h1>
        <p className="text-gray-600 mb-8">
          Data source: <a href={sampleData.dataSourceUrl} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{sampleData.dataSource}</a>
          <span className="mx-2">|</span>
          Last updated: {sampleData.lastUpdated}
        </p>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Fiscal Year {sampleData.fiscalYear} Budget Overview</h2>
          <BudgetPieChart departments={transformedDepartments} showOnlyTopLevel={true} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Per Capita Expenses</h2>
            <p className="text-gray-600 mb-4">
              Comparing per capita expenses across departments helps understand how resources are allocated relative to population.
            </p>
            <PerCapitaBarChart 
              items={transformedDepartments}
              administrativeUnit={portlandCity}
              cpiData={sampleCPIData}
              showOnlyTopLevel={true}
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Funding Sources</h2>
            <p className="text-gray-600 mb-4">
              Distribution of funding sources across departments.
            </p>
            <FundingSourcesChart departments={transformedDepartments} showOnlyTopLevel={true} />
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Department Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topLevelDepartments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-xl font-semibold mb-2">{dept.name}</h3>
              <p className="text-gray-600 mb-2">{dept.description}</p>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <span className="text-sm text-gray-500">Total Expense</span>
                  <p className="text-lg font-medium">${(dept.totalExpense / 1000000).toFixed(1)}M</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Per Capita</span>
                  <p className="text-lg font-medium">${(dept.totalExpense / portlandCity.population).toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Revenue</span>
                  <p className="text-lg font-medium">${(dept.totalRevenue / 1000000).toFixed(1)}M</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">% of Total</span>
                  <p className="text-lg font-medium">{(dept.allocation * 100).toFixed(1)}%</p>
                </div>
              </div>
              
              <div className="mb-2">
                <span className="text-sm text-gray-500">Funding Sources:</span>
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
                  <span className="text-sm text-gray-500">Sub-departments:</span>
                  <ul className="list-disc list-inside text-sm mt-1">
                    {dept.children.map(childId => {
                      const child = transformedDepartments.find(d => d.id === childId);
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
                <div className="mt-2 text-sm text-gray-600 italic">
                  {dept.notes}
                </div>
              )}
              
              {dept.references && dept.references.length > 0 && (
                <div className="mt-2 text-sm">
                  <span className="text-gray-500">References:</span>
                  <ul className="list-disc list-inside mt-1">
                    {dept.references.map((ref, index) => (
                      <li key={index}>
                        <a href={ref.url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                          {ref.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
