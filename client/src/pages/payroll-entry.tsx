'use client'

import React, { useState } from 'react'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EnhancedPayrollTable } from "../components/payroll/EnhancedPayrollTable"
import { SimplePayrollTable } from "../components/payroll/SimplePayrollTable"
import { FilePlus, Upload, Download, FileSpreadsheet, HelpCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function PayrollEntryPage() {
  const [activeTab, setActiveTab] = useState("entry")

  // Mock function for importing data
  const handleImport = () => {
    alert("Import functionality would open a file dialog to upload payroll data.")
  }

  // Mock function for exporting data
  const handleExport = () => {
    alert("Export functionality would download current payroll data as CSV or Excel.")
  }

  // Mock function for accessing templates
  const handleTemplates = () => {
    alert("Templates section would provide downloadable payroll data templates.")
  }

  // Mock function for help/documentation
  const handleHelp = () => {
    alert("Help section would provide comprehensive documentation on the payroll entry process.")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Payroll Data Entry</h1>
          <p className="text-gray-600 mt-1">
            Manage employee payroll information for the current pay period
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleImport}>
                  <Upload className="h-4 w-4 mr-1" />
                  Import
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Import payroll data from CSV or Excel</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export current payroll data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleTemplates}>
                  <FileSpreadsheet className="h-4 w-4 mr-1" />
                  Templates
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Access payroll data templates</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleHelp}>
                  <HelpCircle className="h-4 w-4 mr-1" />
                  Help
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View payroll documentation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle>Current Pay Period</CardTitle>
          <CardDescription>
            February 1 - February 15, 2025
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">Pay Period Type</p>
              <p className="text-2xl font-bold">Semi-Monthly</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800 font-medium">Submission Deadline</p>
              <p className="text-2xl font-bold">Feb 17, 2025</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800 font-medium">Payment Date</p>
              <p className="text-2xl font-bold">Feb 20, 2025</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="entry" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="entry">Enhanced Entry</TabsTrigger>
          <TabsTrigger value="simple">Simple View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="entry">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Payroll Data Entry</CardTitle>
              <CardDescription>
                Enter employee time and pay information. The system will automatically calculate net pay based on hours worked.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedPayrollTable />
            </CardContent>
            <CardFooter className="border-t pt-6 text-sm text-gray-500">
              <div>
                <p>Last updated: March 1, 2025 at 8:15 AM</p>
                <p>Note: All monetary values are in USD ($)</p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="simple">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Simple Payroll View</CardTitle>
              <CardDescription>
                Simplified payroll data entry with basic fields.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimplePayrollTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}