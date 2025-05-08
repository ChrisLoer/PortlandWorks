import { BudgetItem, BudgetData, AdministrativeUnitsData } from '@/types/budget';
import { promises as fs } from 'fs';
import path from 'path';
import MainContent from '@/components/MainContent';

export const dynamic = 'force-static';


async function getAdministrativeUnits(): Promise<AdministrativeUnitsData> {
  try {
    const filePath = path.join(process.cwd(), 'public/api/administrative-units.json');
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading administrative units data:', error);
    throw new Error('Failed to load administrative units data');
  }
}

async function getBudgetData(): Promise<BudgetData> {
  try {
    const filePath = path.join(process.cwd(), 'public/api/budgets.json');
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading budget data:', error);
    throw new Error('Failed to load budget data');
  }
}

async function getCapitalVsOperatingData() {
  try {
    const filePath = path.join(process.cwd(), 'public/api/capital-vs-operating.json');
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
  const transformedDepartments: BudgetItem[] = budgetData.departments.map((dept: BudgetItem) => {
    const capitalVsOperating = capitalVsOperatingData.departments.find(
      (d: { id: string; classification?: string; operatingExpense?: number; capitalExpense?: number }) => d.id === dept.id
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

  return (
    <MainContent
      budgetData={budgetData}
      adminUnitsData={adminUnitsData}
      transformedDepartments={transformedDepartments}
      topLevelDepartments={topLevelDepartments}
    />
  );
}
