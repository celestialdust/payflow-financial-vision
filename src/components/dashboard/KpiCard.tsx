
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface KpiCardProps {
  title: string;
  value: string | number;
  description?: string;
  loading?: boolean;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function KpiCard({ title, value, description, loading = false, icon, trend }: KpiCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-6 w-3/4" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {description && !loading && (
          <p className="text-xs text-muted-foreground pt-1">{description}</p>
        )}
        {trend && !loading && (
          <div className={`flex items-center text-xs mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <span className="mr-1">
              {trend.isPositive ? '↑' : '↓'}
            </span>
            <span>{Math.abs(trend.value)}%</span>
            <span className="ml-1">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
