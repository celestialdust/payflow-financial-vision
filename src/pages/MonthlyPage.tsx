
import { useState, useEffect } from "react";
import { useCompany } from "@/context/CompanyContext";
import { MonthlyBreakdownTable, MonthlyData } from "@/components/tables/MonthlyBreakdownTable";
import { supabase } from "@/integrations/supabase/client";

export default function MonthlyPage() {
  const { selectedCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  useEffect(() => {
    if (!selectedCompany) return;

    const fetchMonthlyData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('monthly_breakdown')
          .select('*')
          .eq('client_name', selectedCompany.name);

        if (error) {
          throw error;
        }

        const formattedData: MonthlyData[] = data.map(item => ({
          id: item.id,
          month: item.month,
          invoicedAmount: item.invoiced_amount || 0,
          paidAmount: item.paid_amount || 0,
          growthRate: calculateGrowthRate(item.invoiced_amount, getPreviousMonthAmount(data, item.month))
        }));

        setMonthlyData(formattedData);
      } catch (error) {
        console.error('Error fetching monthly data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, [selectedCompany]);

  // Helper function to calculate growth rate
  const calculateGrowthRate = (current: number, previous: number): number => {
    if (!previous) return 0;
    return Number(((current - previous) / previous * 100).toFixed(1));
  };

  // Helper function to get previous month's amount
  const getPreviousMonthAmount = (data: any[], currentMonth: string): number => {
    const months = data.sort((a, b) => a.month.localeCompare(b.month));
    const currentIndex = months.findIndex(m => m.month === currentMonth);
    if (currentIndex <= 0) return 0;
    return months[currentIndex - 1].invoiced_amount || 0;
  };

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
