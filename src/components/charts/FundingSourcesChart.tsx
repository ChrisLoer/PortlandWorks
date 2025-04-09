'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { BudgetItem } from '@/types/budget';

ChartJS.register(ArcElement, Tooltip, Legend);

interface FundingSourcesChartProps {
  departments: BudgetItem[];
  showOnlyTopLevel?: boolean;
}

export default function FundingSourcesChart({ departments, showOnlyTopLevel = true }: FundingSourcesChartProps) {
  // Filter to show only top-level departments if requested
  const displayDepartments = showOnlyTopLevel 
    ? departments.filter(dept => dept.parentId === null)
    : departments;

  // Collect all unique funding sources
  const allFundingSources = new Set<string>();
  displayDepartments.forEach(dept => {
    dept.fundingSources.forEach(source => {
      allFundingSources.add(source);
    });
  });

  // Count departments using each funding source
  const fundingSourceCounts = Array.from(allFundingSources).map(source => {
    const count = displayDepartments.filter(dept => 
      dept.fundingSources.includes(source)
    ).length;
    return { source, count };
  });

  // Sort by count (descending)
  fundingSourceCounts.sort((a, b) => b.count - a.count);

  const data = {
    labels: fundingSourceCounts.map(item => item.source),
    datasets: [
      {
        data: fundingSourceCounts.map(item => item.count),
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
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = fundingSourceCounts.reduce((acc, item) => acc + item.count, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} departments (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Doughnut data={data} options={options} />
    </div>
  );
} 
