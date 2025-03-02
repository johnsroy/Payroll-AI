import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, FileText, FileCheck, FileClock, Book, Plus, Download, Mail, Printer } from 'lucide-react';

// Define document types
enum DocumentType {
  INVOICE = 'invoice',
  ESTIMATE = 'estimate',
  BILL = 'bill',
  BOOKKEEPING = 'bookkeeping'
}

// Define document interface
interface DocumentItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
}

interface Document {
  id: string;
  type: DocumentType;
  documentNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  issueDate: string;
  dueDate: string;
  notes: string;
  lineItems: DocumentItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  status: string;
}

export default function DocumentManagerPage() {
  // State for documents
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      type: DocumentType.INVOICE,
      documentNumber: 'INV-1001',
      clientName: 'Acme Corporation',
      clientEmail: 'billing@acme.com',
      clientAddress: '123 Business Rd\nCorporate City, ST 12345',
      issueDate: '2025-03-01',
      dueDate: '2025-03-31',
      notes: 'Thank you for your business!',
      lineItems: [
        {
          id: '1a',
          description: 'Web Development Services',
          quantity: 10,
          unitPrice: 150,
          tax: 7.5,
          total: 1612.5
        },
        {
          id: '1b',
          description: 'Logo Design',
          quantity: 1,
          unitPrice: 500,
          tax: 7.5,
          total: 537.5
        }
      ],
      subtotal: 2000,
      taxTotal: 150,
      grandTotal: 2150,
      status: 'Draft'
    },
    {
      id: '2',
      type: DocumentType.ESTIMATE,
      documentNumber: 'EST-2001',
      clientName: 'TechStart LLC',
      clientEmail: 'finance@techstart.com',
      clientAddress: '456 Innovation Ave\nStartup Valley, CA 94103',
      issueDate: '2025-03-02',
      dueDate: '2025-04-02',
      notes: 'Estimate valid for 30 days.',
      lineItems: [
        {
          id: '2a',
          description: 'Mobile App Development',
          quantity: 80,
          unitPrice: 125,
          tax: 8,
          total: 10800
        }
      ],
      subtotal: 10000,
      taxTotal: 800,
      grandTotal: 10800,
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
        doc.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase())
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

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Document Preview Component
  const DocumentPreview = ({ document, open, onOpenChange }: { document: Document | null, open: boolean, onOpenChange: (open: boolean) => void }) => {
    if (!document) return null;

    // Get document title based on type
    const getDocumentTitle = (type: DocumentType): string => {
      switch (type) {
        case DocumentType.INVOICE: return 'Invoice';
        case DocumentType.ESTIMATE: return 'Estimate';
        case DocumentType.BILL: return 'Bill';
        case DocumentType.BOOKKEEPING: return 'Bookkeeping Record';
        default: return 'Document';
      }
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {getDocumentTitle(document.type)} {document.documentNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 print:p-0">
            {/* Document Header */}
            <div className="flex justify-between items-start mb-8">
              {/* Company Info */}
              <div>
                <h2 className="text-xl font-bold mb-1">Your Company Name</h2>
                <p className="text-gray-600">123 Business Street</p>
                <p className="text-gray-600">Business City, ST 12345</p>
                <p className="text-gray-600">contact@yourcompany.com</p>
                <p className="text-gray-600">(123) 456-7890</p>
              </div>
              
              {/* Document Info */}
              <div className="text-right">
                <h1 className="text-2xl font-bold uppercase mb-2">
                  {getDocumentTitle(document.type)}
                </h1>
                <p><span className="font-medium">Number:</span> {document.documentNumber}</p>
                <p><span className="font-medium">Date:</span> {formatDate(document.issueDate)}</p>
                {document.type === DocumentType.INVOICE && (
                  <p><span className="font-medium">Due Date:</span> {formatDate(document.dueDate)}</p>
                )}
                {document.type === DocumentType.ESTIMATE && (
                  <p><span className="font-medium">Valid Until:</span> {formatDate(document.dueDate)}</p>
                )}
                <p className="mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {document.status}
                </p>
              </div>
            </div>
            
            {/* Client Info */}
            <div className="mb-8">
              <h3 className="text-gray-500 font-medium mb-2">Bill To:</h3>
              <h3 className="text-lg font-bold">{document.clientName}</h3>
              {document.clientAddress && <p className="whitespace-pre-line">{document.clientAddress}</p>}
              {document.clientEmail && <p>{document.clientEmail}</p>}
            </div>
            
            {/* Line Items Table */}
            <div className="mb-8 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2 text-right">Quantity</th>
                    <th className="px-4 py-2 text-right">Unit Price</th>
                    <th className="px-4 py-2 text-right">Tax</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {document.lineItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="px-4 py-3">{item.description}</td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-right">{item.tax}%</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Summary */}
            <div className="flex justify-between mb-8">
              {/* Notes */}
              <div className="w-1/2 pr-8">
                {document.notes && (
                  <>
                    <h3 className="text-gray-500 font-medium mb-2">Notes:</h3>
                    <p className="whitespace-pre-line text-gray-700">{document.notes}</p>
                  </>
                )}
              </div>
              
              {/* Totals */}
              <div className="w-1/3">
                <div className="border rounded-md overflow-hidden">
                  <div className="px-4 py-2 bg-gray-50 border-b flex justify-between">
                    <span className="font-medium">Subtotal:</span>
                    <span>{formatCurrency(document.subtotal)}</span>
                  </div>
                  <div className="px-4 py-2 bg-gray-50 border-b flex justify-between">
                    <span className="font-medium">Tax:</span>
                    <span>{formatCurrency(document.taxTotal)}</span>
                  </div>
                  <div className="px-4 py-3 bg-gray-100 flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(document.grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex justify-end gap-2 print:hidden">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => window.print()}
              >
                <Printer size={16} />
                <span>Print</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <Download size={16} />
                <span>Download PDF</span>
              </Button>
              {document.type !== DocumentType.BILL && document.type !== DocumentType.BOOKKEEPING && (
                <Button 
                  className="flex items-center gap-2"
                >
                  <Mail size={16} />
                  <span>Email to Client</span>
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
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
                        <CardTitle>{invoice.documentNumber}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-base mt-2">
                      {invoice.clientName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Issue Date:</span>
                        <span>{formatDate(invoice.issueDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Due Date:</span>
                        <span>{formatDate(invoice.dueDate)}</span>
                      </div>
                      <div className="flex justify-between font-medium pt-2">
                        <span>Total:</span>
                        <span>${invoice.grandTotal.toFixed(2)}</span>
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
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        title="Send Email"
                      >
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
        
        {/* Estimates Tab */}
        <TabsContent value="estimates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getDocumentsByType(DocumentType.ESTIMATE).length > 0 ? (
              getDocumentsByType(DocumentType.ESTIMATE).map((estimate) => (
                <Card key={estimate.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <FileClock className="h-5 w-5 text-green-600" />
                        <CardTitle>{estimate.documentNumber}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(estimate.status)}>
                        {estimate.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-base mt-2">
                      {estimate.clientName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Issue Date:</span>
                        <span>{formatDate(estimate.issueDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Valid Until:</span>
                        <span>{formatDate(estimate.dueDate)}</span>
                      </div>
                      <div className="flex justify-between font-medium pt-2">
                        <span>Total:</span>
                        <span>${estimate.grandTotal.toFixed(2)}</span>
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
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        title="Send Email"
                      >
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
        
        {/* Bills Tab */}
        <TabsContent value="bills">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getDocumentsByType(DocumentType.BILL).length > 0 ? (
              getDocumentsByType(DocumentType.BILL).map((bill) => (
                <Card key={bill.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-purple-600" />
                        <CardTitle>{bill.documentNumber}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(bill.status)}>
                        {bill.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-base mt-2">
                      {bill.clientName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Issue Date:</span>
                        <span>{formatDate(bill.issueDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Payment Date:</span>
                        <span>{formatDate(bill.dueDate)}</span>
                      </div>
                      <div className="flex justify-between font-medium pt-2">
                        <span>Total:</span>
                        <span>${bill.grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t flex justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handlePreviewDocument(bill)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Button>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
                <FileCheck className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Bills Found</h3>
                <p className="text-gray-500 mb-4 text-center max-w-md">
                  You haven't created any bills yet. Create your first bill to get started.
                </p>
                <Button 
                  onClick={() => handleCreateNew(DocumentType.BILL)}
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>New Bill</span>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Bookkeeping Tab */}
        <TabsContent value="bookkeeping">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getDocumentsByType(DocumentType.BOOKKEEPING).length > 0 ? (
              getDocumentsByType(DocumentType.BOOKKEEPING).map((record) => (
                <Card key={record.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Book className="h-5 w-5 text-orange-600" />
                        <CardTitle>{record.documentNumber}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-base mt-2">
                      {record.clientName || "Internal Record"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Record Date:</span>
                        <span>{formatDate(record.issueDate)}</span>
                      </div>
                      <div className="flex justify-between font-medium pt-2">
                        <span>Total:</span>
                        <span>${record.grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t flex justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handlePreviewDocument(record)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
                <Book className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Bookkeeping Records Found</h3>
                <p className="text-gray-500 mb-4 text-center max-w-md">
                  You haven't created any bookkeeping records yet. Create your first record to get started.
                </p>
                <Button 
                  onClick={() => handleCreateNew(DocumentType.BOOKKEEPING)}
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>New Record</span>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Document Preview */}
      {selectedDocument && (
        <DocumentPreview
          document={selectedDocument}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}

      {/* Form panel placeholder - would be implemented with separate component */}
      {formOpen && (
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                New {currentDocumentType.charAt(0).toUpperCase() + currentDocumentType.slice(1)}
              </DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p>Document creation form would go here...</p>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
                <Button onClick={() => setFormOpen(false)}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}