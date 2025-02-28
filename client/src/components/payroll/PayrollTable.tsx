import React, { useState } from "react";
import { PayrollEntry } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface PayrollTableProps {
  entries: PayrollEntry[];
  loading: boolean;
  onStatusChange?: (id: number, status: string) => void;
}

export default function PayrollTable({ entries, loading, onStatusChange }: PayrollTableProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter entries based on search term
  const filteredEntries = entries.filter(
    (entry) =>
      entry.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(entry.id).includes(searchTerm)
  );

  // Format currency
  const formatCurrency = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(value));
  };

  // Format date
  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle status change
  const handleStatusChange = (id: number, newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(id, newStatus);
      toast({
        title: "Status Updated",
        description: `Payroll entry #${id} status changed to ${newStatus}`,
      });
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "approved":
        return <Badge variant="secondary">Approved</Badge>;
      case "paid":
        return <Badge className="bg-green-500 text-white hover:bg-green-600">Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calculate totals for the summary row
  const totalGrossPay = filteredEntries.reduce(
    (sum, entry) => sum + Number(entry.grossPay),
    0
  );
  const totalNetPay = filteredEntries.reduce(
    (sum, entry) => sum + Number(entry.netPay),
    0
  );
  const totalRegularHours = filteredEntries.reduce(
    (sum, entry) => sum + Number(entry.regularHours),
    0
  );
  const totalOvertimeHours = filteredEntries.reduce(
    (sum, entry) => sum + Number(entry.overtimeHours || 0),
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold">Payroll Entries</div>
        <div className="flex gap-2">
          <Input
            placeholder="Search by ID or Employee ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Pay Period</TableHead>
              <TableHead className="text-right">Regular Hours</TableHead>
              <TableHead className="text-right">OT Hours</TableHead>
              <TableHead className="text-right">Gross Pay</TableHead>
              <TableHead className="text-right">Deductions</TableHead>
              <TableHead className="text-right">Net Pay</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  Loading payroll data...
                </TableCell>
              </TableRow>
            ) : filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  No payroll entries found.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {filteredEntries.map((entry) => {
                  const totalDeductions =
                    Number(entry.federalTax || 0) +
                    Number(entry.stateTax || 0) +
                    Number(entry.medicareTax || 0) +
                    Number(entry.socialSecurityTax || 0) +
                    Number(entry.healthInsurance || 0) +
                    Number(entry.retirement401k || 0) +
                    Number(entry.otherDeductions || 0);

                  return (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.id}</TableCell>
                      <TableCell>{entry.employeeId}</TableCell>
                      <TableCell>
                        {formatDate(entry.payPeriodStart)} -{" "}
                        {formatDate(entry.payPeriodEnd)}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.regularHours}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.overtimeHours || "0"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(entry.grossPay)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(totalDeductions)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(entry.netPay)}
                      </TableCell>
                      <TableCell>{getStatusBadge(entry.status || "pending")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {entry.status !== "approved" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(entry.id, "approved")}
                            >
                              Approve
                            </Button>
                          )}
                          {entry.status !== "paid" && entry.status === "approved" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(entry.id, "paid")}
                            >
                              Mark Paid
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                
                {/* Summary row */}
                <TableRow className="bg-muted/50 font-medium">
                  <TableCell colSpan={3} className="text-right">
                    Summary ({filteredEntries.length} entries):
                  </TableCell>
                  <TableCell className="text-right">{totalRegularHours.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{totalOvertimeHours.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalGrossPay)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalGrossPay - totalNetPay)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalNetPay)}</TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}