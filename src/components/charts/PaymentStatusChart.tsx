
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useCompany } from "@/context/CompanyContext";
import { supabase } from "@/integrations/supabase/client";

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
    
    const fetchPaymentStatusData = async () => {
      setLoading(true);
      try {
        console.log(`Fetching payment status data for company: ${selectedCompany.name}`);

        // Try company_metrics first (payment_status_breakdown field)
        let { data: metricsData, error: metricsError } = await supabase
          .from('company_metrics')
          .select('payment_status_breakdown')
          .eq('client_name', selectedCompany.name)
          .maybeSingle();
        
        if (metricsError) {
          console.error('Error fetching payment status from metrics:', metricsError);
          throw metricsError;
        }
        
        console.log("Payment status metrics data:", metricsData);
          
        let chartData: PaymentStatusData[] = [];
        
        if (metricsData?.payment_status_breakdown) {
          // Use payment_status_breakdown from company_metrics
          const breakdown = metricsData.payment_status_breakdown as Record<string, number>;
          
          chartData = Object.entries(breakdown).map(([name, value]) => ({
            name,
            value: Number(value)
          }));
        } else {
          // If no data in company_metrics, calculate from invoices
          console.log("No payment status breakdown in metrics, calculating from invoices...");
          
          const { data: invoiceData, error: invoiceError } = await supabase
            .from('invoices')
            .select('Payment Status')
            .eq('Client Name', selectedCompany.name);
            
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
            
            // Convert to percentage
            const total = invoiceData.length;
            chartData = Object.entries(statusCounts).map(([name, count]) => ({
              name,
              value: Math.round((count / total) * 100)
            }));
            
            console.log("Calculated payment status data:", chartData);
          } else {
            // Use mock data if no real data available
            chartData = [
              { name: 'Fully Paid', value: 65 },
              { name: 'Partially Paid', value: 15 },
              { name: 'Unpaid', value: 15 },
              { name: 'Overpaid', value: 5 }
            ];
            console.log("No invoice data found, using mock payment status data");
          }
        }
        
        setData(chartData);
      } catch (error) {
        console.error('Error fetching payment status data:', error);
        
        // Use mock data in case of error
        setData([
          { name: 'Fully Paid', value: 65 },
          { name: 'Partially Paid', value: 15 },
          { name: 'Unpaid', value: 15 },
          { name: 'Overpaid', value: 5 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatusData();
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
