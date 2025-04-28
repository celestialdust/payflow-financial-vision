import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

// Define types in a way that prevents recursion
export interface Company {
  id: string;
  name: string;
}

// Define the context value type explicitly
interface CompanyContextValue {
  companies: readonly Company[];
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
  loading: boolean;
}

// Create a default value with proper typing
const defaultContextValue: CompanyContextValue = {
  companies: [],
  selectedCompany: null,
  setSelectedCompany: () => {},
  loading: true,
};

// Create the context with explicit typing
const CompanyContext = createContext<CompanyContextValue>(defaultContextValue);

// Export a properly typed hook
export const useCompany = (): CompanyContextValue => useContext(CompanyContext);

// Type the provider component properly
type CompanyProviderProps = {
  children: React.ReactNode;
};

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        console.log("Fetching companies from Supabase...");
        
        // First try the company_metrics table for unique client names
        let { data: metricsData, error: metricsError } = await supabase
          .from('company_metrics')
          .select('id, client_name')
          .order('client_name');
          
        if (metricsError) {
          console.error('Error fetching from company_metrics:', metricsError);
        }
        
        console.log("Metrics data response for companies:", metricsData);
        
        let uniqueCompanies: Company[] = [];
        
        if (metricsData && metricsData.length > 0) {
          // Use client names from metrics
          uniqueCompanies = metricsData.map(item => ({
            id: item.id || item.client_name || 'unknown-id',
            name: item.client_name || 'Unknown'
          }));
        } else {
          // If no data in company_metrics, try invoices
          const { data: invoiceData, error: invoiceError } = await supabase
            .from('invoices')
            .select('"Client Name"')
            .order('"Client Name"');
          
          if (invoiceError) {
            console.error('Error fetching from invoices:', invoiceError);
            throw invoiceError;
          }
          
          console.log("Invoice data response for companies:", invoiceData);
          
          if (invoiceData && invoiceData.length > 0) {
            // Create a unique set of client names
            const uniqueClientNames = new Set(invoiceData.map(item => item['Client Name']));
            
            // Convert to array format with proper id and name
            uniqueCompanies = Array.from(uniqueClientNames)
              .filter(Boolean)
              .map(name => ({
                id: String(name) || 'unknown-id',
                name: String(name) || 'Unknown'
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
          console.log(`Selected default company: ${uniqueCompanies[0].name}`);
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

  // Create a stable context value object
  const contextValue: CompanyContextValue = {
    companies,
    selectedCompany,
    setSelectedCompany,
    loading
  };

  return (
    <CompanyContext.Provider value={contextValue}>
      {children}
    </CompanyContext.Provider>
  );
};
