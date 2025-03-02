import React, { useState } from 'react';

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
  title: string;
  client: string;
  amount: number;
  date: string;
  status: string;
}

export default function SimpleDocumentsPage() {
  // State for documents
  const [documents, setDocuments] = useState<Document[]>([]);
  
  // State for the currently selected document type
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);
  
  // State for the form dialog
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
  });
  
  // Handle creating a new document type
  const handleCreateNew = (type: DocumentType) => {
    setSelectedType(type);
    setIsFormOpen(true);
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    });
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedType) {
      // Create a new document
      const newDoc: Document = {
        id: `${selectedType.substring(0, 3).toUpperCase()}-${documents.length + 1}`,
        type: selectedType,
        title: formData.title,
        client: formData.client,
        amount: formData.amount,
        date: formData.date,
        status: 'Draft'
      };
      
      // Add it to our list
      setDocuments([...documents, newDoc]);
      
      // Close the form and reset
      setIsFormOpen(false);
      setFormData({
        title: '',
        client: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
      });
    }
  };
  
  // Filter documents by type
  const getDocumentsByType = (type: DocumentType) => {
    return documents.filter(doc => doc.type === type);
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Simple Document Management</h1>
      <p className="text-gray-600 mb-6">Create and manage financial documents for your business.</p>
      
      {/* Document type cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-blue-600">Invoices</h2>
          <p className="text-gray-600 mb-4">Create and manage your invoices</p>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              {getDocumentsByType(DocumentType.INVOICE).length} invoices
            </span>
            <button 
              onClick={() => handleCreateNew(DocumentType.INVOICE)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create Invoice
            </button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-green-600">Estimates</h2>
          <p className="text-gray-600 mb-4">Create and manage your estimates</p>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              {getDocumentsByType(DocumentType.ESTIMATE).length} estimates
            </span>
            <button 
              onClick={() => handleCreateNew(DocumentType.ESTIMATE)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Create Estimate
            </button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-purple-600">Bills</h2>
          <p className="text-gray-600 mb-4">Create and manage your bills</p>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              {getDocumentsByType(DocumentType.BILL).length} bills
            </span>
            <button 
              onClick={() => handleCreateNew(DocumentType.BILL)}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Create Bill
            </button>
          </div>
        </div>
      </div>
      
      {/* Recent documents */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Recent Documents</h2>
        
        {documents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Client</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                  <th className="px-4 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => (
                  <tr key={doc.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-2">{doc.id}</td>
                    <td className="px-4 py-2 capitalize">{doc.type}</td>
                    <td className="px-4 py-2">{doc.title}</td>
                    <td className="px-4 py-2">{doc.client}</td>
                    <td className="px-4 py-2">{new Date(doc.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-right">${doc.amount.toFixed(2)}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${doc.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' : 
                          doc.status === 'Sent' ? 'bg-blue-100 text-blue-800' : 
                          doc.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'}`}
                      >
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No documents created yet. Create your first document using the buttons above.</p>
          </div>
        )}
      </div>
      
      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                Create {selectedType && selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client
                    </label>
                    <input
                      type="text"
                      name="client"
                      value={formData.client}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={() => setIsFormOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}