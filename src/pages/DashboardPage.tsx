
import { useState, useEffect } from "react";
import { useCompany } from "@/context/CompanyContext";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { PaymentStatusChart } from "@/components/charts/PaymentStatusChart";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Calendar, ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

interface CompanyMetrics {
  id?: string;
  client_name?: string;
  total_invoiced: number;
  total_paid: number;
  outstanding_amount: number;
  average_days_to_pay: number;
  late_invoices_count?: number;
  late_invoices_percentage?: number;
  outstanding_invoices?: number;
  total_invoices?: number;
  payment_status_breakdown?: Json;
  monthly_data?: Json;
}

export default function DashboardPage() {
  const { selectedCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<CompanyMetrics | null>(null);

  useEffect(() => {
    if (!selectedCompany) return;

    const fetchMetrics = async () => {
      setLoading(true);
      try {
        console.log(`Fetching metrics for company: ${selectedCompany.name}`);
        
        // First try company_metrics table
        let { data, error } = await supabase
          .from('company_metrics')
          .select('*')
          .eq('client_name', selectedCompany.name)
          .maybeSingle();

        if (error) {
          console.error('Error fetching from company_metrics:', error);
          throw error;
        }
        
        console.log("Metrics data response:", data);

        if (!data) {
          // If no data in company_metrics, calculate metrics from invoices table
          console.log("No data in company_metrics, calculating from invoices...");
          
          const { data: invoiceData, error: invoiceError } = await supabase
            .from('invoices')
            .select('*')
            .eq('Client Name', selectedCompany.name);
            
          if (invoiceError) {
            console.error('Error fetching from invoices:', invoiceError);
            throw invoiceError;
          }
          
          console.log("Invoice data for metrics calculation:", invoiceData);
          
          if (invoiceData && invoiceData.length > 0) {
            // Calculate metrics from invoice data
            const total_invoiced = invoiceData.reduce((sum, inv) => sum + (inv['Invoice Amount'] || 0), 0);
            const total_paid = invoiceData.reduce((sum, inv) => sum + (inv['Paid Amount'] || 0), 0);
            const outstanding_amount = total_invoiced - total_paid;
            
            // Calculate average days to pay (only for paid invoices)
            const paidInvoices = invoiceData.filter(inv => inv['No. Days taken to Pay'] != null);
            const average_days_to_pay = paidInvoices.length 
              ? paidInvoices.reduce((sum, inv) => sum + (inv['No. Days taken to Pay'] || 0), 0) / paidInvoices.length 
              : 0;
            
            data = {
              id: selectedCompany.id,
              client_name: selectedCompany.name,
              total_invoiced,
              total_paid,
              outstanding_amount,
              average_days_to_pay,
              late_invoices_count: 0,
              late_invoices_percentage: 0,
              outstanding_invoices: 0,
              total_invoices: invoiceData.length,
              payment_status_breakdown: {},
              monthly_data: {}
            };
            
            console.log("Calculated metrics from invoices:", data);
          } else {
            // Use mock data if no real data available
            console.log("No invoice data found, using mock data");
            data = {
              id: selectedCompany.id,
              client_name: selectedCompany.name,
              total_invoiced: 150000,
              total_paid: 120000,
              outstanding_amount: 30000,
              average_days_to_pay: 15,
              late_invoices_count: 0,
              late_invoices_percentage: 0,
              outstanding_invoices: 0,
              total_invoices: 0,
              payment_status_breakdown: {},
              monthly_data: {}
            };
          }
        }

        setMetrics(data);
        toast.success('Dashboard data loaded successfully');
      } catch (error) {
        console.error('Error fetching metrics:', error);
        toast.error('Failed to load metrics data');
        
        // Use mock data in case of error
        setMetrics({
          id: selectedCompany?.id,
          client_name: selectedCompany?.name,
          total_invoiced: 150000,
          total_paid: 120000,
          outstanding_amount: 30000,
          average_days_to_pay: 15,
          late_invoices_count: 0,
          late_invoices_percentage: 0,
          outstanding_invoices: 0,
          total_invoices: 0,
          payment_status_breakdown: {},
          monthly_data: {}
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [selectedCompany]);

  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h2 className="text-2xl font-semibold tracking-tight pb-1">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          {selectedCompany ? `Financial insights for ${selectedCompany.name}` : 'Select a Company to Explore Financial Insights'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Total Invoiced" 
          value={loading ? "Loading..." : formatCurrency(metrics?.total_invoiced || 0)} 
          loading={loading}
          icon={<BarChart className="h-4 w-4" />}
          trend={{ value: 8.2, isPositive: true }}
        />
        <KpiCard 
          title="Total Paid" 
          value={loading ? "Loading..." : formatCurrency(metrics?.total_paid || 0)} 
          loading={loading}
          icon={<BarChart className="h-4 w-4" />}
          trend={{ value: 12.5, isPositive: true }}
        />
        <KpiCard 
          title="Outstanding Amount" 
          value={loading ? "Loading..." : formatCurrency(metrics?.outstanding_amount || 0)} 
          loading={loading}
          icon={<ArrowDown className="h-4 w-4" />}
          trend={{ value: 3.8, isPositive: false }}
        />
        <KpiCard 
          title="Average Days to Pay" 
          value={loading ? "Loading..." : `${Math.round(metrics?.average_days_to_pay || 0)} days`} 
          loading={loading}
          icon={<Calendar className="h-4 w-4" />}
          trend={{ value: 1.3, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Payment Status Distribution">
          <PaymentStatusChart />
        </ChartCard>
        <ChartCard title="Revenue Over Time">
          <RevenueChart />
        </ChartCard>
      </div>
    </div>
  );
}
