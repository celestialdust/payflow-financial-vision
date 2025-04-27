import { useState, useEffect } from "react";
import { useCompany } from "@/context/CompanyContext";
import { FilterPanel, FilterValues } from "@/components/filters/FilterPanel";
import { InvoicesTable, Invoice } from "@/components/tables/InvoicesTable";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function InvoicesPage() {
  const { selectedCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!selectedCompany) return;

    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .eq('Client Name', selectedCompany.name);

        if (error) throw error;

        const formattedInvoices: Invoice[] = data.map(item => ({
          id: item.id,
          reference: item['Invoice Reference'],
          date: item['Date Invoiced'],
          amount: item['Invoice Amount'],
          paidAmount: item['Paid Amount'],
          daysToPay: item['No. Days taken to Pay'],
          status: item['Payment Status']
        }));

        setInvoices(formattedInvoices);
        setFilteredInvoices(formattedInvoices);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        toast.error('Failed to load invoices');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
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
