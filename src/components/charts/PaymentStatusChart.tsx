
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useCompany } from "@/context/CompanyContext";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ['#28a745', '#ffc107', '#dc3545', '#007bff'];

export interface PaymentStatusData {
  name: string;
  value: number;
}

interface CompanyMetrics {
  payment_status_breakdown: string | Record<string, number> | null;
  [key: string]: any;
}

interface Invoice {
  "Payment Status": string | null;
  [key: string]: any;
}

export function PaymentStatusChart() {
  const { selectedCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PaymentStatusData[]>([]);

  useEffect(() => {
    if (!selectedCompany) return;
    
    const fetchPaymentStatusData = async () => {
      setLoading(true);
      try {
        console.log(`Fetching payment status data for company: ${selectedCompany.name}`);

        // Try company_metrics first (payment_status_breakdown field)
        const { data: metricsData, error: metricsError } = await supabase
          .from('company_metrics')
          .select('payment_status_breakdown')
          .eq('client_name', selectedCompany.name)
          .maybeSingle() as { data: CompanyMetrics | null, error: any };
        
        if (metricsError) {
          console.error('Error fetching payment status from metrics:', metricsError);
          throw metricsError;
        }
        
        console.log("Payment status metrics data:", metricsData);
          
        let chartData: PaymentStatusData[] = [];
        
        if (metricsData?.payment_status_breakdown) {
          // Parse the JSON string if it's a string
          const breakdown = typeof metricsData.payment_status_breakdown === 'string' 
            ? JSON.parse(metricsData.payment_status_breakdown)
            : metricsData.payment_status_breakdown;
          
          chartData = Object.entries(breakdown).map(([name, value]) => ({
            name,
            value: Number(value)
          }));
        } else {
          // If no data in company_metrics, calculate from invoices
          console.log("No payment status breakdown in metrics, calculating from invoices...");
          
          const { data: invoiceData, error: invoiceError } = await supabase
            .from('invoices')
            .select('"Payment Status"')
            .eq('"Client Name"', selectedCompany.name) as { data: Invoice[] | null, error: any };
            
          if (invoiceError) {
            console.error('Error fetching invoices for payment status:', invoiceError);
            throw invoiceError;
          }
          
          console.log("Invoice data for payment status:", invoiceData);
          
          if (invoiceData && invoiceData.length > 0) {
            // Count occurrences of each payment status
            const statusCounts: Record<string, number> = {};
            
            invoiceData.forEach(invoice => {
              const status = invoice['Payment Status'] || 'Unknown';
              statusCounts[status] = (statusCounts[status] || 0) + 1;
            });
            
            // Use actual counts instead of percentages
            chartData = Object.entries(statusCounts).map(([name, count]) => ({
              name,
              value: count
            }));
            
            console.log("Calculated payment status data:", chartData);
          } else {
            console.log("No invoice data found");
            chartData = [];
          }
        }
        
        setData(chartData);
      } catch (error) {
        console.error('Error fetching payment status data:', error);
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

  // Calculate total for percentage calculation
  const total = data.reduce((sum, item) => sum + item.value, 0);

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
            label={null}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name, props) => [
              `${value} (${((Number(value) / total) * 100).toFixed(0)}%)`, 
              name
            ]} 
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
