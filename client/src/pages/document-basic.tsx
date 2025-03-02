import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FileClock, FileCheck, Book, Plus } from 'lucide-react';

export default function BasicDocumentManager() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Document Management</h1>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            <span>New Invoice</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            <span>New Estimate</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <FileText size={16} />
            <span>Invoices</span>
          </TabsTrigger>
          <TabsTrigger value="estimates" className="flex items-center gap-2">
            <FileClock size={16} />
            <span>Estimates</span>
          </TabsTrigger>
          <TabsTrigger value="bills" className="flex items-center gap-2">
            <FileCheck size={16} />
            <span>Bills</span>
          </TabsTrigger>
          <TabsTrigger value="bookkeeping" className="flex items-center gap-2">
            <Book size={16} />
            <span>Bookkeeping</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>INV-1001</CardTitle>
                <CardDescription>Acme Corporation</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Amount: $2,150.00</p>
                <p>Date: Mar 1, 2025</p>
                <p>Status: Draft</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline">View</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>INV-1002</CardTitle>
                <CardDescription>TechStart LLC</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Amount: $3,500.00</p>
                <p>Date: Mar 5, 2025</p>
                <p>Status: Paid</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline">View</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Estimates Tab */}
        <TabsContent value="estimates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>EST-2001</CardTitle>
                <CardDescription>Global Industries</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Amount: $5,750.00</p>
                <p>Date: Mar 3, 2025</p>
                <p>Status: Sent</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline">View</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Bills Tab */}
        <TabsContent value="bills">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>BILL-3001</CardTitle>
                <CardDescription>Office Supplies Inc</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Amount: $450.00</p>
                <p>Date: Feb 25, 2025</p>
                <p>Status: Paid</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline">View</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Bookkeeping Tab */}
        <TabsContent value="bookkeeping">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>BK-4001</CardTitle>
                <CardDescription>Monthly Reconciliation</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Date: Feb 28, 2025</p>
                <p>Status: Complete</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline">View</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}