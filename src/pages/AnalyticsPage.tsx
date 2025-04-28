
import { ChartCard } from "@/components/dashboard/ChartCard";
import { PaymentTrendChart } from "@/components/charts/PaymentTrendChart";
import { PaymentStatusBarChart } from "@/components/charts/PaymentStatusBarChart";
import { LateInvoicesChart } from "@/components/charts/LateInvoicesChart";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h2 className="text-2xl font-semibold tracking-tight pb-1">Payment Analytics</h2>
        <p className="text-muted-foreground">Analyze Payment Behaviors</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Average Days to Pay by Month">
          <PaymentTrendChart />
        </ChartCard>
        
        <ChartCard title="Percentage of Late Invoices">
          <LateInvoicesChart />
        </ChartCard>
      </div>
    </div>
  );
}
