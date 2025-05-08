"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { BudgetItem, AdministrativeUnit, CPIData } from "@/types/budget";
import { useMemo, useCallback, useRef } from "react";

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

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

interface PerCapitaMultiDonutChartProps {
  departments: BudgetItem[];
  administrativeUnits: AdministrativeUnit[];
  cpiData: CPIData;
  filter?: 'operating' | 'capital' | 'debt';
}

export default function PerCapitaMultiDonutChart({
  departments,
  administrativeUnits,
  cpiData,
  filter,
}: PerCapitaMultiDonutChartProps) {
  // Memoize data prep for performance
  const { adminUnitLabels, adminUnitData, adminUnitColors, bureauLabels, bureauData, bureauColors, bureauParents, totalPerCapita } = useMemo(() => {
    // Debug logging
    const departmentsWithoutClassification = departments.filter(dept => !dept.classification);
    if (departmentsWithoutClassification.length > 0) {
      console.log('Departments missing classification:', departmentsWithoutClassification.map(d => ({
        name: d.name,
        administrativeUnit: d.administrativeUnit,
        totalExpense: d.totalExpense
      })));
    }

    // Build admin unit per-capita spending
    const adminUnitMap = administrativeUnits.map((unit, i) => {
      const bureaus = departments.filter((dept) => {
        if (unit.name === "Portland" && dept.administrativeUnit === "City") return true;
        if (unit.name === "Portland Metro" && dept.administrativeUnit === "Metro") return true;
        return dept.administrativeUnit.toLowerCase() === unit.name.toLowerCase();
      });
      const color = ADMIN_UNIT_COLORS[i % ADMIN_UNIT_COLORS.length];
      const value = bureaus.reduce((sum, dept) => {
        // If no filter, show all expenses
        if (!filter) {
          return sum + dept.totalExpense / unit.population;
        }

        // If classification matches filter, include full amount
        if (dept.classification === filter) {
          return sum + dept.totalExpense / unit.population;
        }

        // If classification is opposite of filter, exclude
        if (filter === 'capital' && dept.classification === 'operating') return sum;
        if (filter === 'operating' && dept.classification === 'capital') return sum;
        if (filter === 'debt' && dept.classification !== 'debt') return sum;

        // For mixed departments, calculate appropriate ratio
        if (dept.classification === 'mixed' && filter !== 'debt') {
          const total = (dept.capitalExpense || 0) + (dept.operatingExpense || 0);
          if (total > 0) {
            const ratio = filter === 'capital' 
              ? (dept.capitalExpense || 0) / total
              : (dept.operatingExpense || 0) / total;
            return sum + (dept.totalExpense * ratio) / unit.population;
          }
        }

        return sum;
      }, 0);
      return {
        name: unit.name,
        value,
        color,
        bureaus: bureaus.map((dept, j) => {
          // If no filter, show all expenses
          if (!filter) {
            return {
              name: dept.name,
              value: dept.totalExpense / unit.population,
              color: shadeColor(color, 0.4 + 0.2 * (j % 3)),
            };
          }

          // If classification matches filter, include full amount
          if (dept.classification === filter) {
            return {
              name: dept.name,
              value: dept.totalExpense / unit.population,
              color: shadeColor(color, 0.4 + 0.2 * (j % 3)),
            };
          }

          // If classification is opposite of filter, exclude
          if (filter === 'capital' && dept.classification === 'operating') {
            return {
              name: dept.name,
              value: 0,
              color: shadeColor(color, 0.4 + 0.2 * (j % 3)),
            };
          }
          if (filter === 'operating' && dept.classification === 'capital') {
            return {
              name: dept.name,
              value: 0,
              color: shadeColor(color, 0.4 + 0.2 * (j % 3)),
            };
          }
          if (filter === 'debt' && dept.classification !== 'debt') {
            return {
              name: dept.name,
              value: 0,
              color: shadeColor(color, 0.4 + 0.2 * (j % 3)),
            };
          }

          // For mixed departments, calculate appropriate ratio
          if (dept.classification === 'mixed' && filter !== 'debt') {
            const total = (dept.capitalExpense || 0) + (dept.operatingExpense || 0);
            if (total > 0) {
              const ratio = filter === 'capital' 
                ? (dept.capitalExpense || 0) / total
                : (dept.operatingExpense || 0) / total;
              return {
                name: dept.name,
                value: (dept.totalExpense * ratio) / unit.population,
                color: shadeColor(color, 0.4 + 0.2 * (j % 3)),
              };
            }
          }

          return {
            name: dept.name,
            value: 0,
            color: shadeColor(color, 0.4 + 0.2 * (j % 3)),
          };
        }),
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
  }, [departments, administrativeUnits, filter]);

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

  const chartRef = useRef<any>(null);

  const handleClick = useCallback((event: any) => {
    const chart = chartRef.current;
    if (!chart) return;
    const elements = chart.getElementsAtEventForMode(event.nativeEvent, 'nearest', { intersect: true }, true);
    if (!elements || elements.length === 0) return;
    const elem = elements[0];
    const datasetIndex = elem.datasetIndex;
    const dataIndex = elem.index;
    let label = "";
    if (datasetIndex === 0) {
      label = adminUnitLabels[dataIndex];
    } else if (datasetIndex === 1) {
      label = bureauLabels[dataIndex];
    }
    if (label) {
      const id = slugify(label);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-4", "ring-blue-400");
        setTimeout(() => el.classList.remove("ring-4", "ring-blue-400"), 1200);
      }
    }
  }, [adminUnitLabels, bureauLabels]);

  return (
    <div className="w-full flex flex-col items-center min-h-[400px]">
      <div className="text-lg font-semibold mb-2 text-gray-900">
        Total Per Capita Spending: ${totalPerCapita.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </div>
      <Doughnut ref={chartRef} data={data} options={options} onClick={handleClick} />
    </div>
  );
} 
