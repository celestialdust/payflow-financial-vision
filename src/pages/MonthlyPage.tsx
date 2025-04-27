
import { useState, useEffect } from "react";
import { useCompany } from "@/context/CompanyContext";
import { MonthlyBreakdownTable, MonthlyData } from "@/components/tables/MonthlyBreakdownTable";

export default function MonthlyPage() {
  const { selectedCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  useEffect(() => {
    if (!selectedCompany) return;

    // Simulate API call delay
    setLoading(true);
    setTimeout(() => {
      const mockData: MonthlyData[] = [
        { id: '1', month: '2024-01', invoicedAmount: 15400, paidAmount: 12500, growthRate: 5.2 },
        { id: '2', month: '2024-02', invoicedAmount: 16200, paidAmount: 15100, growthRate: 5.2 },
        { id: '3', month: '2024-03', invoicedAmount: 18500, paidAmount: 17200, growthRate: 14.2 },
        { id: '4', month: '2024-04', invoicedAmount: 17200, paidAmount: 16100, growthRate: -7.0 },
        { id: '5', month: '2024-05', invoicedAmount: 19100, paidAmount: 17800, growthRate: 11.0 },
        { id: '6', month: '2024-06', invoicedAmount: 18300, paidAmount: 16900, growthRate: -4.2 },
        { id: '7', month: '2024-07', invoicedAmount: 20100, paidAmount: 18600, growthRate: 9.8 },
      ];
      setMonthlyData(mockData);
      setLoading(false);
    }, 1000);
  }, [selectedCompany]);

  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h2 className="text-2xl font-semibold tracking-tight pb-1">Monthly Breakdown</h2>
        <p className="text-muted-foreground">Monthly Financial Performance</p>
      </div>

      <MonthlyBreakdownTable data={monthlyData} loading={loading} />
    </div>
  );
}
