"use client";

import { useEffect, useRef } from "react";
import Sunburst from "sunburst-chart";
import { BudgetItem, AdministrativeUnit, CPIData } from "@/types/budget";

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
  // Simple shade function for subunits
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

interface PerCapitaDonutChartProps {
  departments: BudgetItem[];
  administrativeUnits: AdministrativeUnit[];
  cpiData: CPIData;
}

export default function PerCapitaSunburstClient({
  departments,
  administrativeUnits,
  cpiData,
}: PerCapitaDonutChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);

  // Build hierarchical data: root -> admin units -> bureaus
  const chartData = {
    name: "Budget",
    children: administrativeUnits.map((unit, i) => {
      const bureaus = departments.filter((dept) => {
        if (unit.name === "Portland" && dept.administrativeUnit === "City") return true;
        if (unit.name === "Portland Metro" && dept.administrativeUnit === "Metro") return true;
        return dept.administrativeUnit.toLowerCase() === unit.name.toLowerCase();
      });
      const color = ADMIN_UNIT_COLORS[i % ADMIN_UNIT_COLORS.length];
      return {
        name: unit.name,
        color,
        children: bureaus.map((dept, j) => ({
          name: dept.name,
          value: dept.totalExpense / unit.population,
          color: shadeColor(color, 0.4 + 0.2 * (j % 3)),
        })),
        value: bureaus.reduce((sum, dept) => sum + dept.totalExpense / unit.population, 0),
      };
    })
  };

  // Calculate total per capita spending
  const totalPerCapitaSpending = chartData.children.reduce((sum, unit) => sum + unit.value, 0);

  useEffect(() => {
    console.log("[Sunburst Chart Data]", chartData);
    let resizeObserver: ResizeObserver | null = null;
    let initialized = false;
    function tryInitChart() {
      if (!chartRef.current) return;
      const { width, height } = chartRef.current.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      chartRef.current.innerHTML = "";
      chartInstance.current = (Sunburst as any)()(chartRef.current)
        .data(chartData)
        .width(500)
        .height(500)
        .label((d: any) =>
          d.depth === 1
            ? `${d.name}`
            : d.depth === 2
            ? `${d.name}`
            : ""
        )
        .size("value")
        .color((d: any) => d.color || "#cccccc")
        .showLabels(true)
        .excludeRoot(true)
        .centerRadius(0.2)
        .transitionDuration(0)
        .tooltipTitle((d: any) => {
          const path = [];
          let node = d;
          while (node) {
            if (node.name) path.push(node.name);
            node = node.parent;
          }
          return path.reverse().join(" → ");
        })
        .tooltipContent((d: any) =>
          typeof d.value === "number"
            ? `$${d.value.toLocaleString(undefined, { maximumFractionDigits: 2 })} per capita`
            : ""
        );
      initialized = true;
    }
    if (chartRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (!initialized) {
          tryInitChart();
        }
      });
      resizeObserver.observe(chartRef.current);
      setTimeout(tryInitChart, 0);
    }
    return () => {
      if (resizeObserver && chartRef.current) {
        resizeObserver.disconnect();
      }
      if (chartRef.current) {
        chartRef.current.innerHTML = "";
      }
      chartInstance.current = null;
    };
  }, [JSON.stringify(chartData)]);

  return (
    <div className="w-full flex flex-col items-center min-h-[400px]">
      <div className="text-lg font-semibold mb-2 text-gray-900">
        Total Per Capita Spending: ${totalPerCapitaSpending.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </div>
      <div ref={chartRef} style={{ width: 500, height: 500 }} />
    </div>
  );
} 
