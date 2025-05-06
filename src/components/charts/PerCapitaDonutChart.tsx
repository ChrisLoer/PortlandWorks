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
          'rgba(220, 53, 69, 0.7)',    // Darker red
          'rgba(13, 110, 253, 0.7)',   // Darker blue
          'rgba(255, 193, 7, 0.7)',    // Darker yellow
          'rgba(25, 135, 84, 0.7)',    // Darker green
          'rgba(111, 66, 193, 0.7)',   // Darker purple
        ],
        borderColor: [
          'rgb(220, 53, 69)',          // Solid red
          'rgb(13, 110, 253)',         // Solid blue
          'rgb(255, 193, 7)',          // Solid yellow
          'rgb(25, 135, 84)',          // Solid green
          'rgb(111, 66, 193)',         // Solid purple
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
        labels: {
          color: 'rgb(55, 65, 81)',    // text-gray-700
          font: {
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: `Total Per Capita Spending: $${totalPerCapitaSpending.toFixed(2)}`,
        color: 'rgb(55, 65, 81)',      // text-gray-700
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            const percentage = ((value / totalPerCapitaSpending) * 100).toFixed(1);
            return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
          }
        },
        titleColor: 'rgb(55, 65, 81)',  // text-gray-700
        bodyColor: 'rgb(55, 65, 81)',   // text-gray-700
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgb(209, 213, 219)', // border-gray-300
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        boxPadding: 6
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
