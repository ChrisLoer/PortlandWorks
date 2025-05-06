'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { BudgetItem, AdministrativeUnit, CPIData } from '@/types/budget';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PerCapitaDonutChartProps {
  departments: BudgetItem[];
  administrativeUnits: AdministrativeUnit[];
  cpiData: CPIData;
}

export default function PerCapitaDonutChart({
  departments,
  administrativeUnits,
  cpiData
}: PerCapitaDonutChartProps) {
  // Group departments by administrative unit
  const departmentsByAdminUnit = departments.reduce((acc, dept) => {
    const adminUnit = dept.administrativeUnit;
    if (!acc[adminUnit]) {
      acc[adminUnit] = [];
    }
    acc[adminUnit].push(dept);
    return acc;
  }, {} as Record<string, BudgetItem[]>);

  // Calculate per capita spending for each administrative unit
  const adminUnitData = administrativeUnits
    .filter(unit => {
      // Only include units that have budget data
      if (unit.name === 'Portland') {
        return departmentsByAdminUnit['City']?.length > 0;
      }
      if (unit.name === 'Portland Metro') {
        return departmentsByAdminUnit['Metro']?.length > 0;
      }
      return departmentsByAdminUnit[unit.name]?.length > 0;
    })
    .map(unit => {
      let unitDepartments: BudgetItem[];
      if (unit.name === 'Portland') {
        unitDepartments = departmentsByAdminUnit['City'] || [];
      } else if (unit.name === 'Portland Metro') {
        unitDepartments = departmentsByAdminUnit['Metro'] || [];
      } else {
        unitDepartments = departmentsByAdminUnit[unit.name] || [];
      }

      const totalExpense = unitDepartments.reduce((sum, dept) => sum + dept.totalExpense, 0);
      const perCapitaExpense = totalExpense / unit.population;

      return {
        unit,
        perCapitaExpense,
        totalExpense
      };
    })
    .sort((a, b) => b.perCapitaExpense - a.perCapitaExpense);

  // Calculate total per capita spending across all units
  const totalPerCapitaSpending = adminUnitData.reduce((sum, data) => sum + data.perCapitaExpense, 0);

  // Prepare data for the chart
  const data = {
    labels: adminUnitData.map(data => data.unit.name),
    datasets: [
      {
        data: adminUnitData.map(data => data.perCapitaExpense),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: `Total Per Capita Spending: $${totalPerCapitaSpending.toFixed(2)}`,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            const percentage = ((value / totalPerCapitaSpending) * 100).toFixed(1);
            return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '50%',
  };

  return (
    <div className="w-full h-full min-h-[400px]">
      <Doughnut data={data} options={options} />
    </div>
  );
} 
