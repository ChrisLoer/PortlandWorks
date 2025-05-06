"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { BudgetItem, AdministrativeUnit, CPIData } from "@/types/budget";
import { useMemo } from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

const ADMIN_UNIT_COLORS = [
  "#e63946", // red
  "#457b9d", // blue
  "#f4a261", // orange
  "#2a9d8f", // teal
  "#a29bfe", // purple
  "#ffb703", // yellow
  "#8d99ae", // gray
];

function shadeColor(color: string, percent: number) {
  let f = parseInt(color.slice(1), 16),
    t = percent < 0 ? 0 : 255,
    p = percent < 0 ? percent * -1 : percent,
    R = f >> 16,
    G = (f >> 8) & 0x00ff,
    B = f & 0x0000ff;
  return (
    "#" +
    (
      0x1000000 +
      (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 +
      (Math.round((t - B) * p) + B)
    )
      .toString(16)
      .slice(1)
  );
}

interface PerCapitaMultiDonutChartProps {
  departments: BudgetItem[];
  administrativeUnits: AdministrativeUnit[];
  cpiData: CPIData;
}

export default function PerCapitaMultiDonutChart({
  departments,
  administrativeUnits,
  cpiData,
}: PerCapitaMultiDonutChartProps) {
  // Memoize data prep for performance
  const { adminUnitLabels, adminUnitData, adminUnitColors, bureauLabels, bureauData, bureauColors, bureauParents, totalPerCapita } = useMemo(() => {
    // Build admin unit per-capita spending
    const adminUnitMap = administrativeUnits.map((unit, i) => {
      const bureaus = departments.filter((dept) => {
        if (unit.name === "Portland" && dept.administrativeUnit === "City") return true;
        if (unit.name === "Portland Metro" && dept.administrativeUnit === "Metro") return true;
        return dept.administrativeUnit.toLowerCase() === unit.name.toLowerCase();
      });
      const color = ADMIN_UNIT_COLORS[i % ADMIN_UNIT_COLORS.length];
      const value = bureaus.reduce((sum, dept) => sum + dept.totalExpense / unit.population, 0);
      return {
        name: unit.name,
        value,
        color,
        bureaus: bureaus.map((dept, j) => ({
          name: dept.name,
          value: dept.totalExpense / unit.population,
          color: shadeColor(color, 0.4 + 0.2 * (j % 3)),
        })),
      };
    }).filter(unit => unit.bureaus.length > 0);
    // Flatten bureaus for outer ring
    const bureauList = adminUnitMap.flatMap((unit) =>
      unit.bureaus.map((b) => ({
        ...b,
        parent: unit.name,
        parentColor: unit.color,
      }))
    );
    // Total per capita spending
    const totalPerCapita = adminUnitMap.reduce((sum, unit) => sum + unit.value, 0);
    return {
      adminUnitLabels: adminUnitMap.map((u) => u.name),
      adminUnitData: adminUnitMap.map((u) => u.value),
      adminUnitColors: adminUnitMap.map((u) => u.color),
      bureauLabels: bureauList.map((b) => b.name),
      bureauData: bureauList.map((b) => b.value),
      bureauColors: bureauList.map((b) => b.color),
      bureauParents: bureauList.map((b) => b.parent),
      totalPerCapita,
    };
  }, [departments, administrativeUnits]);

  const data = {
    labels: adminUnitLabels,
    datasets: [
      {
        label: "Admin Units",
        data: adminUnitData,
        backgroundColor: adminUnitColors,
        borderWidth: 1,
        hoverOffset: 8,
        labels: adminUnitLabels,
      },
      {
        label: "Bureaus",
        data: bureauData,
        backgroundColor: bureauColors,
        borderWidth: 1,
        hoverOffset: 8,
        labels: bureauLabels,
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: "60%",
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "rgb(55, 65, 81)",
          font: { size: 14 },
          generateLabels: (chart: any) => {
            const dataset = chart.data.datasets[0];
            return chart.data.labels.map((label: string, i: number) => ({
              text: label,
              fillStyle: dataset.backgroundColor[i],
              strokeStyle: dataset.backgroundColor[i],
              index: i,
            }));
          },
        },
      },
      title: {
        display: true,
        text: `Total Per Capita Spending: $${totalPerCapita.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        color: "rgb(55, 65, 81)",
        font: { size: 18, weight: "bold" as const },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const dataset = context.dataset;
            const labelArr = dataset.labels || [];
            const label = labelArr[context.dataIndex] || context.label;
            const value = context.raw;
            return `${label}: $${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} per capita`;
          },
          title: function (context: any) {
            const ctx = context[0];
            if (ctx.datasetIndex === 0) {
              // Inner ring: admin unit
              return adminUnitLabels[ctx.dataIndex];
            } else if (ctx.datasetIndex === 1) {
              // Outer ring: bureau, show parent admin unit
              return bureauParents[ctx.dataIndex];
            }
            return '';
          },
        },
        titleColor: "rgb(55, 65, 81)",
        bodyColor: "rgb(55, 65, 81)",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "rgb(209, 213, 219)",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        boxPadding: 6,
      },
    },
  };

  return (
    <div className="w-full flex flex-col items-center min-h-[400px]">
      <div className="text-lg font-semibold mb-2 text-gray-900">
        Total Per Capita Spending: ${totalPerCapita.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </div>
      <Doughnut data={data} options={options} />
    </div>
  );
} 
