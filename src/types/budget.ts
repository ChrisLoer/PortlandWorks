export interface Reference {
  title: string;
  url: string;
}

export interface AdministrativeUnit {
  id: string;
  name: string;
  type: string;
  state: string;
  population: number;
  year: number;
  notes: string;
  references: Reference[];
}

export interface AdministrativeUnitsData {
  lastUpdated: string;
  dataSource: string;
  dataSourceUrl: string;
  units: AdministrativeUnit[];
}

export interface CPIDataPoint {
  year: number;
  value: number;
  notes: string;
}

export interface CPIData {
  lastUpdated: string;
  dataSource: string;
  dataSourceUrl: string;
  baseYear: number;
  annualData: CPIDataPoint[];
}

export interface BudgetMetric {
  id?: string;
  name: string;
  value: string | number;
  unit?: string;
  category?: string;
  description?: string;
  source?: string;
}

export interface BudgetItem {
  id: string;
  name: string;
  administrativeUnit: string;
  administrativeUnitId: string;
  cityName: string;
  totalExpense: number;
  totalRevenue: number;
  year: number;
  grouping: string;
  parentId: string | null;
  children: string[];
  fundingSources: string[];
  notes: string;
  references: Reference[];
  allocation: number;
  description: string;
  metrics?: BudgetMetric[];
}

export interface BudgetData {
  fiscalYear: string;
  lastUpdated: string;
  dataSource: string;
  dataSourceUrl: string;
  departments: BudgetItem[];
} 
