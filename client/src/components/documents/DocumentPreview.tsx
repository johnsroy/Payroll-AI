import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DocumentType } from './DocumentForm';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
}

interface DocumentData {
  type: DocumentType;
  documentNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  issueDate: string;
  dueDate: string;
  notes: string;
  lineItems: LineItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
}

interface DocumentPreviewProps {
  document: DocumentData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentPreview({ document, open, onOpenChange }: DocumentPreviewProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDocumentTitle = () => {
    switch (document.type) {
      case DocumentType.INVOICE:
        return 'Invoice';
      case DocumentType.ESTIMATE:
        return 'Estimate';
      case DocumentType.BILL:
        return 'Bill';
      case DocumentType.BOOKKEEPING:
        return 'Bookkeeping Record';
      default:
        return 'Document';
    }
  };
  
  const handleDownload = () => {
    // In a real implementation, this would generate a PDF file
    alert('Downloading document...');
  };
  
  const handleSendEmail = () => {
    // In a real implementation, this would send an email with the document
    alert(`Sending document to ${document.clientEmail}...`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Document Preview</DialogTitle>
        </DialogHeader>
        
        <div className="p-4 border rounded-md">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">{getDocumentTitle()}</h1>
              <p className="text-gray-500">#{document.documentNumber}</p>
            </div>
            <div className="text-right">
              <h2 className="font-bold text-xl">PayrollPro AI</h2>
              <p className="text-gray-500">123 Business Street</p>
              <p className="text-gray-500">Suite 101</p>
              <p className="text-gray-500">Business City, ST 12345</p>
              <p className="text-gray-500">info@payrollpro.ai</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Bill To:</h3>
              <p className="font-medium">{document.clientName}</p>
              <p className="text-gray-600">{document.clientEmail}</p>
              <p className="text-gray-600 whitespace-pre-line">{document.clientAddress}</p>
            </div>
            <div>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-gray-600">Document #:</p>
                <p className="font-medium">{document.documentNumber}</p>
                
                <p className="text-gray-600">Issue Date:</p>
                <p className="font-medium">{formatDate(document.issueDate)}</p>
                
                <p className="text-gray-600">Due Date:</p>
                <p className="font-medium">{formatDate(document.dueDate)}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 px-2">Description</th>
                  <th className="text-right py-2 px-2">Quantity</th>
                  <th className="text-right py-2 px-2">Unit Price</th>
                  <th className="text-right py-2 px-2">Tax (%)</th>
                  <th className="text-right py-2 px-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {document.lineItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="py-2 px-2">{item.description}</td>
                    <td className="py-2 px-2 text-right">{item.quantity}</td>
                    <td className="py-2 px-2 text-right">${item.unitPrice.toFixed(2)}</td>
                    <td className="py-2 px-2 text-right">{item.tax}%</td>
                    <td className="py-2 px-2 text-right font-medium">${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${document.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">${document.taxTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-gray-300 font-bold">
                <span>Total:</span>
                <span>${document.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {document.notes && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-700 mb-2">Notes:</h3>
              <p className="text-gray-600 whitespace-pre-line">{document.notes}</p>
            </div>
          )}
          
          <div className="text-center mt-12 pt-8 border-t border-gray-300">
            <p className="text-gray-500">Thank you for your business!</p>
          </div>
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            Download PDF
          </Button>
          {document.clientEmail && (
            <Button onClick={handleSendEmail}>
              Send Email
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}