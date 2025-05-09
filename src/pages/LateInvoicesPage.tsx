
import { useState, useEffect } from "react";
import { useCompany } from "@/context/CompanyContext";
import { InvoicesTable, Invoice } from "@/components/tables/InvoicesTable";
import { supabase } from "@/integrations/supabase/client";

interface InvoiceData {
  id: string;
  "Invoice Reference": string | null;
  "Date Invoiced": string | null;
  "Invoice Amount": number | null;
  "Paid Amount": number | null;
  "No. Days taken to Pay": number | null;
  "Payment Status": string | null;
  [key: string]: any;
}

export default function LateInvoicesPage() {
  const { selectedCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [lateInvoices, setLateInvoices] = useState<Invoice[]>([]);
  
  useEffect(() => {
    const fetchLateInvoices = async () => {
      if (!selectedCompany) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .eq('"Client Name"', selectedCompany.name)
          .eq('"Is Late"', true) as { data: InvoiceData[] | null, error: any };
          
        if (error) throw error;
        
        if (data) {
          const formattedInvoices: Invoice[] = data.map(item => ({
            id: item.id,
            reference: item['Invoice Reference'] || '',
            date: item['Date Invoiced'] || '',
            amount: item['Invoice Amount'] || 0,
            paidAmount: item['Paid Amount'] || 0,
            daysToPay: item['No. Days taken to Pay'] || null,
            status: item['Payment Status'] || 'Unknown'
          }));
          setLateInvoices(formattedInvoices);
        }
      } catch (error) {
        console.error('Error fetching late invoices:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLateInvoices();
  }, [selectedCompany]);

  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h2 className="text-2xl font-semibold tracking-tight pb-1">Late Invoices</h2>
        <p className="text-muted-foreground">Invoices that were paid after 30 days</p>
      </div>
      
      <InvoicesTable 
        invoices={lateInvoices}
        loading={loading}
      />
    </div>
  );
}
