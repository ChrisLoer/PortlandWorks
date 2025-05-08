'use client';

import { useState } from 'react';
import { AdministrativeUnit, BudgetItem } from '@/types/budget';
import BudgetBreakdownChart from './charts/BudgetBreakdownChart';

interface BudgetBreakdownSelectorProps {
  administrativeUnits: AdministrativeUnit[];
  departments: BudgetItem[];
}

export default function BudgetBreakdownSelector({
  administrativeUnits,
  departments
}: BudgetBreakdownSelectorProps) {
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');

  const selectedUnit = administrativeUnits.find(unit => unit.id === selectedUnitId);
  const selectedDepartments = selectedUnit
    ? departments.filter(dept => {
        // Special case for Portland City
        if (selectedUnit.name === 'Portland' && dept.administrativeUnit === 'City') {
          return true;
        }
        // Special case for Portland Metro
        if (selectedUnit.name === 'Portland Metro' && dept.administrativeUnit === 'Metro') {
          return true;
        }
        // Default case
        return dept.administrativeUnit.toLowerCase() === selectedUnit.name.toLowerCase() && !dept.parentId;
      })
    : [];

  // Calculate total spending for selected departments
  const totalSpending = selectedDepartments.reduce((sum, dept) => {
    if (dept.classification === 'capital' && dept.capitalExpense) {
      return sum + dept.capitalExpense;
    }
    if (dept.classification === 'operating' && dept.operatingExpense) {
      return sum + dept.operatingExpense;
    }
    if (dept.classification === 'mixed') {
      if (dept.capitalExpense && dept.operatingExpense) {
        return sum + dept.capitalExpense + dept.operatingExpense;
      }
      if (dept.capitalExpense) {
        return sum + dept.capitalExpense;
      }
      if (dept.operatingExpense) {
        return sum + dept.operatingExpense;
      }
    }
    return sum + dept.totalExpense;
  }, 0);

  return (
    <div>
      <select 
        className="w-full p-2 border rounded mb-4"
        value={selectedUnitId}
        onChange={(e) => setSelectedUnitId(e.target.value)}
      >
        <option value="">Select an administrative unit...</option>
        {administrativeUnits.map(unit => (
          <option key={unit.id} value={unit.id}>
            {unit.name} ({unit.type})
          </option>
        ))}
      </select>
      
      {selectedUnit && (
        <div className="text-lg font-semibold mb-2 text-gray-900 text-center">
          Total Spending: ${totalSpending.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
      )}
      
      {selectedUnit && selectedDepartments.length > 0 ? (
        <BudgetBreakdownChart 
          departments={selectedDepartments}
          administrativeUnit={selectedUnit}
        />
      ) : selectedUnitId ? (
        <div className="text-gray-600 text-center py-8">
          No budget data available for this administrative unit.
        </div>
      ) : (
        <div className="text-gray-600 text-center py-8">
          Select an administrative unit to view its budget breakdown.
        </div>
      )}
    </div>
  );
} 
