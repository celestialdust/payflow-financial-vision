import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface MonthlyData {
  id: string;
  month: string;
  invoicedAmount: number;
  paidAmount: number;
  outstandingAmount?: number;
  growthRate: number;
}

interface MonthlyBreakdownTableProps {
  data: MonthlyData[];
  loading?: boolean;
}

export function MonthlyBreakdownTable({ data, loading = false }: MonthlyBreakdownTableProps) {
  const [sortField, setSortField] = useState<keyof MonthlyData>("month");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (field: keyof MonthlyData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (sortField === "month") {
      const getDateValue = (monthStr: string) => {
        const [year, month] = monthStr.split('-').map(Number);
        return year * 100 + month;
      };
      
      const valueA = getDateValue(a.month);
      const valueB = getDateValue(b.month);
      
      return sortDirection === "asc"
        ? valueA - valueB
        : valueB - valueA;
    }
    
    const valueA = a[sortField] as number;
    const valueB = b[sortField] as number;
    
    return sortDirection === "asc"
      ? valueA - valueB
      : valueB - valueA;
  });

  const pageCount = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderSortIndicator = (field: keyof MonthlyData) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? " ▲" : " ▼";
  };

  const renderTableContent = () => {
    if (loading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        </TableRow>
      ));
    }

    if (paginatedData.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
            No monthly data available.
          </TableCell>
        </TableRow>
      );
    }

    return paginatedData.map((item) => {
      const outstandingAmount = item.invoicedAmount - item.paidAmount;
      return (
        <TableRow key={item.id}>
          <TableCell className="font-medium">{item.month}</TableCell>
          <TableCell>{formatCurrency(item.invoicedAmount)}</TableCell>
          <TableCell>{formatCurrency(item.paidAmount)}</TableCell>
          <TableCell>{formatCurrency(outstandingAmount)}</TableCell>
          <TableCell>
            <span className={item.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}>
              {item.growthRate >= 0 ? '+' : ''}{item.growthRate}%
            </span>
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort("month")}>
                Month{renderSortIndicator("month")}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("invoicedAmount")}>
                Invoiced Amount{renderSortIndicator("invoicedAmount")}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("paidAmount")}>
                Paid Amount{renderSortIndicator("paidAmount")}
              </TableHead>
              <TableHead>Outstanding Amount</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("growthRate")}>
                Invoiced Amount Growth{renderSortIndicator("growthRate")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderTableContent()}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
