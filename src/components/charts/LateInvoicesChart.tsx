
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useCompany } from "@/context/CompanyContext";

interface LateInvoiceData {
  month: string;
  percentage: number;
}

export function LateInvoicesChart() {
  const { selectedCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LateInvoiceData[]>([]);

  useEffect(() => {
    if (!selectedCompany) return;

    // Simulate API call delay
    setLoading(true);
    setTimeout(() => {
      const mockData: LateInvoiceData[] = [
        { month: 'Jan', percentage: 25 },
        { month: 'Feb', percentage: 18 },
        { month: 'Mar', percentage: 22 },
        { month: 'Apr', percentage: 15 },
        { month: 'May', percentage: 20 },
        { month: 'Jun', percentage: 17 },
        { month: 'Jul', percentage: 12 },
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
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(value) => `${value}%`} />
          <Tooltip formatter={(value) => [`${value}%`, 'Late Invoices']} />
          <Bar dataKey="percentage" fill="#dc3545" name="Late Invoices %" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
