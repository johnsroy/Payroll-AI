import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExternalLink, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TestApp() {
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [databaseStatus, setDatabaseStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  
  useEffect(() => {
    document.title = 'Test Application | PayrollPro AI';
    
    // Check server status
    fetch('/api/data-sources')
      .then(response => {
        setServerStatus(response.ok ? 'online' : 'offline');
        if (response.ok) {
          setTestResults({...testResults, 'api-server': true});
        }
      })
      .catch(() => {
        setServerStatus('offline');
      });
    
    // Check database status
    fetch('/api/employee-data/jobs')
      .then(response => {
        setDatabaseStatus(response.ok ? 'connected' : 'error');
        if (response.ok) {
          setTestResults({...testResults, 'database': true});
        }
      })
      .catch(() => {
        setDatabaseStatus('error');
      });
  }, []);
  
  const testPages = [
    { name: 'Home Page', path: '/', id: 'home' },
    { name: 'Data Connection', path: '/data-connection', id: 'data-connection' },
    { name: 'Employee Import', path: '/employee-import', id: 'employee-import' },
  ];
  
  const handleTestPage = (id: string, path: string) => {
    window.open(path, '_blank');
    setTestResults({...testResults, [id]: true});
  };
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">PayrollPro AI - Test Page</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Check if the system components are working properly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <h3 className="font-medium">API Server</h3>
                <p className="text-sm text-muted-foreground">Express backend server</p>
              </div>
              <div>
                {serverStatus === 'checking' && (
                  <div className="text-blue-500 flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking...
                  </div>
                )}
                {serverStatus === 'online' && (
                  <div className="text-green-500 flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-1" />
                    Online
                  </div>
                )}
                {serverStatus === 'offline' && (
                  <div className="text-red-500 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-1" />
                    Offline
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <h3 className="font-medium">Database</h3>
                <p className="text-sm text-muted-foreground">Storage system</p>
              </div>
              <div>
                {databaseStatus === 'checking' && (
                  <div className="text-blue-500 flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking...
                  </div>
                )}
                {databaseStatus === 'connected' && (
                  <div className="text-green-500 flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-1" />
                    Connected
                  </div>
                )}
                {databaseStatus === 'error' && (
                  <div className="text-red-500 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-1" />
                    Error
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Page Tests</CardTitle>
            <CardDescription>Open and test various pages of the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {testPages.map((page) => (
              <div key={page.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h3 className="font-medium">{page.name}</h3>
                  <p className="text-sm text-muted-foreground">{page.path}</p>
                </div>
                <div className="flex items-center gap-2">
                  {testResults[page.id] && (
                    <div className="text-green-500">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleTestPage(page.id, page.path)}
                    className="flex items-center"
                  >
                    Test <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Testing Instructions</h2>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">1. Data Connection Page</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Test connecting to various data sources:
            </p>
            <ul className="list-disc list-inside text-sm ml-2 space-y-1">
              <li>Try uploading a CSV file (you can create a small sample CSV)</li>
              <li>Test connecting to an HR system (this is simulated)</li>
              <li>Try the database connection form</li>
              <li>Test the API connection form</li>
            </ul>
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="flex items-center" 
                onClick={() => handleTestPage('data-connection', '/data-connection')}
              >
                Go to Data Connection <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">2. Employee Import Page</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Test the employee data import functionality:
            </p>
            <ul className="list-disc list-inside text-sm ml-2 space-y-1">
              <li>Create a CSV file with employee data (First Name, Last Name, Email, etc.)</li>
              <li>Upload the file and test the field mapping interface</li>
              <li>Complete the import process and check the import history</li>
              <li>Test deleting an import job</li>
            </ul>
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="flex items-center" 
                onClick={() => handleTestPage('employee-import', '/employee-import')}
              >
                Go to Employee Import <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Separator className="my-8" />
      
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Next Development Steps</h2>
        <p className="text-muted-foreground mb-6">What would you like to add to the project next?</p>
        <div className="flex flex-col gap-3 max-w-md mx-auto">
          <Button onClick={() => alert("Let's implement this next!")}>
            HR System Integration
          </Button>
          <Button onClick={() => alert("Let's implement this next!")}>
            AI Agent Configuration
          </Button>
          <Button onClick={() => alert("Let's implement this next!")}>
            Payroll Data Analysis Tools
          </Button>
          <Button onClick={() => alert("Let's implement this next!")}>
            Tax and Compliance Features
          </Button>
        </div>
      </div>
    </div>
  );
}