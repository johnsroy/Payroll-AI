import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentForm, DocumentType } from '../components/documents/DocumentForm';
import { DocumentPreview } from '../components/documents/DocumentPreview';

interface DocumentData {
  id: string;
  type: DocumentType;
  title: string;
  date: string;
  client: string;
  amount: number;
  status: string;
}

export default function DocumentManagementPage() {
  const [activeTab, setActiveTab] = useState<DocumentType>(DocumentType.INVOICE);
  const [documents, setDocuments] = useState<DocumentData[]>([
    {
      id: 'INV-001',
      type: DocumentType.INVOICE,
      title: 'Website Design Invoice',
      date: '2025-03-01',
      client: 'Acme Corporation',
      amount: 1500,
      status: 'Paid'
    },
    {
      id: 'INV-002',
      type: DocumentType.INVOICE,
      title: 'Monthly Maintenance',
      date: '2025-03-10',
      client: 'TechStart Inc.',
      amount: 750,
      status: 'Pending'
    },
    {
      id: 'EST-001',
      type: DocumentType.ESTIMATE,
      title: 'E-commerce Platform',
      date: '2025-02-15',
      client: 'Fashion Trends',
      amount: 4500,
      status: 'Sent'
    },
    {
      id: 'BILL-001',
      type: DocumentType.BILL,
      title: 'Office Supplies',
      date: '2025-02-28',
      client: 'Office Depot',
      amount: 350,
      status: 'Unpaid'
    },
    {
      id: 'BK-001',
      type: DocumentType.BOOKKEEPING,
      title: 'Q1 Expenses',
      date: '2025-03-05',
      client: 'Internal',
      amount: 12750,
      status: 'Recorded'
    }
  ]);
  
  const [formOpen, setFormOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  const filteredDocuments = documents.filter(doc => doc.type === activeTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value as DocumentType);
  };

  const handleCreateNew = () => {
    setFormOpen(true);
  };
  
  const handleSaveDocument = (documentData: any) => {
    // Generate an ID for the new document
    const prefix = documentData.type.substring(0, 3).toUpperCase();
    const nextNumber = documents.filter(d => d.type === documentData.type).length + 1;
    const id = `${prefix}-${String(nextNumber).padStart(3, '0')}`;
    
    // Create a new document entry
    const newDocument: DocumentData = {
      id,
      type: documentData.type,
      title: documentData.clientName ? `${documentData.clientName} - ${documentData.type}` : `New ${documentData.type}`,
      date: documentData.issueDate,
      client: documentData.clientName || 'Unnamed Client',
      amount: documentData.grandTotal,
      status: documentData.type === DocumentType.INVOICE ? 'Pending' : 
              documentData.type === DocumentType.ESTIMATE ? 'Draft' : 
              documentData.type === DocumentType.BILL ? 'Unpaid' : 'Recorded'
    };
    
    // Add the new document to the collection
    setDocuments([...documents, newDocument]);
    
    // Close the form
    setFormOpen(false);
  };
  
  const handlePreviewDocument = (document: DocumentData) => {
    // For now, we'll just create a mock document data structure for the preview
    // In a real implementation, you would fetch the full document data
    const previewData = {
      type: document.type,
      documentNumber: document.id,
      clientName: document.client,
      clientEmail: 'client@example.com',
      clientAddress: '123 Client Street\nClient City, ST 12345',
      issueDate: document.date,
      dueDate: new Date(new Date(document.date).setDate(new Date(document.date).getDate() + 30)).toISOString().split('T')[0],
      notes: 'Thank you for your business!',
      lineItems: [
        {
          id: '1',
          description: document.title,
          quantity: 1,
          unitPrice: document.amount,
          tax: 0,
          total: document.amount
        }
      ],
      subtotal: document.amount,
      taxTotal: 0,
      grandTotal: document.amount
    };
    
    setSelectedDocument(previewData);
    setPreviewOpen(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Document Management</h1>
        <button 
          onClick={handleCreateNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Create New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </button>
      </div>
      
      {/* Document Form */}
      <DocumentForm
        type={activeTab}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSaveDocument}
      />
      
      {/* Document Preview */}
      {selectedDocument && (
        <DocumentPreview
          document={selectedDocument}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}

      <Tabs defaultValue={DocumentType.INVOICE} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value={DocumentType.INVOICE}>Invoices</TabsTrigger>
          <TabsTrigger value={DocumentType.ESTIMATE}>Estimates</TabsTrigger>
          <TabsTrigger value={DocumentType.BILL}>Bills</TabsTrigger>
          <TabsTrigger value={DocumentType.BOOKKEEPING}>Bookkeeping</TabsTrigger>
        </TabsList>

        {Object.values(DocumentType).map((type) => (
          <TabsContent key={type} value={type}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{doc.title}</CardTitle>
                        <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">#{doc.id}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Client:</span>
                          <span className="font-medium">{doc.client}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span>{formatDate(doc.date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-bold">${doc.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-end mt-4">
                          <button 
                            className="text-blue-600 hover:text-blue-800 mr-3"
                            onClick={() => {/* Implement edit functionality */}}
                          >
                            Edit
                          </button>
                          <button 
                            className="text-blue-600 hover:text-blue-800 mr-3"
                            onClick={() => handlePreviewDocument(doc)}
                          >
                            Preview
                          </button>
                          <button 
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => alert(`Sending ${doc.type} ${doc.id} to ${doc.client}`)}
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium">No {type} documents found</h3>
                  <p className="text-gray-500 max-w-md mt-2">
                    Create your first {type} document by clicking the "Create New" button above.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'sent':
      return 'bg-blue-100 text-blue-800';
    case 'unpaid':
      return 'bg-red-100 text-red-800';
    case 'recorded':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}