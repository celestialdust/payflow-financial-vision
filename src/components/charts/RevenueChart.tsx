
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
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface RevenueData {
  month: string;
  invoiced: number;
  paid: number;
}

// Define interface for the monthly data structure
interface MonthlyData {
  monthly_invoiced?: Record<string, number>;
  monthly_paid?: Record<string, number>;
}

export function RevenueChart() {
  const { selectedCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RevenueData[]>([]);

  useEffect(() => {
    if (!selectedCompany) return;

    const fetchRevenueData = async () => {
      setLoading(true);
      try {
        console.log(`Fetching revenue data for company: ${selectedCompany.name}`);

        // Try company_metrics first (monthly_data field)
        let { data: metricsData, error: metricsError } = await supabase
          .from('company_metrics')
          .select('monthly_data')
          .eq('client_name', selectedCompany.name)
          .maybeSingle();
        
        if (metricsError) {
          console.error('Error fetching revenue from metrics:', metricsError);
          throw metricsError;
        }
        
        console.log("Revenue metrics data:", metricsData);
        
        let chartData: RevenueData[] = [];
        
        if (metricsData?.monthly_data) {
          // Cast monthly_data to MonthlyData type
          const monthlyData = metricsData.monthly_data as MonthlyData;
          
          if (monthlyData.monthly_invoiced && monthlyData.monthly_paid) {
            // Convert to array format for chart
            const months = Object.keys(monthlyData.monthly_invoiced);
            
            chartData = months.map(month => ({
              month,
              invoiced: monthlyData.monthly_invoiced[month] || 0,
              paid: monthlyData.monthly_paid[month] || 0
            })).sort((a, b) => a.month.localeCompare(b.month));
          }
        }
        
        if (chartData.length === 0) {
          // If no data in company_metrics, try monthly_breakdown
          console.log("No monthly data in metrics, checking monthly_breakdown...");
          
          const { data: monthlyData, error: monthlyError } = await supabase
            .from('monthly_breakdown')
            .select('*')
            .eq('client_name', selectedCompany.name)
            .order('month', { ascending: true });
            
          if (monthlyError) {
            console.error('Error fetching from monthly_breakdown:', monthlyError);
            throw monthlyError;
          }
          
          console.log("Monthly breakdown data for revenue:", monthlyData);
          
          if (monthlyData && monthlyData.length > 0) {
            chartData = monthlyData.map(item => ({
              month: item.month || '',
              invoiced: item.invoiced_amount || 0,
              paid: item.paid_amount || 0
            }));
          } else {
            // If no data in monthly_breakdown, try calculating from invoices
            console.log("No monthly breakdown data, calculating from invoices...");
            
            const { data: invoiceData, error: invoiceError } = await supabase
              .from('invoices')
              .select('*')
              .eq('"Client Name"', selectedCompany.name);
              
            if (invoiceError) {
              console.error('Error fetching from invoices for revenue:', invoiceError);
              throw invoiceError;
            }
            
            console.log("Invoice data for revenue calculation:", invoiceData);
            
            if (invoiceData && invoiceData.length > 0) {
              // Group by month
              const monthlyTotals: Record<string, { invoiced: number, paid: number }> = {};
              
              invoiceData.forEach(inv => {
                if (!inv['Date Invoiced']) return;
                
                // Format date as YYYY-MM
                const month = inv['Date Invoiced'].substring(0, 7);
                const shortMonth = new Date(inv['Date Invoiced']).toLocaleString('default', { month: 'short' });
                
                if (!monthlyTotals[shortMonth]) {
                  monthlyTotals[shortMonth] = { invoiced: 0, paid: 0 };
                }
                
                monthlyTotals[shortMonth].invoiced += (inv['Invoice Amount'] || 0);
                monthlyTotals[shortMonth].paid += (inv['Paid Amount'] || 0);
              });
              
              // Convert to array format
              chartData = Object.entries(monthlyTotals).map(([month, values]) => ({
                month,
                invoiced: values.invoiced,
                paid: values.paid
              }));
              
              console.log("Calculated revenue data from invoices:", chartData);
            } else {
              // Use mock data if no real data available
              console.log("No data found for revenue chart, using mock data");
              chartData = [
                { month: 'Jan', invoiced: 4000, paid: 3400 },
                { month: 'Feb', invoiced: 3000, paid: 2800 },
                { month: 'Mar', invoiced: 2000, paid: 1800 },
                { month: 'Apr', invoiced: 2780, paid: 2500 },
                { month: 'May', invoiced: 1890, paid: 1700 },
                { month: 'Jun', invoiced: 2390, paid: 2000 },
                { month: 'Jul', invoiced: 3490, paid: 3000 },
              ];
            }
          }
        }
        
        setData(chartData);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
        
        // Use mock data in case of error
        setData([
          { month: 'Jan', invoiced: 4000, paid: 3400 },
          { month: 'Feb', invoiced: 3000, paid: 2800 },
          { month: 'Mar', invoiced: 2000, paid: 1800 },
          { month: 'Apr', invoiced: 2780, paid: 2500 },
          { month: 'May', invoiced: 1890, paid: 1700 },
          { month: 'Jun', invoiced: 2390, paid: 2000 },
          { month: 'Jul', invoiced: 3490, paid: 3000 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
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
         <Tooltip 
            formatter={(value, name) => {
              const label = name === "Invoiced" ? "Invoiced Amount" : "Paid Amount";
              return [formatCurrency(Number(value)), label];
            }} 
          />
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
