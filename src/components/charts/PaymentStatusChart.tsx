
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useCompany } from "@/context/CompanyContext";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

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

        const { data: metricsData, error: metricsError } = await supabase
          .from('company_metrics')
          .select('payment_status_breakdown')
          .eq('client_name', selectedCompany.name)
          .maybeSingle();
        
        if (metricsError) throw metricsError;
        
        let chartData: PaymentStatusData[] = [];
        
        if (metricsData?.payment_status_breakdown) {
          const breakdown = metricsData.payment_status_breakdown as Record<string, number>;
          
          // Consolidate and aggregate the data
          const consolidatedData: Record<string, number> = {};
          Object.entries(breakdown).forEach(([status, count]) => {
            // Standardize status names
            let standardStatus = status;
            if (status.toLowerCase().includes('paid')) {
              if (status.toLowerCase().includes('fully')) standardStatus = 'Fully Paid';
              else if (status.toLowerCase().includes('partial')) standardStatus = 'Partially Paid';
              else if (status.toLowerCase().includes('over')) standardStatus = 'Overpaid';
              else standardStatus = 'Paid';
            } else {
              standardStatus = 'Unpaid';
            }
            
            consolidatedData[standardStatus] = (consolidatedData[standardStatus] || 0) + count;
          });
          
          chartData = Object.entries(consolidatedData)
            .map(([name, value]) => ({
              name,
              value: Number(value)
            }))
            .sort((a, b) => b.value - a.value);
        }
        
        setData(chartData);
      } catch (error) {
        console.error('Error fetching payment status data:', error);
        setData([
          { name: 'Fully Paid', value: 65 },
          { name: 'Partially Paid', value: 15 },
          { name: 'Unpaid', value: 20 }
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
          <Tooltip formatter={(value, name) => [`${value}%`, `${name} Invoices`]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
