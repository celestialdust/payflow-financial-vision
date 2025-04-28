
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useCompany } from "@/context/CompanyContext";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

    const fetchPaymentStatusData = async () => {
      setLoading(true);
      try {
        console.log(`Fetching payment status data for company: ${selectedCompany.name}`);
        
        // First try monthly_breakdown table
        const { data: monthlyData, error: monthlyError } = await supabase
          .from('monthly_breakdown')
          .select('*')
          .eq('client_name', selectedCompany.name)
          .order('month') as { data: any[], error: any };

        if (monthlyError) {
          console.error('Error fetching from monthly_breakdown:', monthlyError);
          throw monthlyError;
        }

        if (monthlyData && monthlyData.length > 0) {
          const chartData: StatusBarData[] = monthlyData.map(item => ({
            month: item.month || 'Unknown',
            outstanding: Number((item.invoiced_amount || 0) - (item.paid_amount || 0)),
            paid: Number(item.paid_amount || 0)
          }));

          console.log('Processed payment status data from monthly_breakdown:', chartData);
          setData(chartData);
          toast.success('Payment status data loaded');
        } else {
          // If no data in monthly_breakdown, calculate from invoices
          console.log('No data in monthly_breakdown, calculating from invoices...');
          
          const { data: invoiceData, error: invoiceError } = await supabase
            .from('invoices')
            .select('Invoice Month, Invoice Amount, Paid Amount')
            .eq('"Client Name"', selectedCompany.name)
            .order('"Invoice Month"') as { data: any[], error: any };

          if (invoiceError) {
            console.error('Error fetching from invoices:', invoiceError);
            throw invoiceError;
          }

          if (invoiceData && invoiceData.length > 0) {
            // Group by month and calculate totals
            const monthlyTotals: { [key: string]: StatusBarData } = {};

            invoiceData.forEach(invoice => {
              const month = invoice['Invoice Month'] || 'Unknown';
              if (!monthlyTotals[month]) {
                monthlyTotals[month] = { month, outstanding: 0, paid: 0 };
              }
              monthlyTotals[month].paid += Number(invoice['Paid Amount'] || 0);
              monthlyTotals[month].outstanding += Number(invoice['Invoice Amount'] || 0) - Number(invoice['Paid Amount'] || 0);
            });

            // Convert to array and sort by month
            const chartData = Object.values(monthlyTotals)
              .sort((a, b) => {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return months.indexOf(a.month) - months.indexOf(b.month);
              });

            console.log('Processed payment status data from invoices:', chartData);
            setData(chartData);
            toast.success('Payment status data loaded');
          } else {
            console.log('No invoice data found');
            setData([]);
            toast.info('No payment status data available');
          }
        }
      } catch (error) {
        console.error('Error in payment status calculation:', error);
        toast.error('Failed to load payment status data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatusData();
  }, [selectedCompany]);

  if (loading) {
    return <div className="flex items-center justify-center h-[300px]">Loading chart data...</div>;
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        No payment status data available
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 40,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis 
            tickFormatter={(value) => {
              if (value >= 1000000) {
                return `$${(value / 1000000).toFixed(1)}M`;
              } else if (value >= 1000) {
                return `$${(value / 1000).toFixed(1)}K`;
              }
              return `$${value}`;
            }}
          />
          <Tooltip 
            formatter={(value, name) => {
              const label = name === "outstanding" ? "Outstanding Amount" : "Paid Amount";
              return [formatCurrency(Number(value)), label];
            }}
          />
          <Bar dataKey="outstanding" stackId="a" fill="#dc3545" name="Outstanding" />
          <Bar dataKey="paid" stackId="a" fill="#28a745" name="Paid" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
