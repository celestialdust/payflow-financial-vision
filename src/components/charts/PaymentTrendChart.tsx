
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useCompany } from "@/context/CompanyContext";

interface PaymentTrendData {
  month: string;
  daysToPayAvg: number;
}

export function PaymentTrendChart() {
  const { selectedCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PaymentTrendData[]>([]);

  useEffect(() => {
    if (!selectedCompany) return;

    // Simulate API call delay
    setLoading(true);
    setTimeout(() => {
      const mockData: PaymentTrendData[] = [
        { month: 'Jan', daysToPayAvg: 32 },
        { month: 'Feb', daysToPayAvg: 28 },
        { month: 'Mar', daysToPayAvg: 31 },
        { month: 'Apr', daysToPayAvg: 27 },
        { month: 'May', daysToPayAvg: 25 },
        { month: 'Jun', daysToPayAvg: 29 },
        { month: 'Jul', daysToPayAvg: 23 },
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
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => [`${value} days`, 'Average Days to Pay']} />
          <Line 
            type="monotone" 
            dataKey="daysToPayAvg" 
            stroke="#007bff" 
            activeDot={{ r: 8 }} 
            name="Average Days to Pay"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
