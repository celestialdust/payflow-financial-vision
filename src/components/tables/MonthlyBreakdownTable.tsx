
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

export interface MonthlyData {
  id: string;
  month: string;
  invoicedAmount: number;
  paidAmount: number;
  growthRate: number;
}

interface MonthlyBreakdownTableProps {
  data: MonthlyData[];
  loading?: boolean;
}

export function MonthlyBreakdownTable({ data, loading = false }: MonthlyBreakdownTableProps) {
  const [sortField, setSortField] = useState<keyof MonthlyData>("month");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

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
      // Extract year and month parts for proper date sorting
      const getDateValue = (monthStr: string) => {
        const [year, month] = monthStr.split('-').map(Number);
        return year * 100 + month;
      };
      
      return sortDirection === "asc"
        ? getDateValue(a.month) - getDateValue(b.month)
        : getDateValue(b.month) - getDateValue(a.month);
    }
    
    return sortDirection === "asc"
      ? a[sortField] - b[sortField]
      : b[sortField] - a[sortField];
  });

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
        </TableRow>
      ));
    }

    if (sortedData.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
            No monthly data available for the selected company.
          </TableCell>
        </TableRow>
      );
    }

    return sortedData.map((item) => (
      <TableRow key={item.id}>
        <TableCell className="font-medium">{item.month}</TableCell>
        <TableCell>{formatCurrency(item.invoicedAmount)}</TableCell>
        <TableCell>{formatCurrency(item.paidAmount)}</TableCell>
        <TableCell>
          <span className={item.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}>
            {item.growthRate >= 0 ? '+' : ''}{item.growthRate}%
          </span>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="rounded-md border">
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
            <TableHead className="cursor-pointer" onClick={() => handleSort("growthRate")}>
              Growth Rate (%){renderSortIndicator("growthRate")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {renderTableContent()}
        </TableBody>
      </Table>
    </div>
  );
}
