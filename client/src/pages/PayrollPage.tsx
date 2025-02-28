import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import PayrollTable from "@/components/payroll/PayrollTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DownloadIcon,
  FilterIcon,
  PlusIcon,
  RefreshCwIcon,
} from "lucide-react";
import { PayrollEntry } from "@shared/schema";

// Define stats interface to match API response
interface PayrollStats {
  totalEntries: number;
  totalGrossPay: number;
  totalNetPay: number;
  totalFederalTax: number;
  totalHours: number;
  avgGrossPay: number;
  avgNetPay: number;
  taxPercentage: number;
}

export default function PayrollPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");

  // Fetch payroll entries
  const {
    data: payrollEntries = [] as PayrollEntry[],
    isLoading,
    isError,
    refetch,
  } = useQuery<PayrollEntry[]>({
    queryKey: ["/api/payroll"],
    refetchOnWindowFocus: false,
  });

  // Fetch payroll statistics
  const {
    data: payrollStats = {} as PayrollStats,
    isLoading: statsLoading,
  } = useQuery<PayrollStats>({
    queryKey: ["/api/payroll/statistics"],
    refetchOnWindowFocus: false,
  });

  // Update payroll entry status mutation
  const updatePayrollStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/payroll/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/statistics"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update payroll status",
        variant: "destructive",
      });
    },
  });

  // Filter entries based on the active tab
  const filteredEntries = payrollEntries.filter((entry: PayrollEntry) => {
    if (activeTab === "all") return true;
    return entry.status === activeTab;
  });

  // Handle status change
  const handleStatusChange = (id: number, status: string) => {
    updatePayrollStatusMutation.mutate({ id, status });
  };

  // Format currency for statistical data
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  if (isError) {
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="bg-destructive/20 text-destructive p-4 rounded-md mb-4">
          Error loading payroll data. Please try again later.
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCwIcon className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground">
            View, manage, and analyze all payroll activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <PlusIcon className="w-4 h-4 mr-2" /> New Payroll Entry
          </Button>
          <Button variant="outline">
            <FilterIcon className="w-4 h-4 mr-2" /> Filter
          </Button>
          <Button variant="outline">
            <DownloadIcon className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {payrollStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Gross Payroll
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(payrollStats.totalGrossPay)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                For {payrollStats.totalEntries} payroll entries
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Net Pay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(payrollStats.totalNetPay)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                After all deductions and taxes
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Pay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(payrollStats.avgGrossPay)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Per payroll entry (gross)
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payrollStats.totalHours?.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Including overtime hours
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payroll Table with Tabs */}
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">All Entries</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <PayrollTable
            entries={filteredEntries}
            loading={isLoading}
            onStatusChange={handleStatusChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}