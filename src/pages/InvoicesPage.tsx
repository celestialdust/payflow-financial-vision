
import { useState, useEffect } from "react";
import { useCompany } from "@/context/CompanyContext";
import { FilterPanel, FilterValues } from "@/components/filters/FilterPanel";
import { InvoicesTable, Invoice } from "@/components/tables/InvoicesTable";
import { toast } from "sonner";

export default function InvoicesPage() {
  const { selectedCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!selectedCompany) return;

    // Simulate API call delay
    setLoading(true);
    setTimeout(() => {
      const mockInvoices: Invoice[] = Array.from({ length: 20 }).map((_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 60));
        
        const amount = Math.floor(Math.random() * 10000) + 1000;
        const statuses = ["Fully Paid", "Partially Paid", "Unpaid", "Overpaid"];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        let paidAmount = 0;
        let daysToPay = null;
        
        if (status === "Fully Paid") {
          paidAmount = amount;
          daysToPay = Math.floor(Math.random() * 45) + 1;
        } else if (status === "Partially Paid") {
          paidAmount = Math.floor(amount * 0.7);
          daysToPay = Math.floor(Math.random() * 45) + 1;
        } else if (status === "Overpaid") {
          paidAmount = Math.floor(amount * 1.05);
          daysToPay = Math.floor(Math.random() * 30) + 1;
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return {
          id: `inv-${index + 1}`,
          reference: `${year}-${1000 + index}`,
          date: `${year}-${month}-${day}`,
          amount,
          paidAmount,
          daysToPay,
          status
        };
      });
      
      setInvoices(mockInvoices);
      setFilteredInvoices(mockInvoices);
      setLoading(false);
    }, 1000);
  }, [selectedCompany]);

  const handleFilter = (filters: FilterValues) => {
    if (!invoices.length) return;
    
    let filtered = [...invoices];
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(invoice => 
        invoice.reference.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply date filters
    if (filters.dateFrom) {
      filtered = filtered.filter(invoice => 
        new Date(invoice.date) >= new Date(filters.dateFrom)
      );
    }
    
    if (filters.dateTo) {
      filtered = filtered.filter(invoice => 
        new Date(invoice.date) <= new Date(filters.dateTo)
      );
    }
    
    // Apply amount filters
    if (filters.minAmount) {
      filtered = filtered.filter(invoice => 
        invoice.amount >= parseFloat(filters.minAmount)
      );
    }
    
    if (filters.maxAmount) {
      filtered = filtered.filter(invoice => 
        invoice.amount <= parseFloat(filters.maxAmount)
      );
    }
    
    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(invoice => 
        invoice.status.toLowerCase() === filters.status.toLowerCase()
      );
    }
    
    setFilteredInvoices(filtered);
    setCurrentPage(1); // Reset to first page on filter
  };

  const handleExport = () => {
    toast.success("Exporting invoice data...");
    
    // In a real application, this would generate and download a CSV file
    setTimeout(() => {
      toast.success("Invoice data exported successfully!");
    }, 1500);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h2 className="text-2xl font-semibold tracking-tight pb-1">Invoice Explorer</h2>
        <p className="text-muted-foreground">Explore All Invoices</p>
      </div>
      
      <FilterPanel onFilter={handleFilter} />
      
      <InvoicesTable 
        invoices={currentInvoices} 
        loading={loading} 
        onExport={handleExport} 
      />
    </div>
  );
}
