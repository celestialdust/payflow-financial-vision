
import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Mock data for companies
  useEffect(() => {
    // Simulating API call
    setTimeout(() => {
      const mockCompanies = [
        { id: '1', name: 'Acme Corporation' },
        { id: '2', name: 'Wayne Enterprises' },
        { id: '3', name: 'Stark Industries' },
        { id: '4', name: 'Umbrella Corporation' },
      ];
      setCompanies(mockCompanies);
      setSelectedCompany(mockCompanies[0]);
      setLoading(false);
      toast.success('Demo data loaded');
    }, 1000);
  }, []);

  return (
    <CompanyContext.Provider value={{ companies, selectedCompany, setSelectedCompany, loading }}>
      {children}
    </CompanyContext.Provider>
  );
};
