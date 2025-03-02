import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, FileText, FileCheck, FileClock, Book, Plus, Download, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Document types enum
enum DocumentType {
  INVOICE = 'invoice',
  ESTIMATE = 'estimate',
  BILL = 'bill',
  BOOKKEEPING = 'bookkeeping'
}

// Interface for our documents
interface Document {
  id: string;
  type: DocumentType;
  documentNumber: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: string;
  items?: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

export default function WaveDocumentManagementPage() {
  // State for documents
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      type: DocumentType.INVOICE,
      documentNumber: 'INV-1001',
      clientName: 'Acme Corp',
      clientEmail: 'billing@acmecorp.com',
      issueDate: '2025-02-15',
      dueDate: '2025-03-15',
      amount: 1250.00,
      status: 'Sent',
      items: [
        { id: '1-1', description: 'Web Development', quantity: 10, unitPrice: 125, total: 1250 }
      ]
    },
    {
      id: '2',
      type: DocumentType.ESTIMATE,
      documentNumber: 'EST-2001',
      clientName: 'Globex Inc',
      clientEmail: 'procurement@globex.com',
      issueDate: '2025-02-20',
      dueDate: '2025-04-20',
      amount: 3500.00,
      status: 'Draft',
      items: [
        { id: '2-1', description: 'UI/UX Design', quantity: 20, unitPrice: 175, total: 3500 }
      ]
    }
  ]);
  
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for the form dialog
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // State for the currently selected document type
  const [selectedType, setSelectedType] = useState<DocumentType>(DocumentType.INVOICE);
  
  // State for the preview dialog
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // State for the selected document
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    documentNumber: '',
    clientName: '',
    clientEmail: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: 0,
  });
  
  // Handle creating a new document
  const handleCreateNew = (type: DocumentType) => {
    setSelectedType(type);
    setFormData({
      documentNumber: generateDocumentNumber(type),
      clientName: '',
      clientEmail: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: 0,
    });
    setIsFormOpen(true);
  };
  
  // Generate a document number
  const generateDocumentNumber = (type: DocumentType): string => {
    const prefix = type.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${randomNum}`;
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    });
  };
  
  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newDocument: Document = {
      id: Date.now().toString(),
      type: selectedType,
      documentNumber: formData.documentNumber,
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      amount: formData.amount,
      status: 'Draft',
      items: [
        { 
          id: `${Date.now()}-1`, 
          description: 'Service or Product', 
          quantity: 1, 
          unitPrice: formData.amount, 
          total: formData.amount 
        }
      ]
    };
    
    setDocuments([...documents, newDocument]);
    setIsFormOpen(false);
  };
  
  // Filter documents by type
  const getDocumentsByType = (type: DocumentType) => {
    return documents.filter(doc => 
      doc.type === type && 
      (searchQuery === '' || 
       doc.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
       doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };
  
  // Handle previewing a document
  const handlePreviewDocument = (document: Document) => {
    setSelectedDocument(document);
    setIsPreviewOpen(true);
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get status badge color
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'draft': return 'bg-gray-200 text-gray-800';
      case 'sent': return 'bg-blue-200 text-blue-800';
      case 'paid': return 'bg-green-200 text-green-800';
      case 'overdue': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
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
        </TabsContent>
        
        {/* Bookkeeping Tab */}
        <TabsContent value="bookkeeping">
          <div className="col-span-full flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
            <Book className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Bookkeeping Records</h3>
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
        </TabsContent>
      </Tabs>
      
      {/* Document Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new {selectedType}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="documentNumber" className="text-right">
                  Number
                </Label>
                <Input
                  id="documentNumber"
                  name="documentNumber"
                  value={formData.documentNumber}
                  onChange={handleInputChange}
                  className="col-span-3"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="clientName" className="text-right">
                  Client
                </Label>
                <Input
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="clientEmail" className="text-right">
                  Email
                </Label>
                <Input
                  id="clientEmail"
                  name="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="issueDate" className="text-right">
                  Issue Date
                </Label>
                <Input
                  id="issueDate"
                  name="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dueDate" className="text-right">
                  {selectedType === DocumentType.INVOICE ? 'Due Date' : 'Valid Until'}
                </Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Create {selectedType}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Document Preview Dialog */}
      {selectedDocument && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>
                {selectedDocument.type.charAt(0).toUpperCase() + selectedDocument.type.slice(1)} {selectedDocument.documentNumber}
              </DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-xl font-bold mb-1">Your Company Name</h2>
                  <p className="text-gray-600">123 Business Street</p>
                  <p className="text-gray-600">Business City, ST 12345</p>
                  <p className="text-gray-600">contact@yourcompany.com</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-semibold mb-1">{selectedDocument.type.toUpperCase()}</h3>
                  <p><span className="font-medium">Number:</span> {selectedDocument.documentNumber}</p>
                  <p><span className="font-medium">Date:</span> {formatDate(selectedDocument.issueDate)}</p>
                  <p className="mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {selectedDocument.status}
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-gray-500 font-medium mb-2">Bill To:</h3>
                <p className="font-bold">{selectedDocument.clientName}</p>
                {selectedDocument.clientEmail && <p>{selectedDocument.clientEmail}</p>}
              </div>
              
              <div className="border rounded-md overflow-hidden mb-8">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-right">Quantity</th>
                      <th className="px-4 py-2 text-right">Unit Price</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDocument.items?.map(item => (
                      <tr key={item.id} className="border-b">
                        <td className="px-4 py-3">{item.description}</td>
                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">${item.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">${item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={2}></td>
                      <td className="px-4 py-3 text-right font-medium">Total:</td>
                      <td className="px-4 py-3 text-right font-bold">${selectedDocument.amount.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <Download size={16} />
                  <span>Download PDF</span>
                </Button>
                {(selectedDocument.type === DocumentType.INVOICE || selectedDocument.type === DocumentType.ESTIMATE) && (
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
      )}
    </div>
  );
}