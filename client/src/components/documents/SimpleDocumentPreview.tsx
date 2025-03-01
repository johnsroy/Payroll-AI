import React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { DocumentType } from '../../pages/test-documents';

interface Document {
  id: string;
  type: DocumentType;
  title: string;
  client: string;
  amount: number;
  date: string;
  status: string;
}

interface DocumentPreviewProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SimpleDocumentPreview({ document, open, onOpenChange }: DocumentPreviewProps) {
  if (!document) {
    return null;
  }
  
  // Format date for display
  const formattedDate = new Date(document.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Get color based on document type
  const getTypeColor = () => {
    switch (document.type) {
      case DocumentType.INVOICE:
        return 'text-blue-600 border-blue-200';
      case DocumentType.ESTIMATE:
        return 'text-green-600 border-green-200';
      case DocumentType.BILL:
        return 'text-purple-600 border-purple-200';
      case DocumentType.BOOKKEEPING:
        return 'text-gray-600 border-gray-200';
      default:
        return 'text-gray-600 border-gray-200';
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize mb-2 ${getTypeColor()}`}>
                  {document.type}
                </span>
                <h2 className="text-2xl font-bold">{document.title}</h2>
                <p className="text-gray-500">#{document.id}</p>
              </div>
              <div className="text-right">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium 
                  ${document.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' : 
                    document.status === 'Sent' ? 'bg-blue-100 text-blue-800' : 
                    document.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                    'bg-gray-100 text-gray-800'}`}
                >
                  {document.status}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">From</h3>
                <p className="font-medium">Your Company Name</p>
                <p>123 Business Street</p>
                <p>Business City, ST 12345</p>
                <p>contact@yourcompany.com</p>
                <p>(123) 456-7890</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">To</h3>
                <p className="font-medium">{document.client}</p>
                <p>Client Address Line 1</p>
                <p>Client City, ST 12345</p>
                <p>client@example.com</p>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p>{formattedDate}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {document.type === DocumentType.INVOICE ? 'Due Date' : 
                     document.type === DocumentType.ESTIMATE ? 'Valid Until' : 
                     'Payment Date'}
                  </h3>
                  <p>{formattedDate}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                  <p className="font-bold text-xl">${document.amount.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-2 text-left">Description</th>
                      <th className="border border-gray-200 px-4 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2">
                        {document.title}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-right">
                        ${document.amount.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2 text-right font-medium">Total</td>
                      <td className="border border-gray-200 px-4 py-2 text-right font-bold">
                        ${document.amount.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-2">Notes</h3>
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <p>Thank you for your business! We appreciate the opportunity to work with you.</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6 flex flex-wrap justify-between">
              <button 
                className="mb-2 sm:mb-0 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => onOpenChange(false)}
              >
                Close
              </button>
              
              <div className="space-x-3">
                <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                  Download PDF
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {document.type === DocumentType.INVOICE ? 'Send Invoice' : 
                   document.type === DocumentType.ESTIMATE ? 'Send Estimate' : 
                   document.type === DocumentType.BILL ? 'Pay Bill' : 
                   'Print Document'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}