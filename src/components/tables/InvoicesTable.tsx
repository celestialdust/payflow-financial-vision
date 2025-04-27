
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, getPaymentStatusClass } from "@/lib/utils";
import { Download } from "lucide-react";

export interface Invoice {
  id: string;
  reference: string;
  date: string;
  amount: number;
  paidAmount: number;
  daysToPay: number | null;
  status: string;
}

interface InvoicesTableProps {
  invoices: Invoice[];
  loading?: boolean;
  onExport?: () => void;
}

export function InvoicesTable({ invoices, loading = false, onExport }: InvoicesTableProps) {
  const [sortField, setSortField] = useState<keyof Invoice>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: keyof Invoice) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedInvoices = [...invoices].sort((a, b) => {
    if (a[sortField] === null) return 1;
    if (b[sortField] === null) return -1;
    
    if (sortField === "date") {
      return sortDirection === "asc"
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    
    if (typeof a[sortField] === "string" && typeof b[sortField] === "string") {
      return sortDirection === "asc"
        ? (a[sortField] as string).localeCompare(b[sortField] as string)
        : (b[sortField] as string).localeCompare(a[sortField] as string);
    }
    
    return sortDirection === "asc"
      ? Number(a[sortField]) - Number(b[sortField])
      : Number(b[sortField]) - Number(a[sortField]);
  });

  const renderSortIndicator = (field: keyof Invoice) => {
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
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        </TableRow>
      ));
    }

    if (sortedInvoices.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
            No invoices available for the selected company.
          </TableCell>
        </TableRow>
      );
    }

    return sortedInvoices.map((invoice) => (
      <TableRow key={invoice.id}>
        <TableCell className="font-medium">{invoice.reference}</TableCell>
        <TableCell>{invoice.date}</TableCell>
        <TableCell>{formatCurrency(invoice.amount)}</TableCell>
        <TableCell>{formatCurrency(invoice.paidAmount)}</TableCell>
        <TableCell>{invoice.daysToPay !== null ? `${invoice.daysToPay} days` : 'N/A'}</TableCell>
        <TableCell>
          <span className={getPaymentStatusClass(invoice.status)}>
            {invoice.status}
          </span>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Invoices</h3>
        <Button size="sm" className="gap-1" onClick={onExport} disabled={loading || invoices.length === 0}>
          <Download className="h-4 w-4" />
          Export Filtered Results
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort("reference")}>
                Invoice Reference{renderSortIndicator("reference")}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                Invoice Date{renderSortIndicator("date")}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("amount")}>
                Invoice Amount{renderSortIndicator("amount")}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("paidAmount")}>
                Paid Amount{renderSortIndicator("paidAmount")}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("daysToPay")}>
                Days to Pay{renderSortIndicator("daysToPay")}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                Payment Status{renderSortIndicator("status")}
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
