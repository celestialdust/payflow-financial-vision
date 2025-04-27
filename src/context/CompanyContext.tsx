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
        
        // First try the company_metrics table for unique client names
        let { data: metricsData, error: metricsError } = await supabase
          .from('company_metrics')
          .select('id, client_name');
          
        if (metricsError) {
          console.error('Error fetching from company_metrics:', metricsError);
        }
        
        let uniqueCompanies: Company[] = [];
        
        if (metricsData && metricsData.length > 0) {
          // Sort companies numerically if they are numbers
          uniqueCompanies = metricsData
            .map(item => ({
              id: item.id || item.client_name || 'unknown-id',
              name: item.client_name || 'Unknown'
            }))
            .sort((a, b) => {
              const numA = parseInt(a.name);
              const numB = parseInt(b.name);
              if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
              }
              return a.name.localeCompare(b.name);
            });
        } else {
          // Fallback to invoices if no metrics data
          const { data: invoiceData, error: invoiceError } = await supabase
            .from('invoices')
            .select('"Client Name"');
          
          if (invoiceError) throw invoiceError;
          
          if (invoiceData && invoiceData.length > 0) {
            const uniqueNames = new Set(invoiceData.map(item => item['Client Name']));
            uniqueCompanies = Array.from(uniqueNames)
              .map(name => ({
                id: name || 'unknown-id',
                name: name || 'Unknown'
              }))
              .sort((a, b) => {
                const numA = parseInt(a.name);
                const numB = parseInt(b.name);
                if (!isNaN(numA) && !isNaN(numB)) {
                  return numA - numB;
                }
                return a.name.localeCompare(b.name);
              });
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

  return (
    <CompanyContext.Provider value={{ companies, selectedCompany, setSelectedCompany, loading }}>
      {children}
    </CompanyContext.Provider>
  );
};
