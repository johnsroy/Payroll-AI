import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SimpleDocumentForm, DocumentType } from '@/components/documents/SimpleDocumentForm';
import { SimpleDocumentPreview } from '@/components/documents/SimpleDocumentPreview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusIcon } from 'lucide-react';

export default function SimpleDocumentTestPage() {
  const [activeTab, setActiveTab] = useState<DocumentType>(DocumentType.INVOICE);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const handleCreateDocument = (type: DocumentType) => {
    setActiveTab(type);
    setIsFormOpen(true);
  };
  
  const handleSaveDocument = (document: any) => {
    // Add the new document to our list
    setDocuments(prev => [...prev, document]);
  };
  
  const handleViewDocument = (document: any) => {
    setSelectedDocument(document);
    setIsPreviewOpen(true);
  };
  
  // Filter documents by type
  const filteredDocuments = documents.filter(doc => doc.type === activeTab);
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Document Management</h1>
        <Button onClick={() => handleCreateDocument(activeTab)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </Button>
      </div>
      
      <Tabs 
        defaultValue={activeTab} 
        onValueChange={(value) => setActiveTab(value as DocumentType)} 
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value={DocumentType.INVOICE}>Invoices</TabsTrigger>
          <TabsTrigger value={DocumentType.ESTIMATE}>Estimates</TabsTrigger>
          <TabsTrigger value={DocumentType.BILL}>Bills</TabsTrigger>
          <TabsTrigger value={DocumentType.BOOKKEEPING}>Bookkeeping</TabsTrigger>
        </TabsList>
        
        {Object.values(DocumentType).map((type) => (
          <TabsContent key={type} value={type} className="space-y-4">
            {filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg">
                <p className="text-lg text-gray-500 mb-4">No {type} documents yet</p>
                <Button onClick={() => handleCreateDocument(type as DocumentType)}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Create {type}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-4">
                      <h3 className="font-medium text-lg truncate">{doc.title || 'Untitled'}</h3>
                      <p className="text-gray-500">{doc.client.name}</p>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-gray-500">{doc.date}</span>
                        <span className="font-medium">${doc.amount.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 border-t flex justify-end">
                      <Button 
                        variant="ghost" 
                        onClick={() => handleViewDocument(doc)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      <SimpleDocumentForm 
        type={activeTab} 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSave={handleSaveDocument}
      />
      
      <SimpleDocumentPreview 
        document={selectedDocument} 
        open={isPreviewOpen} 
        onOpenChange={setIsPreviewOpen}
      />
    </div>
  );
}