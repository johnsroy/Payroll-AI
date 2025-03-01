import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdvancedDocumentForm } from '@/components/documents/AdvancedDocumentForm';
import { SimpleDocumentPreview } from '@/components/documents/SimpleDocumentPreview';

// Document types enum
enum DocumentType {
  INVOICE = 'invoice',
  ESTIMATE = 'estimate',
  BILL = 'bill',
  BOOKKEEPING = 'bookkeeping'
}

// Full document interface
interface Document {
  id: string;
  type: DocumentType;
  title: string;
  client: {
    name: string;
    email: string;
    address: string;
  };
  company: {
    name: string;
    email: string;
    address: string;
    logo?: string;
  };
  number: string;
  date: string;
  dueDate: string;
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    total: number;
  }>;
  notes: string;
  terms: string;
  subtotal: number;
  taxTotal: number;
  discount: number;
  grandTotal: number;
  status: string;
}

// Simple document interface for list view
interface SimpleDocument {
  id: string;
  type: DocumentType;
  title: string;
  client: string;
  amount: number;
  date: string;
  status: string;
}

export default function EnhancedDocumentManagementPage() {
  // State for documents
  const [documents, setDocuments] = useState<SimpleDocument[]>([]);
  const [activeTab, setActiveTab] = useState<DocumentType>(DocumentType.INVOICE);
  
  // State for document form
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  
  // State for document preview
  const [selectedDocument, setSelectedDocument] = useState<SimpleDocument | null>(null);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  
  // State for statistics
  const [documentStats, setDocumentStats] = useState({
    totalInvoices: 0,
    totalEstimates: 0,
    totalBills: 0,
    totalBookkeeping: 0,
    totalAmount: 0,
  });
  
  // Load sample documents
  useEffect(() => {
    const sampleDocuments: SimpleDocument[] = [
      {
        id: '1',
        type: DocumentType.INVOICE,
        title: 'Website Development',
        client: 'ABC Company',
        amount: 2500,
        date: '2025-02-15',
        status: 'Paid'
      },
      {
        id: '2',
        type: DocumentType.INVOICE,
        title: 'Logo Design',
        client: 'XYZ Corporation',
        amount: 750,
        date: '2025-02-20',
        status: 'Pending'
      },
      {
        id: '3',
        type: DocumentType.ESTIMATE,
        title: 'Mobile App Development',
        client: 'Tech Startup Inc.',
        amount: 7500,
        date: '2025-02-25',
        status: 'Sent'
      },
      {
        id: '4',
        type: DocumentType.BILL,
        title: 'Office Supplies',
        client: 'Staples',
        amount: 350,
        date: '2025-02-10',
        status: 'Paid'
      },
      {
        id: '5',
        type: DocumentType.BOOKKEEPING,
        title: 'Q1 Financial Report',
        client: 'Internal',
        amount: 0,
        date: '2025-03-01',
        status: 'Draft'
      }
    ];
    
    setDocuments(sampleDocuments);
    
    // Calculate statistics
    const stats = {
      totalInvoices: sampleDocuments.filter(doc => doc.type === DocumentType.INVOICE).length,
      totalEstimates: sampleDocuments.filter(doc => doc.type === DocumentType.ESTIMATE).length,
      totalBills: sampleDocuments.filter(doc => doc.type === DocumentType.BILL).length,
      totalBookkeeping: sampleDocuments.filter(doc => doc.type === DocumentType.BOOKKEEPING).length,
      totalAmount: sampleDocuments.reduce((sum, doc) => sum + doc.amount, 0)
    };
    
    setDocumentStats(stats);
  }, []);
  
  // Handle creating a new document
  const handleCreateDocument = (type: DocumentType) => {
    setActiveTab(type);
    setShowDocumentForm(true);
  };
  
  // Handle saving a new document
  const handleSaveDocument = (document: Document) => {
    const simpleDocument: SimpleDocument = {
      id: document.id || `doc-${Math.random().toString(36).substring(2, 9)}`,
      type: document.type,
      title: document.title,
      client: document.client.name,
      amount: document.grandTotal,
      date: document.date,
      status: document.status || 'Draft'
    };
    
    setDocuments(prev => [...prev, simpleDocument]);
    
    // Update statistics
    setDocumentStats(prev => ({
      ...prev,
      totalInvoices: document.type === DocumentType.INVOICE ? prev.totalInvoices + 1 : prev.totalInvoices,
      totalEstimates: document.type === DocumentType.ESTIMATE ? prev.totalEstimates + 1 : prev.totalEstimates,
      totalBills: document.type === DocumentType.BILL ? prev.totalBills + 1 : prev.totalBills,
      totalBookkeeping: document.type === DocumentType.BOOKKEEPING ? prev.totalBookkeeping + 1 : prev.totalBookkeeping,
      totalAmount: prev.totalAmount + document.grandTotal
    }));
  };
  
  // Handle viewing a document
  const handleViewDocument = (document: SimpleDocument) => {
    setSelectedDocument(document);
    setShowDocumentPreview(true);
  };
  
  // Get documents by type
  const getDocumentsByType = (type: DocumentType) => {
    return documents.filter(doc => doc.type === type);
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-gray-600 mt-1">
            Create, manage, and track all your financial documents
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={() => handleCreateDocument(DocumentType.INVOICE)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            New Invoice
          </Button>
          
          <Button
            variant="outline"
            className="border-green-200 text-green-700 hover:bg-green-50"
            onClick={() => handleCreateDocument(DocumentType.ESTIMATE)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Estimate
          </Button>
          
          <Button
            variant="outline"
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
            onClick={() => handleCreateDocument(DocumentType.BILL)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
            </svg>
            New Bill
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentStats.totalInvoices}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Estimates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentStats.totalEstimates}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentStats.totalBills}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${documentStats.totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue={DocumentType.INVOICE} value={activeTab} onValueChange={(value) => setActiveTab(value as DocumentType)}>
        <TabsList className="mb-6">
          <TabsTrigger value={DocumentType.INVOICE} className="px-6">Invoices</TabsTrigger>
          <TabsTrigger value={DocumentType.ESTIMATE} className="px-6">Estimates</TabsTrigger>
          <TabsTrigger value={DocumentType.BILL} className="px-6">Bills</TabsTrigger>
          <TabsTrigger value={DocumentType.BOOKKEEPING} className="px-6">Bookkeeping</TabsTrigger>
        </TabsList>
        
        {Object.values(DocumentType).map((type) => (
          <TabsContent key={type} value={type}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {type.charAt(0).toUpperCase() + type.slice(1)}s
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="py-3 px-4 text-left">Title</th>
                          <th className="py-3 px-4 text-left">Client</th>
                          <th className="py-3 px-4 text-left">Date</th>
                          <th className="py-3 px-4 text-left">Amount</th>
                          <th className="py-3 px-4 text-left">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getDocumentsByType(type).length > 0 ? (
                          getDocumentsByType(type).map((doc) => (
                            <tr key={doc.id} className="border-b">
                              <td className="py-3 px-4">
                                <div className="font-medium">{doc.title}</div>
                              </td>
                              <td className="py-3 px-4">{doc.client}</td>
                              <td className="py-3 px-4">{formatDate(doc.date)}</td>
                              <td className="py-3 px-4">${doc.amount.toFixed(2)}</td>
                              <td className="py-3 px-4">
                                <Badge className={getStatusColor(doc.status)}>
                                  {doc.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDocument(doc)}
                                >
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-gray-500">
                              No {type}s found. Click the "New {type.charAt(0).toUpperCase() + type.slice(1)}" button to create one.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Document Creation Form */}
      <AdvancedDocumentForm
        type={activeTab}
        open={showDocumentForm}
        onOpenChange={setShowDocumentForm}
        onSave={handleSaveDocument}
      />
      
      {/* Document Preview */}
      <SimpleDocumentPreview
        document={selectedDocument}
        open={showDocumentPreview}
        onOpenChange={setShowDocumentPreview}
      />
    </div>
  );
}