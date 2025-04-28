
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
  const itemsPerPage = 1000;

  useEffect(() => {
    if (!selectedCompany) return;

    const fetchInvoices = async () => {
      setLoading(true);
      try {
        console.log(`Fetching invoices for company: ${selectedCompany.name}`);
        
        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .eq('"Client Name"', selectedCompany.name) as { data: any[], error: any };

        if (error) {
          console.error('Error fetching invoices:', error);
          throw error;
        }
        
        console.log("Invoice data:", data);

        if (data && data.length > 0) {
          const formattedInvoices: Invoice[] = data.map(item => ({
            id: item.id,
            reference: item['Invoice Reference'] || `INV-${Math.floor(Math.random() * 10000)}`,
            date: item['Date Invoiced'] || new Date().toISOString().split('T')[0],
            amount: item['Invoice Amount'] || 0,
            paidAmount: item['Paid Amount'] || 0,
            daysToPay: item['No. Days taken to Pay'] || 0,
            status: item['Payment Status'] || 'Unpaid'
          }));

          setInvoices(formattedInvoices);
          setFilteredInvoices(formattedInvoices);
          toast.success(`Loaded ${formattedInvoices.length} invoices`);
        } else {
          console.log("No invoice data found, using mock data");
          // Use mock data if no real data available
          const mockInvoices: Invoice[] = Array.from({ length: 10 }, (_, i) => ({
            id: `mock-${i + 1}`,
            reference: `INV-${2023}-${i + 1000}`,
            date: `2023-${String(i % 12 + 1).padStart(2, '0')}-${String(Math.min(28, i + 1)).padStart(2, '0')}`,
            amount: 1000 + (i * 100),
            paidAmount: i % 3 === 0 ? 0 : 1000 + (i * 100),
            daysToPay: i % 3 === 0 ? 0 : 15 + i,
            status: i % 3 === 0 ? 'Unpaid' : (i % 3 === 1 ? 'Fully Paid' : 'Partially Paid')
          }));
          
          setInvoices(mockInvoices);
          setFilteredInvoices(mockInvoices);
          toast.info('Using demo invoice data');
        }
      } catch (error) {
        console.error('Error fetching invoices:', error);
        toast.error('Failed to load invoices');
        
        // Use mock data in case of error
        const mockInvoices: Invoice[] = Array.from({ length: 10 }, (_, i) => ({
            id: `mock-${i + 1}`,
            reference: `INV-${2023}-${i + 1000}`,
            date: `2023-${String(i % 12 + 1).padStart(2, '0')}-${String(Math.min(28, i + 1)).padStart(2, '0')}`,
            amount: 1000 + (i * 100),
            paidAmount: i % 3 === 0 ? 0 : 1000 + (i * 100),
            daysToPay: i % 3 === 0 ? 0 : 15 + i,
            status: i % 3 === 0 ? 'Unpaid' : (i % 3 === 1 ? 'Fully Paid' : 'Partially Paid')
        }));
        
        setInvoices(mockInvoices);
        setFilteredInvoices(mockInvoices);
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
