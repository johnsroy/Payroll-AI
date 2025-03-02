import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedDocumentForm, DocumentData, DocumentType } from '@/components/documents/EnhancedDocumentForm';
import { FixedDocumentPreview } from '@/components/documents/FixedDocumentPreview';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, FileText, FileCheck, FileClock, Book, Plus, Download, Mail, File } from 'lucide-react';

export default function DocumentManagementPage() {
  // State for documents
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [currentDocumentType, setCurrentDocumentType] = useState<DocumentType>(DocumentType.INVOICE);
  const [selectedDocument, setSelectedDocument] = useState<DocumentData | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch documents (mock function)
  useEffect(() => {
    // In a real app, we'd fetch from API
    // For demo purposes, use local storage
    const savedDocs = localStorage.getItem('documents');
    if (savedDocs) {
      try {
        setDocuments(JSON.parse(savedDocs));
      } catch (e) {
        console.error('Failed to parse saved documents', e);
      }
    }
  }, []);

  // Save documents to local storage
  useEffect(() => {
    localStorage.setItem('documents', JSON.stringify(documents));
  }, [documents]);

  // Handle document creation
  const handleCreateNew = (type: DocumentType) => {
    setCurrentDocumentType(type);
    setFormOpen(true);
  };

  // Handle document saving
  const handleSaveDocument = (document: DocumentData) => {
    setDocuments(prev => [
      ...prev,
      { ...document, id: Date.now().toString() }
    ]);
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

  // Handle document preview
  const handlePreviewDocument = (document: DocumentData) => {
    setSelectedDocument(document);
    setPreviewOpen(true);
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
                <Card key={invoice.id || invoice.documentNumber} className="overflow-hidden">
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
                <Card key={estimate.id || estimate.documentNumber} className="overflow-hidden">
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
                <Card key={bill.id || bill.documentNumber} className="overflow-hidden">
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
                <Card key={record.id || record.documentNumber} className="overflow-hidden">
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
      
      {/* Create/Edit Form */}
      <EnhancedDocumentForm
        type={currentDocumentType}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSaveDocument}
      />
      
      {/* Document Preview */}
      {selectedDocument && (
        <FixedDocumentPreview
          document={selectedDocument}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}
    </div>
  );
}