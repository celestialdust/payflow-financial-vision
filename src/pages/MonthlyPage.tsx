
import { useState, useEffect } from "react";
import { useCompany } from "@/context/CompanyContext";
import { MonthlyBreakdownTable, MonthlyData } from "@/components/tables/MonthlyBreakdownTable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function MonthlyPage() {
  const { selectedCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  useEffect(() => {
    if (!selectedCompany) return;

    const fetchMonthlyData = async () => {
      setLoading(true);
      try {
        console.log(`Fetching monthly data for company: ${selectedCompany.name}`);
        
        // Try monthly_breakdown table first
        let { data, error } = await supabase
          .from('monthly_breakdown')
          .select('*')
          .eq('client_name', selectedCompany.name);

        if (error) {
          console.error('Error fetching from monthly_breakdown:', error);
          throw error;
        }
        
        console.log("Monthly breakdown data:", data);

        if (data && data.length > 0) {
          const formattedData: MonthlyData[] = data.map((item, index) => {
            // Get previous month for growth calculation
            const previousMonth = index > 0 ? data[index - 1].invoiced_amount || 0 : 0;
            
            return {
              id: item.id,
              month: item.month,
              invoicedAmount: item.invoiced_amount || 0,
              paidAmount: item.paid_amount || 0,
              growthRate: calculateGrowthRate(item.invoiced_amount || 0, previousMonth)
            };
          });

          setMonthlyData(formattedData);
          toast.success('Monthly data loaded successfully');
        } else {
          // If no data in monthly_breakdown, try calculating from invoices
          console.log("No data in monthly_breakdown, checking invoices...");
          
          const { data: invoiceData, error: invoiceError } = await supabase
            .from('invoices')
            .select('*')
            .eq('"Client Name"', selectedCompany.name);
            
          if (invoiceError) {
            console.error('Error fetching from invoices for monthly data:', invoiceError);
            throw invoiceError;
          }
          
          console.log("Invoice data for monthly breakdown:", invoiceData);
          
          if (invoiceData && invoiceData.length > 0) {
            // Group by month and calculate totals
            const monthlyTotals: Record<string, { invoiced: number, paid: number }> = {};
            
            invoiceData.forEach(inv => {
              if (!inv['Date Invoiced']) return;
              
              // Format date as YYYY-MM
              const month = inv['Date Invoiced'].substring(0, 7);
              
              if (!monthlyTotals[month]) {
                monthlyTotals[month] = { invoiced: 0, paid: 0 };
              }
              
              monthlyTotals[month].invoiced += (inv['Invoice Amount'] || 0);
              monthlyTotals[month].paid += (inv['Paid Amount'] || 0);
            });
            
            // Convert to array and sort by month
            const months = Object.keys(monthlyTotals).sort();
            const formattedData: MonthlyData[] = months.map((month, index) => {
              const previousInvoiced = index > 0 ? monthlyTotals[months[index - 1]].invoiced : 0;
              
              return {
                id: `${selectedCompany.id}-${month}`,
                month,
                invoicedAmount: monthlyTotals[month].invoiced,
                paidAmount: monthlyTotals[month].paid,
                growthRate: calculateGrowthRate(monthlyTotals[month].invoiced, previousInvoiced)
              };
            });
            
            setMonthlyData(formattedData);
            console.log("Calculated monthly data from invoices:", formattedData);
          } else {
            // Use mock data if no real data available
            console.log("No data found for monthly breakdown, using mock data");
            setMonthlyData([
              { id: '1', month: '2023-01', invoicedAmount: 12000, paidAmount: 10000, growthRate: 0 },
              { id: '2', month: '2023-02', invoicedAmount: 15000, paidAmount: 14000, growthRate: 25 },
              { id: '3', month: '2023-03', invoicedAmount: 18000, paidAmount: 16000, growthRate: 20 },
              { id: '4', month: '2023-04', invoicedAmount: 16000, paidAmount: 15000, growthRate: -11.1 }
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching monthly data:', error);
        toast.error('Failed to load monthly data');
        
        // Use mock data in case of error
        setMonthlyData([
          { id: '1', month: '2023-01', invoicedAmount: 12000, paidAmount: 10000, growthRate: 0 },
          { id: '2', month: '2023-02', invoicedAmount: 15000, paidAmount: 14000, growthRate: 25 },
          { id: '3', month: '2023-03', invoicedAmount: 18000, paidAmount: 16000, growthRate: 20 },
          { id: '4', month: '2023-04', invoicedAmount: 16000, paidAmount: 15000, growthRate: -11.1 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, [selectedCompany]);

  // Helper function to calculate growth rate
  const calculateGrowthRate = (current: number, previous: number): number => {
    if (!previous || previous === 0) return 0;
    return Number(((current - previous) / previous * 100).toFixed(1));
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
