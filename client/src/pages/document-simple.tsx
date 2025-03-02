import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, FileText, FileClock, FileCheck, Book, Plus, Download, Mail, Printer } from 'lucide-react';

// Define document types
enum DocumentType {
  INVOICE = 'invoice',
  ESTIMATE = 'estimate',
  BILL = 'bill',
  BOOKKEEPING = 'bookkeeping'
}

// Define document interface
interface Document {
  id: string;
  type: DocumentType;
  title: string;
  client: string;
  amount: number;
  date: string;
  status: string;
}

export default function SimpleDocumentManagerPage() {
  // State for documents
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      type: DocumentType.INVOICE,
      title: 'INV-1001',
      client: 'Acme Corporation',
      amount: 2150,
      date: '2025-03-01',
      status: 'Draft'
    },
    {
      id: '2',
      type: DocumentType.ESTIMATE,
      title: 'EST-2001',
      client: 'TechStart LLC',
      amount: 10800,
      date: '2025-03-02',
      status: 'Sent'
    }
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [currentDocumentType, setCurrentDocumentType] = useState<DocumentType>(DocumentType.INVOICE);

  // Handle document creation
  const handleCreateNew = (type: DocumentType) => {
    setCurrentDocumentType(type);
    setFormOpen(true);
  };

  // Handle document preview
  const handlePreviewDocument = (document: Document) => {
    setSelectedDocument(document);
    setPreviewOpen(true);
  };

  // Filter documents by type
  const getDocumentsByType = (type: DocumentType) => {
    return documents
      .filter(doc => doc.type === type)
      .filter(doc => 
        searchQuery === '' || 
        doc.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
  };

  // Get status badge color
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'draft': return 'bg-gray-200 text-gray-800';
      case 'sent': return 'bg-blue-200 text-blue-800';
      case 'paid': return 'bg-green-200 text-green-800';
      case 'overdue': return 'bg-red-200 text-red-800';
      case 'accepted': return 'bg-purple-200 text-purple-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Document Management</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search documents..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => handleCreateNew(DocumentType.INVOICE)}
            >
              <Plus size={16} />
              <span>New Invoice</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => handleCreateNew(DocumentType.ESTIMATE)}
            >
              <Plus size={16} />
              <span>New Estimate</span>
            </Button>
          </div>
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
            {getDocumentsByType(DocumentType.INVOICE).length > 0 ? (
              getDocumentsByType(DocumentType.INVOICE).map((invoice) => (
                <Card key={invoice.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <CardTitle>{invoice.title}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-base mt-2">
                      {invoice.client}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span>{formatDate(invoice.date)}</span>
                      </div>
                      <div className="flex justify-between font-medium pt-2">
                        <span>Total:</span>
                        <span>${invoice.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t flex justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handlePreviewDocument(invoice)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Button>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Download PDF">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Send Email">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Invoices Found</h3>
                <p className="text-gray-500 mb-4 text-center max-w-md">
                  You haven't created any invoices yet. Create your first invoice to get started.
                </p>
                <Button 
                  onClick={() => handleCreateNew(DocumentType.INVOICE)}
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>New Invoice</span>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Other tabs similarly structured */}
        <TabsContent value="estimates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getDocumentsByType(DocumentType.ESTIMATE).length > 0 ? (
              getDocumentsByType(DocumentType.ESTIMATE).map((estimate) => (
                <Card key={estimate.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <FileClock className="h-5 w-5 text-green-600" />
                        <CardTitle>{estimate.title}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(estimate.status)}>
                        {estimate.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-base mt-2">
                      {estimate.client}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span>{formatDate(estimate.date)}</span>
                      </div>
                      <div className="flex justify-between font-medium pt-2">
                        <span>Total:</span>
                        <span>${estimate.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t flex justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handlePreviewDocument(estimate)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Button>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
                <FileClock className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Estimates Found</h3>
                <p className="text-gray-500 mb-4 text-center max-w-md">
                  You haven't created any estimates yet. Create your first estimate to get started.
                </p>
                <Button 
                  onClick={() => handleCreateNew(DocumentType.ESTIMATE)}
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>New Estimate</span>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Form and Preview Dialogs would be defined here */}
      {formOpen && (
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Document</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p>Document form would go here</p>
              <div className="mt-4 flex justify-end">
                <Button onClick={() => setFormOpen(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {selectedDocument && previewOpen && (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedDocument.title}</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p>Client: {selectedDocument.client}</p>
              <p>Date: {formatDate(selectedDocument.date)}</p>
              <p>Amount: ${selectedDocument.amount.toFixed(2)}</p>
              <p>Status: {selectedDocument.status}</p>
              <div className="mt-4 flex justify-end">
                <Button onClick={() => setPreviewOpen(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}