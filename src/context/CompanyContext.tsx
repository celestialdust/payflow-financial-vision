
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

export interface Company {
  id: string;
  name: string;
}

interface CompanyContextType {
  companies: Company[];
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
  loading: boolean;
}

const CompanyContext = createContext<CompanyContextType>({
  companies: [],
  selectedCompany: null,
  setSelectedCompany: () => {},
  loading: true,
});

export const useCompany = () => useContext(CompanyContext);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        console.log("Fetching companies from Supabase...");
        
        // First try to get distinct client names from invoices
        let { data: invoiceData, error: invoiceError } = await supabase
          .from('invoices')
          .select('Client Name')
          .order('Client Name');
          
        if (invoiceError) {
          console.error('Error fetching from invoices:', invoiceError);
          throw invoiceError;
        }
        
        console.log("Invoice data response:", invoiceData);
        
        let uniqueCompanies: Company[] = [];
        
        if (invoiceData && invoiceData.length > 0) {
          // Use client names from invoices
          uniqueCompanies = Array.from(
            new Map(invoiceData.map(item => [item['Client Name'], {
              id: item['Client Name'], // Using client name as ID since we don't have a separate ID
              name: item['Client Name']
            }])).values()
          );
        } else {
          // If no data in invoices, try company_metrics
          const { data: metricsData, error: metricsError } = await supabase
            .from('company_metrics')
            .select('id, client_name')
            .order('client_name');
          
          if (metricsError) {
            console.error('Error fetching from company_metrics:', metricsError);
            throw metricsError;
          }
          
          console.log("Metrics data response:", metricsData);
          
          if (metricsData && metricsData.length > 0) {
            uniqueCompanies = metricsData.map(item => ({
              id: item.id,
              name: item.client_name || 'Unknown'
            }));
          }
        }
        
        console.log("Processed unique companies:", uniqueCompanies);
        
        // If no real data, add fallback companies for development
        if (uniqueCompanies.length === 0) {
          uniqueCompanies = [
            { id: 'company-1', name: 'Acme Corp' },
            { id: 'company-2', name: 'Globex Industries' },
            { id: 'company-3', name: 'Stark Enterprises' }
          ];
          console.log("No companies found in database, using fallback data");
          toast.info('Using demo companies - no data found in database');
        } else {
          toast.success(`${uniqueCompanies.length} companies loaded successfully`);
        }
        
        setCompanies(uniqueCompanies);
        
        // Select the first company by default
        if (uniqueCompanies.length > 0 && !selectedCompany) {
          setSelectedCompany(uniqueCompanies[0]);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
        toast.error('Failed to load companies');
        
        // Set fallback companies in case of error
        const fallbackCompanies = [
          { id: 'company-1', name: 'Acme Corp' },
          { id: 'company-2', name: 'Globex Industries' },
          { id: 'company-3', name: 'Stark Enterprises' }
        ];
        setCompanies(fallbackCompanies);
        if (!selectedCompany && fallbackCompanies.length > 0) {
          setSelectedCompany(fallbackCompanies[0]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  return (
    <CompanyContext.Provider value={{ companies, selectedCompany, setSelectedCompany, loading }}>
      {children}
    </CompanyContext.Provider>
  );
};
