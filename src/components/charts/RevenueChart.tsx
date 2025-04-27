
import { useState, useEffect } from "react";
import { 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { useCompany } from "@/context/CompanyContext";
import { formatCurrency } from "@/lib/utils";

interface RevenueData {
  month: string;
  invoiced: number;
  paid: number;
}

export function RevenueChart() {
  const { selectedCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RevenueData[]>([]);

  useEffect(() => {
    if (!selectedCompany) return;

    // Simulate API call delay
    setLoading(true);
    setTimeout(() => {
      const mockData: RevenueData[] = [
        { month: 'Jan', invoiced: 4000, paid: 3400 },
        { month: 'Feb', invoiced: 3000, paid: 2800 },
        { month: 'Mar', invoiced: 2000, paid: 1800 },
        { month: 'Apr', invoiced: 2780, paid: 2500 },
        { month: 'May', invoiced: 1890, paid: 1700 },
        { month: 'Jun', invoiced: 2390, paid: 2000 },
        { month: 'Jul', invoiced: 3490, paid: 3000 },
      ];
      setData(mockData);
      setLoading(false);
    }, 1000);
  }, [selectedCompany]);

  if (loading) {
    return <div className="flex items-center justify-center h-[300px]">Loading chart data...</div>;
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(value) => `$${value}`} />
          <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
          <Area 
            type="monotone" 
            dataKey="invoiced" 
            stroke="#007bff" 
            fill="#007bff" 
            fillOpacity={0.3} 
            name="Invoiced"
          />
          <Area 
            type="monotone" 
            dataKey="paid" 
            stroke="#28a745" 
            fill="#28a745" 
            fillOpacity={0.3} 
            name="Paid"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
