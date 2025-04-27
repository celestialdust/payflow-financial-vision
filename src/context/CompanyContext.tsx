
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
        const { data, error } = await supabase
          .from('company_metrics')
          .select('id, client_name')
          .order('client_name');

        if (error) {
          throw error;
        }

        const uniqueCompanies = Array.from(
          new Map(data.map(item => [item.client_name, {
            id: item.id,
            name: item.client_name
          }])).values()
        );

        setCompanies(uniqueCompanies);
        if (uniqueCompanies.length > 0) {
          setSelectedCompany(uniqueCompanies[0]);
        }
        toast.success('Companies loaded successfully');
      } catch (error) {
        console.error('Error fetching companies:', error);
        toast.error('Failed to load companies');
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
