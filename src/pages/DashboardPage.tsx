
import { useState, useEffect } from "react";
import { useCompany } from "@/context/CompanyContext";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { PaymentStatusChart } from "@/components/charts/PaymentStatusChart";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Calendar, ArrowDown } from "lucide-react";

interface CompanyMetrics {
  totalInvoiced: number;
  totalPaid: number;
  outstandingAmount: number;
  averageDaysToPay: number;
}

export default function DashboardPage() {
  const { selectedCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<CompanyMetrics | null>(null);

  useEffect(() => {
    if (!selectedCompany) return;

    // Simulate API call delay
    setLoading(true);
    setTimeout(() => {
      const mockMetrics: CompanyMetrics = {
        totalInvoiced: 125000,
        totalPaid: 97500,
        outstandingAmount: 27500,
        averageDaysToPay: 28.5
      };
      setMetrics(mockMetrics);
      setLoading(false);
    }, 1000);
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
          value={loading ? "Loading..." : formatCurrency(metrics?.totalInvoiced || 0)} 
          loading={loading}
          icon={<BarChart className="h-4 w-4" />}
          trend={{ value: 8.2, isPositive: true }}
        />
        <KpiCard 
          title="Total Paid" 
          value={loading ? "Loading..." : formatCurrency(metrics?.totalPaid || 0)} 
          loading={loading}
          icon={<BarChart className="h-4 w-4" />}
          trend={{ value: 12.5, isPositive: true }}
        />
        <KpiCard 
          title="Outstanding Amount" 
          value={loading ? "Loading..." : formatCurrency(metrics?.outstandingAmount || 0)} 
          loading={loading}
          icon={<ArrowDown className="h-4 w-4" />}
          trend={{ value: 3.8, isPositive: false }}
        />
        <KpiCard 
          title="Average Days to Pay" 
          value={loading ? "Loading..." : `${metrics?.averageDaysToPay} days`} 
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
