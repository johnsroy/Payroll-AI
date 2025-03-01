import React from 'react'
import { PayrollDataEntryTable } from '@/components/payroll/PayrollDataEntryTable'
import { useToast } from '@/hooks/use-toast'

export default function PayrollEntryPage() {
  const { toast } = useToast()

  // Handle saving payroll data
  const handleSavePayroll = (data: any[]) => {
    console.log('Saving payroll data:', data)
    
    // In a real application, you would make an API call here
    // For now, we'll just show a success toast
    toast({
      title: "Payroll data saved",
      description: `Successfully saved payroll data for ${data.length} employees.`,
      variant: "default",
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Payroll Data Entry</h1>
        <p className="text-muted-foreground mt-2">
          Manage employee payroll information with our streamlined data entry system.
        </p>
      </div>
      
      <div className="mb-6 bg-white rounded-lg shadow">
        <PayrollDataEntryTable onSave={handleSavePayroll} />
      </div>
      
      <div className="bg-muted p-4 rounded-md mb-8">
        <h3 className="text-lg font-medium mb-2">Quick Tips:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Double-click any cell to edit its contents</li>
          <li>Click outside or press Enter to save cell changes</li>
          <li>Use the search box to quickly find employees</li>
          <li>Regular hours are calculated at $25/hour</li>
          <li>Overtime hours are calculated at $37.50/hour</li>
          <li>Taxes are estimated at 20% of gross pay</li>
          <li>Net pay is automatically calculated</li>
        </ul>
      </div>
    </div>
  )
}