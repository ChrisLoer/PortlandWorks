import { BudgetItem, AdministrativeUnit, CPIData, BudgetData, AdministrativeUnitsData } from '@/types/budget';
import { promises as fs } from 'fs';
import path from 'path';
import MainContent from '@/components/MainContent';

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

async function getAdministrativeUnits(): Promise<AdministrativeUnitsData> {
  try {
    const filePath = path.join(process.cwd(), 'src/data/administrative-units.json');
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading administrative units data:', error);
    throw new Error('Failed to load administrative units data');
  }
}

async function getBudgetData(): Promise<BudgetData> {
  try {
    // Get the absolute path to the parsed_budgets directory
    const budgetsDir = path.join(process.cwd(), 'src/data/parsed_budgets');
    
    // Read all files in the directory
    const files = await fs.readdir(budgetsDir);
    
    // Filter for JSON files
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    // Read and parse each JSON file
    const budgets: BudgetData[] = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(budgetsDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content);
      })
    );
    
    // Combine all budgets into a single data structure
    return {
      fiscalYear: budgets[0].fiscalYear, // Use the first budget's fiscal year
      lastUpdated: new Date().toISOString().split('T')[0],
      dataSource: 'Combined Budget Data',
      dataSourceUrl: '',
      departments: budgets.flatMap(budget => budget.departments)
    };
  } catch (error) {
    console.error('Error loading budget data:', error);
    throw new Error('Failed to load budget data');
  }
}

async function getCapitalVsOperatingData() {
  try {
    const filePath = path.join(process.cwd(), 'src/data/capital-vs-operating.json');
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading capital vs operating data:', error);
    return { departments: [] };
  }
}

export default async function Home() {
  const [budgetData, adminUnitsData, capitalVsOperatingData] = await Promise.all([
    getBudgetData(),
    getAdministrativeUnits(),
    getCapitalVsOperatingData()
  ]);
  
  // Transform the departments to match the BudgetItem type and merge with capital/operating data
  const transformedDepartments: BudgetItem[] = budgetData.departments.map((dept: any) => {
    const capitalVsOperating = capitalVsOperatingData.departments.find(
      (d: any) => d.id === dept.id
    );
    
    return {
      ...dept,
      administrativeUnitId: dept.administrativeUnit.toLowerCase().replace(/\s+/g, '-'),
      classification: capitalVsOperating?.classification,
      operatingExpense: capitalVsOperating?.operatingExpense,
      capitalExpense: capitalVsOperating?.capitalExpense
    };
  });
  
  // Get top-level departments only
  const topLevelDepartments = transformedDepartments.filter(dept => dept.parentId === null);
  
  // Group departments by administrative unit
  const departmentsByAdminUnit = topLevelDepartments.reduce((acc, dept) => {
    const adminUnit = dept.administrativeUnit;
    if (!acc[adminUnit]) {
      acc[adminUnit] = [];
    }
    acc[adminUnit].push(dept);
    return acc;
  }, {} as Record<string, BudgetItem[]>);

  return (
    <MainContent
      budgetData={budgetData}
      adminUnitsData={adminUnitsData}
      transformedDepartments={transformedDepartments}
      topLevelDepartments={topLevelDepartments}
      departmentsByAdminUnit={departmentsByAdminUnit}
      sampleCPIData={sampleCPIData}
    />
  );
}
