
import { 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { useRevenueData } from "@/hooks/useRevenueData";
import { 
  areaChartMargins, 
  formatYAxisTick, 
  formatTooltipValue, 
  chartConfig 
} from "./RevenueChartConfig";

export function RevenueChart() {
  const { data, loading } = useRevenueData();

  if (loading) {
    return <div className="flex items-center justify-center h-[300px]">Loading chart data...</div>;
  }

  return (
    <div className="w-full h-[350px] p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={areaChartMargins}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
          />
          <YAxis tickFormatter={formatYAxisTick} />
          <Tooltip formatter={formatTooltipValue} />
          <Area 
            type="monotone" 
            dataKey="invoiced" 
            {...chartConfig.invoiced}
            name="invoiced"
          />
          <Area 
            type="monotone" 
            dataKey="paid" 
            {...chartConfig.paid}
            name="paid"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
