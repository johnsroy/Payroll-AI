import React from 'react'
import { PayrollDataEntryTable } from '@/components/payroll/PayrollDataEntryTable'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function PayrollEntryPage() {
  const { toast } = useToast()

  // Handle saving payroll data
  const handleSavePayroll = (data: any[]) => {
    console.log('Saving payroll data:', data)
    
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
        <p className="text-gray-600 mt-2">
          Manage employee payroll information with our Workday-inspired data entry system.
        </p>
      </div>
      
      <Tabs defaultValue="data-entry" className="w-full mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="data-entry">Data Entry</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="data-entry">
          <Card>
            <CardHeader>
              <CardTitle>Employee Payroll Data</CardTitle>
              <CardDescription>
                Review and manage payroll entries for your employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4" variant="default">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Quick Tips</AlertTitle>
                <AlertDescription>
                  Use the template download and upload buttons to quickly import data. You can also add entries manually.
                </AlertDescription>
              </Alert>
              
              <PayrollDataEntryTable initialData={[]} onSave={handleSavePayroll} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Reports</CardTitle>
              <CardDescription>
                Generate and export payroll reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Reports Coming Soon</h3>
                <p className="text-gray-600">
                  Our advanced reporting features are currently in development and will be available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Settings</CardTitle>
              <CardDescription>
                Configure payroll calculation rules and defaults
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Settings Coming Soon</h3>
                <p className="text-gray-600">
                  Customizable settings for payroll calculations will be available in an upcoming update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Why use our Payroll Data Entry system?</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <li className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <strong className="block text-blue-800">Efficient data entry</strong>
              <span className="text-blue-700">Streamlined interface for quick and accurate payroll information entry</span>
            </div>
          </li>
          <li className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <strong className="block text-blue-800">Bulk import/export</strong>
              <span className="text-blue-700">Upload CSV files for bulk processing or download data in CSV format</span>
            </div>
          </li>
          <li className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <strong className="block text-blue-800">Automatic calculations</strong>
              <span className="text-blue-700">Intelligent system calculates net pay based on hours, deductions, and bonuses</span>
            </div>
          </li>
          <li className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <strong className="block text-blue-800">AI integration</strong>
              <span className="text-blue-700">Leverage AI agents for tax optimization and compliance assistance</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}