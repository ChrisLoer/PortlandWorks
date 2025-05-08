'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, TooltipItem } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { BudgetItem } from '@/types/budget';

ChartJS.register(ArcElement, Tooltip, Legend);

interface BudgetPieChartProps {
  departments: BudgetItem[];
  showOnlyTopLevel?: boolean;
}

export default function BudgetPieChart({ departments, showOnlyTopLevel = true }: BudgetPieChartProps) {
  // Filter to show only top-level departments if requested
  const displayDepartments = showOnlyTopLevel 
    ? departments.filter(dept => dept.parentId === null)
    : departments;

  const data = {
    labels: displayDepartments.map(dept => dept.name),
    datasets: [
      {
        data: displayDepartments.map(dept => dept.totalExpense),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
        ],
        borderColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
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
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'pie'>) => {
            const label = context.label || '';
            const value = context.raw as number || 0;
            const total = displayDepartments.reduce((acc, dept) => acc + dept.totalExpense, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: $${(value / 1000000).toFixed(1)}M (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Pie data={data} options={options} />
    </div>
  );
} 
