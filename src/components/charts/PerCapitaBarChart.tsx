'use client';

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, TooltipItem } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BudgetItem, AdministrativeUnit, CPIData } from '@/types/budget';
import { calculateAdjustedPerCapitaExpense, formatPerCapitaAmount } from '@/utils/budget-utils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface PerCapitaBarChartProps {
  items: BudgetItem[];
  administrativeUnit: AdministrativeUnit;
  cpiData: CPIData;
  showOnlyTopLevel?: boolean;
  title?: string;
}

export default function PerCapitaBarChart({
  items,
  administrativeUnit,
  cpiData,
  showOnlyTopLevel = true,
  title = 'Per Capita Expenses by Department'
}: PerCapitaBarChartProps) {
  // Filter for top-level departments if requested
  const filteredItems = showOnlyTopLevel
    ? items.filter(item => !item.parentId)
    : items;

  // Calculate per capita expenses and sort by value
  const sortedItems = [...filteredItems]
    .map(item => ({
      ...item,
      perCapitaExpense: calculateAdjustedPerCapitaExpense(item, administrativeUnit, cpiData)
    }))
    .sort((a, b) => b.perCapitaExpense - a.perCapitaExpense);

  const data = {
    labels: sortedItems.map(item => item.name),
    datasets: [
      {
        label: `Per Capita Expense (${administrativeUnit.name}, 2024 dollars)`,
        data: sortedItems.map(item => item.perCapitaExpense),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'bar'>) {
            const value = context.raw as number;
            return formatPerCapitaAmount(value);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Dollars per capita (2024)'
        }
      }
    }
  };

  return (
    <div className="w-full h-full min-h-[400px]">
      <Bar data={data} options={options} />
    </div>
  );
} 
