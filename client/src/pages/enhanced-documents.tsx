import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedDocumentForm, DocumentType, DocumentData } from '../components/documents/EnhancedDocumentForm';
import { Plus, FileText, Mail, Download, MoreHorizontal, Search } from 'lucide-react';

export default function EnhancedDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [activeTab, setActiveTab] = useState<DocumentType>(DocumentType.INVOICE);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentData | null>(null);
  const [isViewingDocument, setIsViewingDocument] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as DocumentType);
  };

  // Handle creating a new document
  const handleCreateNew = () => {
    setSelectedDocument(null);
    setIsFormOpen(true);
  };

  // Handle editing a document
  const handleEditDocument = (document: DocumentData) => {
    setSelectedDocument(document);
    setIsFormOpen(true);
  };

  // Handle viewing a document
  const handleViewDocument = (document: DocumentData) => {
    setSelectedDocument(document);
    setIsViewingDocument(true);
  };

  // Handle saving a document
  const handleSaveDocument = (document: DocumentData) => {
    if (selectedDocument) {
      // Edit existing document
      const updatedDocuments = documents.map(doc => 
        doc.id === document.id ? document : doc
      );
      setDocuments(updatedDocuments);
    } else {
      // Add new document
      setDocuments([...documents, document]);
    }
  };

  // Handle document status update
  const handleUpdateStatus = (documentId: string, newStatus: string) => {
    const updatedDocuments = documents.map(doc => 
      doc.id === documentId ? { ...doc, status: newStatus } : doc
    );
    setDocuments(updatedDocuments);
  };

  // Filter documents by active tab
  const filteredDocuments = documents
    .filter(doc => doc.type === activeTab)
    .filter(doc => 
      searchTerm === '' || 
      doc.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'approved':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-gray-500 mt-1">Create and manage your financial documents</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Create {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </button>
      </div>

      <Tabs defaultValue={DocumentType.INVOICE} onValueChange={handleTabChange}>
        <div className="flex justify-between items-center mb-6">
          <TabsList className="grid grid-cols-4 w-auto">
            <TabsTrigger value={DocumentType.INVOICE}>Invoices</TabsTrigger>
            <TabsTrigger value={DocumentType.ESTIMATE}>Estimates</TabsTrigger>
            <TabsTrigger value={DocumentType.BILL}>Bills</TabsTrigger>
            <TabsTrigger value={DocumentType.BOOKKEEPING}>Bookkeeping</TabsTrigger>
          </TabsList>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {Object.values(DocumentType).map((type) => (
          <TabsContent key={type} value={type}>
            {/* Document Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Total {type}s</p>
                <p className="text-2xl font-bold">{documents.filter(doc => doc.type === type).length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Draft</p>
                <p className="text-2xl font-bold">{documents.filter(doc => doc.type === type && doc.status === 'Draft').length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Sent</p>
                <p className="text-2xl font-bold">{documents.filter(doc => doc.type === type && doc.status === 'Sent').length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">
                  {type === DocumentType.INVOICE ? 'Paid' : 
                   type === DocumentType.ESTIMATE ? 'Approved' : 
                   type === DocumentType.BILL ? 'Paid' : 'Completed'}
                </p>
                <p className="text-2xl font-bold">
                  {type === DocumentType.INVOICE 
                    ? documents.filter(doc => doc.type === type && doc.status === 'Paid').length
                    : type === DocumentType.ESTIMATE
                      ? documents.filter(doc => doc.type === type && doc.status === 'Approved').length
                      : type === DocumentType.BILL
                        ? documents.filter(doc => doc.type === type && doc.status === 'Paid').length
                        : documents.filter(doc => doc.type === type && doc.status === 'Completed').length
                  }
                </p>
              </div>
            </div>

            {/* Document Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredDocuments.length > 0 ? (
                      filteredDocuments.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div>{doc.documentNumber}</div>
                            <div className="text-xs text-gray-500 mt-1">{doc.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {doc.client.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(doc.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(doc.dueDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                            ${doc.total.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => handleViewDocument(doc)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <FileText size={16} />
                              </button>
                              <button 
                                onClick={() => handleEditDocument(doc)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <div className="relative group">
                                <button className="text-gray-600 hover:text-gray-900">
                                  <MoreHorizontal size={16} />
                                </button>
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={(e) => {
                                    e.preventDefault();
                                    handleUpdateStatus(doc.id, doc.status === 'Draft' ? 'Sent' : 'Draft');
                                  }}>
                                    {doc.status === 'Draft' ? 'Mark as Sent' : 'Mark as Draft'}
                                  </a>
                                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={(e) => {
                                    e.preventDefault();
                                    handleUpdateStatus(doc.id, 'Paid');
                                  }}>
                                    Mark as Paid
                                  </a>
                                  <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                                    Delete
                                  </a>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-lg font-medium mb-1">No {type}s found</p>
                            <p className="text-sm max-w-md">
                              {searchTerm ? 
                                `No results found for "${searchTerm}". Try a different search term.` : 
                                `Get started by creating your first ${type}. Click the "Create ${type}" button above.`}
                            </p>
                            {searchTerm && (
                              <button
                                onClick={() => setSearchTerm('')}
                                className="mt-4 text-blue-600 hover:text-blue-800"
                              >
                                Clear search
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Document Form */}
      {isFormOpen && (
        <EnhancedDocumentForm
          type={activeTab}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveDocument}
          initialData={selectedDocument || undefined}
        />
      )}

      {/* View Document Modal */}
      {isViewingDocument && selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold">
                {selectedDocument.type.charAt(0).toUpperCase() + selectedDocument.type.slice(1)} Details
              </h2>
              <button
                onClick={() => setIsViewingDocument(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold">{selectedDocument.title}</h3>
                  <p className="text-gray-500">{selectedDocument.documentNumber}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedDocument.status)}`}>
                  {selectedDocument.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">From</h4>
                  <p className="font-medium">{selectedDocument.company.name}</p>
                  <p className="whitespace-pre-line text-sm text-gray-600">{selectedDocument.company.address}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedDocument.company.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">To</h4>
                  <p className="font-medium">{selectedDocument.client.name}</p>
                  <p className="whitespace-pre-line text-sm text-gray-600">{selectedDocument.client.address}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedDocument.client.email}</p>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Date</h4>
                  <p>{formatDate(selectedDocument.date)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    {selectedDocument.type === DocumentType.INVOICE ? 'Due Date' : 
                     selectedDocument.type === DocumentType.ESTIMATE ? 'Valid Until' : 'Payment Date'}
                  </h4>
                  <p>{formatDate(selectedDocument.dueDate)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Amount</h4>
                  <p className="text-xl font-bold">${selectedDocument.total.toFixed(2)}</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-3">Line Items</h4>
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <div className="grid grid-cols-12 bg-gray-50 p-3 gap-2 text-sm font-medium text-gray-700">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-1 text-right">Qty</div>
                    <div className="col-span-2 text-right">Price</div>
                    <div className="col-span-1 text-right">Tax</div>
                    <div className="col-span-2 text-right">Amount</div>
                  </div>

                  {selectedDocument.lineItems.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 p-3 gap-2 border-t border-gray-200">
                      <div className="col-span-6">{item.description}</div>
                      <div className="col-span-1 text-right">{item.quantity}</div>
                      <div className="col-span-2 text-right">${item.unitPrice.toFixed(2)}</div>
                      <div className="col-span-1 text-right">{item.taxRate}%</div>
                      <div className="col-span-2 text-right">${item.amount.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  {selectedDocument.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Notes</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-line">{selectedDocument.notes}</p>
                    </div>
                  )}
                </div>
                <div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Subtotal:</span>
                        <span>${selectedDocument.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tax:</span>
                        <span>${selectedDocument.taxTotal.toFixed(2)}</span>
                      </div>
                      {selectedDocument.discountTotal > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Discount:</span>
                          <span>-${selectedDocument.discountTotal.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-medium">
                        <span>Total:</span>
                        <span>${selectedDocument.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <div className="flex space-x-3">
                  <button className="flex items-center text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-md">
                    <Download size={16} className="mr-2" />
                    Download PDF
                  </button>
                  <button className="flex items-center text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-md">
                    <Mail size={16} className="mr-2" />
                    Email
                  </button>
                </div>
                <div className="flex space-x-3">
                  <button 
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    onClick={() => setIsViewingDocument(false)}
                  >
                    Close
                  </button>
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={() => {
                      setIsViewingDocument(false);
                      handleEditDocument(selectedDocument);
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}