import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DocumentType } from './EnhancedDocumentForm';
import { Download, Mail, Printer } from 'lucide-react';

interface DocumentData {
  id?: string;
  type: DocumentType;
  documentNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  issueDate: string;
  dueDate: string;
  notes: string;
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    tax: number;
    total: number;
  }>;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  status: string;
}

interface DocumentPreviewProps {
  document: DocumentData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FixedDocumentPreview({ document, open, onOpenChange }: DocumentPreviewProps) {
  if (!document) return null;

  // Format date for display
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

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
}