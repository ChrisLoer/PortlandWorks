'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, TooltipItem, TooltipModel } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { BudgetItem, AdministrativeUnit } from '@/types/budget';

ChartJS.register(ArcElement, Tooltip, Legend);

interface BudgetBreakdownChartProps {
  departments: BudgetItem[];
  administrativeUnit: AdministrativeUnit;
}

export default function BudgetBreakdownChart({
  departments,
  administrativeUnit
}: BudgetBreakdownChartProps) {
  // Calculate total budget based on classification
  const totalBudget = departments.reduce((sum, dept) => {
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
  
  // Prepare data for the chart
  const data = {
    labels: departments.map(dept => dept.name),
    datasets: [
      {
        data: departments.map(dept => {
          if (dept.classification === 'capital' && dept.capitalExpense) {
            return dept.capitalExpense;
          }
          if (dept.classification === 'operating' && dept.operatingExpense) {
            return dept.operatingExpense;
          }
          if (dept.classification === 'mixed') {
            if (dept.capitalExpense && dept.operatingExpense) {
              return dept.capitalExpense + dept.operatingExpense;
            }
            if (dept.capitalExpense) {
              return dept.capitalExpense;
            }
            if (dept.operatingExpense) {
              return dept.operatingExpense;
            }
          }
          return dept.totalExpense;
        }),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(199, 199, 199, 0.5)',
          'rgba(83, 102, 255, 0.5)',
          'rgba(40, 159, 64, 0.5)',
          'rgba(210, 199, 199, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)',
          'rgba(40, 159, 64, 1)',
          'rgba(210, 199, 199, 1)',
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
        text: `${administrativeUnit.name} Total Budget: $${(totalBudget / 1000000).toFixed(1)}M`,
      },
      tooltip: {
        callbacks: {
          label: function(this: TooltipModel<'pie'>, tooltipItem: TooltipItem<'pie'>) {
            const value = tooltipItem.raw as number;
            const percentage = ((value / totalBudget) * 100).toFixed(1);
            return `${tooltipItem.label}: $${(value / 1000000).toFixed(1)}M (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="w-full h-full min-h-[400px]">
      <Pie data={data} options={options} />
    </div>
  );
} 
