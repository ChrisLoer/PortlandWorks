export interface Reference {
  title: string;
  url: string;
}

export type FunctionalCategoryId =
  | 'public-safety'
  | 'housing-homelessness'
  | 'transportation'
  | 'utilities-climate'
  | 'education-youth'
  | 'community-culture'
  | 'health-human-services'
  | 'governance-support';

export interface FunctionalCategoryMeta {
  id: FunctionalCategoryId;
  name: string;
  shortName: string;
  description: string;
  color: string;
  textColor: string;
  borderColor: string;
  bgColor: string;
  badgeBg: string;
  icon: string;
}

export interface AdministrativeUnit {
  id: string;
  name: string;
  shortName?: string;
  type: string;
  state: string;
  population: number;
  year: number;
  notes: string;
  badgeColor?: string;
  references: Reference[];
  headcount?: number;
  totalBudget?: number;
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

export type SpendingFilter = 'all' | 'capital' | 'operating' | 'debt';

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
  functionalCategory?: FunctionalCategoryId;
  parentId: string | null;
  children: string[];
  fundingSources: string[];
  notes: string;
  references: Reference[];
  allocation: number;
  description: string;
  metrics?: BudgetMetric[];
  classification?: 'operating' | 'capital' | 'mixed' | 'debt';
  operatingExpense?: number;
  capitalExpense?: number;
  debtExpense?: number;
  authorizedFte?: number;
  keyPrograms?: string[];
  highlightStats?: { label: string; value: string }[];
}

export interface BudgetData {
  fiscalYear: string;
  lastUpdated: string;
  dataSource: string;
  dataSourceUrl: string;
  departments: BudgetItem[];
}

export interface TaxDistributionItem {
  id: string;
  name: string;
  jurisdiction: string;
  category: FunctionalCategoryId;
  sharePercent: number; // e.g. 0.145 for 14.5%
  description: string;
  icon: string;
}
