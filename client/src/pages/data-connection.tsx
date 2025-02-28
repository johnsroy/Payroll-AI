import { useEffect } from 'react';
import DataSourceConnection from '@/components/data-integration/DataSourceConnection';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { HomeIcon, Users, ChevronRight } from "lucide-react";
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function DataConnectionPage() {
  // Set the page title
  useEffect(() => {
    document.title = 'Connect Data | PayrollPro AI';
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">
                <div className="flex items-center">
                  <HomeIcon className="h-4 w-4" />
                </div>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">
                <div className="flex items-center">
                  Dashboard
                </div>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Data Connection</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      {/* Next Steps Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Data Integration</CardTitle>
          <CardDescription>
            Complete the following steps to set up your payroll data integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">1</div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Connect Data Sources</h3>
                <p className="text-muted-foreground">Connect your HR systems, databases, and other data sources</p>
              </div>
              <div className="ml-auto">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Current Step
                </span>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold">2</div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Import Employee Data</h3>
                <p className="text-muted-foreground">Import your employee details for payroll processing</p>
              </div>
              <div className="ml-auto">
                <Link href="/employee-import">
                  <Button variant="outline" className="flex items-center">
                    Go to Employee Import
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold">3</div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Configure AI Agents</h3>
                <p className="text-muted-foreground">Set up AI agents with your company's tax and compliance rules</p>
              </div>
              <div className="ml-auto">
                <Button variant="outline" className="flex items-center" disabled>
                  Configure Later
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <DataSourceConnection />
    </div>
  );
}