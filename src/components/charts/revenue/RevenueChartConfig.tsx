
import { formatCurrency } from "@/lib/utils";

export const areaChartMargins = {
  top: 10,
  right: 30,
  left: 60,
  bottom: 20,
};

export const formatYAxisTick = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value}`;
};

export const formatTooltipValue = (value: number, name: string) => {
  const label = name === "invoiced" ? "Invoiced Amount" : "Paid Amount";
  return [formatCurrency(Number(value)), label];
};

export const chartConfig = {
  invoiced: {
    stroke: "#007bff",
    fill: "#007bff",
    fillOpacity: 0.3,
  },
  paid: {
    stroke: "#28a745",
    fill: "#28a745",
    fillOpacity: 0.3,
  },
};
