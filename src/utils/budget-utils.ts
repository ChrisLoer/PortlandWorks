import { BudgetItem, AdministrativeUnit, CPIData } from '@/types/budget';

/**
 * Adjusts a dollar amount from one year to another using CPI data
 * @param amount The dollar amount to adjust
 * @param fromYear The year the amount is from
 * @param toYear The year to adjust to (defaults to 2024)
 * @param cpiData The CPI data to use for adjustment
 * @returns The adjusted dollar amount
 */
export function adjustForInflation(
  amount: number,
  fromYear: number,
  toYear: number = 2024,
  cpiData: CPIData
): number {
  // Find the CPI values for the from and to years
  const fromYearData = cpiData.annualData.find(data => data.year === fromYear);
  const toYearData = cpiData.annualData.find(data => data.year === toYear);
  
  if (!fromYearData || !toYearData) {
    console.warn(`CPI data not found for year ${fromYear} or ${toYear}`);
    return amount; // Return original amount if data not found
  }
  
  // Calculate the adjustment factor
  const adjustmentFactor = toYearData.value / fromYearData.value;
  
  // Apply the adjustment
  return amount * adjustmentFactor;
}

/**
 * Calculates the per capita expense for a budget item
 * @param item The budget item
 * @param administrativeUnit The administrative unit with population data
 * @returns The per capita expense
 */
export function calculatePerCapitaExpense(
  item: BudgetItem,
  administrativeUnit: AdministrativeUnit
): number {
  if (administrativeUnit.population <= 0) {
    console.warn(`Invalid population for ${administrativeUnit.name}`);
    return 0;
  }
  
  return item.totalExpense / administrativeUnit.population;
}

/**
 * Calculates the per capita expense for a budget item with inflation adjustment
 * @param item The budget item
 * @param administrativeUnit The administrative unit with population data
 * @param cpiData The CPI data to use for adjustment
 * @returns The per capita expense in 2024 dollars
 */
export function calculateAdjustedPerCapitaExpense(
  item: BudgetItem,
  administrativeUnit: AdministrativeUnit,
  cpiData: CPIData
): number {
  // First adjust the expense for inflation
  const adjustedExpense = adjustForInflation(
    item.totalExpense,
    item.year,
    2024,
    cpiData
  );
  
  // Then calculate per capita
  if (administrativeUnit.population <= 0) {
    console.warn(`Invalid population for ${administrativeUnit.name}`);
    return 0;
  }
  
  return adjustedExpense / administrativeUnit.population;
}

/**
 * Formats a dollar amount with appropriate suffix (K, M, B)
 * @param amount The dollar amount
 * @param decimals Number of decimal places to show
 * @returns Formatted string
 */
export function formatDollarAmount(amount: number, decimals: number = 1): string {
  if (amount >= 1e9) {
    return `$${(amount / 1e9).toFixed(decimals)}B`;
  } else if (amount >= 1e6) {
    return `$${(amount / 1e6).toFixed(decimals)}M`;
  } else if (amount >= 1e3) {
    return `$${(amount / 1e3).toFixed(decimals)}K`;
  } else {
    return `$${amount.toFixed(decimals)}`;
  }
}

/**
 * Formats a per capita dollar amount
 * @param amount The per capita dollar amount
 * @param decimals Number of decimal places to show
 * @returns Formatted string
 */
export function formatPerCapitaAmount(amount: number, decimals: number = 2): string {
  return `$${amount.toFixed(decimals)}`;
} 
