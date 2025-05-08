'use client';

import { useState } from 'react';
import { AdministrativeUnit, BudgetItem, SpendingFilter } from '@/types/budget';
import BudgetBreakdownChart from './charts/BudgetBreakdownChart';
import SpendingFilterComponent from './SpendingFilter';

interface BudgetBreakdownSelectorProps {
  administrativeUnits: AdministrativeUnit[];
  departments: BudgetItem[];
}

export default function BudgetBreakdownSelector({
  administrativeUnits,
  departments
}: BudgetBreakdownSelectorProps) {
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [spendingFilter, setSpendingFilter] = useState<SpendingFilter>('all');

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
        const matchesUnit = dept.administrativeUnit.toLowerCase() === selectedUnit.name.toLowerCase() && !dept.parentId;
        
        // Apply spending filter
        if (!matchesUnit) return false;
        
        switch (spendingFilter) {
          case 'capital':
            return dept.classification === 'capital' || (dept.classification === 'mixed' && dept.capitalExpense);
          case 'operating':
            return dept.classification === 'operating' || (dept.classification === 'mixed' && dept.operatingExpense);
          default:
            return true;
        }
      })
    : [];

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
        <SpendingFilterComponent
          value={spendingFilter}
          onChange={setSpendingFilter}
        />
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
