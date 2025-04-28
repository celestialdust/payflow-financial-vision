
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useCompany } from "@/context/CompanyContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LateInvoiceData {
  month: string;
  percentage: number;
}

interface MonthlyLateData {
  [key: string]: {
    total: number;
    late: number;
  };
}

export function LateInvoicesChart() {
  const { selectedCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LateInvoiceData[]>([]);

  useEffect(() => {
    if (!selectedCompany) return;

    const fetchLateInvoicesData = async () => {
      setLoading(true);
      try {
        console.log(`Fetching late invoices data for company: ${selectedCompany.name}`);
        
        const { data: invoiceData, error } = await supabase
          .from('invoices')
          .select('Invoice Month, Is Late')
          .eq('"Client Name"', selectedCompany.name)
          .order('"Invoice Month"');

        if (error) {
          console.error('Error fetching late invoices data:', error);
          throw error;
        }

        if (invoiceData && invoiceData.length > 0) {
          // Group data by month and calculate percentages
          const monthlyData: MonthlyLateData = {};
          
          invoiceData.forEach(invoice => {
            const month = invoice['Invoice Month'] || 'Unknown';
            if (!monthlyData[month]) {
              monthlyData[month] = { total: 0, late: 0 };
            }
            monthlyData[month].total += 1;
            if (invoice['Is Late']) {
              monthlyData[month].late += 1;
            }
          });

          // Convert to chart data format
          const chartData: LateInvoiceData[] = Object.entries(monthlyData)
            .map(([month, counts]) => ({
              month,
              percentage: Math.round((counts.late / counts.total) * 100)
            }))
            .sort((a, b) => {
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              return months.indexOf(a.month) - months.indexOf(b.month);
            });

          console.log('Processed late invoices data:', chartData);
          setData(chartData);
          toast.success('Late invoices data loaded');
        } else {
          console.log('No invoice data found');
          setData([]);
          toast.info('No late invoices data available');
        }
      } catch (error) {
        console.error('Error in late invoices calculation:', error);
        toast.error('Failed to load late invoices data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLateInvoicesData();
  }, [selectedCompany]);

  if (loading) {
    return <div className="flex items-center justify-center h-[300px]">Loading chart data...</div>;
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        No late invoices data available
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
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis 
            tickFormatter={(value) => `${value}%`}
            domain={[0, Math.max(100, ...data.map(item => item.percentage))]}
          />
          <Tooltip formatter={(value) => [`${value}%`, 'Late Invoices']} />
          <Bar dataKey="percentage" fill="#dc3545" name="Late Invoices %" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
