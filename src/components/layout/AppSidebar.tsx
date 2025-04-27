
import { 
  Sidebar, 
  SidebarContent,
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@/components/ui/sidebar";
import { LayoutDashboard, FileText, BarChart, Calendar } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function AppSidebar() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold leading-none">
            <span className="text-primary">PayFlow</span> Analytics
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Financial insights & analytics</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={isActive("/")}>
              <Link to="/">
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={isActive("/invoices")}>
              <Link to="/invoices">
                <FileText />
                <span>Invoice Explorer</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={isActive("/analytics")}>
              <Link to="/analytics">
                <BarChart />
                <span>Payment Analytics</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={isActive("/monthly")}>
              <Link to="/monthly">
                <Calendar />
                <span>Monthly Breakdown</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
