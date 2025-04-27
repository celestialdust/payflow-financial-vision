
import { useCompany } from "@/context/CompanyContext";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export function AppHeader() {
  const { companies, selectedCompany, setSelectedCompany, loading } = useCompany();
  
  const handleCompanyChange = (value: string) => {
    const company = companies.find(c => c.id === value);
    if (company) {
      setSelectedCompany(company);
    }
  };

  return (
    <header className="h-16 border-b bg-white dark:bg-gray-900 flex items-center px-4 sticky top-0 z-30">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <h1 className="text-lg md:text-xl font-semibold leading-none tracking-tight">PayFlow</h1>
        </div>
        
        <div className="flex-1 flex justify-end items-center gap-4">
          <div className="w-[240px]">
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <div className="flex items-center">
                <label className="mr-2 text-sm text-gray-500">Company:</label>
                <Select value={selectedCompany?.id} onValueChange={handleCompanyChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
