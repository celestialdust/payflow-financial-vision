
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { CompanyProvider } from "@/context/CompanyContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <CompanyProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-slate-50 dark:bg-slate-900">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
            <AppHeader />
            <main className="flex-1 overflow-y-auto">
              <div className="dashboard-container">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </CompanyProvider>
  );
}
