
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useCompany } from "@/context/CompanyContext";
import { formatCurrency } from "@/lib/utils";

interface StatusBarData {
  month: string;
  outstanding: number;
  paid: number;
}

export function PaymentStatusBarChart() {
  const { selectedCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StatusBarData[]>([]);

  useEffect(() => {
    if (!selectedCompany) return;

    // Simulate API call delay
    setLoading(true);
    setTimeout(() => {
      const mockData: StatusBarData[] = [
        { month: 'Jan', outstanding: 1200, paid: 3400 },
        { month: 'Feb', outstanding: 800, paid: 2800 },
        { month: 'Mar', outstanding: 1400, paid: 1800 },
        { month: 'Apr', outstanding: 1300, paid: 2500 },
        { month: 'May', outstanding: 900, paid: 1700 },
        { month: 'Jun', outstanding: 1500, paid: 2000 },
        { month: 'Jul', outstanding: 1100, paid: 3000 },
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
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(value) => `$${value}`} />
          <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
          <Bar dataKey="outstanding" stackId="a" fill="#dc3545" name="Outstanding" />
          <Bar dataKey="paid" stackId="a" fill="#28a745" name="Paid" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
