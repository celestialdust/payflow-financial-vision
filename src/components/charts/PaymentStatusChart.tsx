
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useCompany } from "@/context/CompanyContext";

const COLORS = ['#28a745', '#ffc107', '#dc3545', '#007bff'];

export interface PaymentStatusData {
  name: string;
  value: number;
}

export function PaymentStatusChart() {
  const { selectedCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PaymentStatusData[]>([]);

  useEffect(() => {
    if (!selectedCompany) return;
    
    // Simulate API call delay
    setLoading(true);
    setTimeout(() => {
      const mockData: PaymentStatusData[] = [
        { name: 'Fully Paid', value: 65 },
        { name: 'Partially Paid', value: 15 },
        { name: 'Unpaid', value: 15 },
        { name: 'Overpaid', value: 5 }
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
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
