import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Document types
export enum DocumentType {
  INVOICE = 'invoice',
  ESTIMATE = 'estimate',
  BILL = 'bill',
  BOOKKEEPING = 'bookkeeping'
}

// Line item interface
interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
}

// Document interface
export interface DocumentData {
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
  status: string;
}

interface EnhancedDocumentFormProps {
  type: DocumentType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: DocumentData) => void;
  initialData?: Partial<DocumentData>;
}

export function EnhancedDocumentForm({
  type,
  open,
  onOpenChange,
  onSave,
  initialData
}: EnhancedDocumentFormProps) {
  // State for the document data
  const [documentData, setDocumentData] = useState<DocumentData>({
    type,
    documentNumber: generateDocumentNumber(type),
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    lineItems: [createEmptyLineItem()],
    subtotal: 0,
    taxTotal: 0,
    grandTotal: 0,
    status: 'Draft'
  });

  // Update document type when it changes
  useEffect(() => {
    setDocumentData(prev => ({
      ...prev,
      type,
      documentNumber: generateDocumentNumber(type)
    }));
  }, [type]);

  // Initialize with initial data if provided
  useEffect(() => {
    if (initialData) {
      setDocumentData(prev => ({
        ...prev,
        ...initialData,
        type,
        lineItems: initialData.lineItems || [createEmptyLineItem()]
      }));
    }
  }, [initialData, type]);

  // Generate document number based on type
  function generateDocumentNumber(type: DocumentType): string {
    const prefix = type.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${randomNum}`;
  }

  // Create an empty line item
  function createEmptyLineItem(): LineItem {
    return {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      tax: 0,
      total: 0
    };
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDocumentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle line item changes
  const handleLineItemChange = (id: string, field: keyof LineItem, value: any) => {
    setDocumentData(prev => {
      const updatedLineItems = prev.lineItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate total
          if (field === 'quantity' || field === 'unitPrice' || field === 'tax') {
            updatedItem.total = 
              updatedItem.quantity * updatedItem.unitPrice * 
              (1 + updatedItem.tax / 100);
          }
          
          return updatedItem;
        }
        return item;
      });
      
      // Recalculate totals
      const subtotal = updatedLineItems.reduce((sum, item) => 
        sum + (item.quantity * item.unitPrice), 0);
      
      const taxTotal = updatedLineItems.reduce((sum, item) => 
        sum + (item.quantity * item.unitPrice * (item.tax / 100)), 0);
      
      const grandTotal = subtotal + taxTotal;
      
      return {
        ...prev,
        lineItems: updatedLineItems,
        subtotal,
        taxTotal,
        grandTotal
      };
    });
  };

  // Add a new line item
  const handleAddLineItem = () => {
    setDocumentData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, createEmptyLineItem()]
    }));
  };

  // Remove a line item
  const handleRemoveLineItem = (id: string) => {
    setDocumentData(prev => {
      if (prev.lineItems.length <= 1) {
        return prev; // Don't remove the last item
      }
      
      const updatedLineItems = prev.lineItems.filter(item => item.id !== id);
      
      // Recalculate totals
      const subtotal = updatedLineItems.reduce((sum, item) => 
        sum + (item.quantity * item.unitPrice), 0);
      
      const taxTotal = updatedLineItems.reduce((sum, item) => 
        sum + (item.quantity * item.unitPrice * (item.tax / 100)), 0);
      
      const grandTotal = subtotal + taxTotal;
      
      return {
        ...prev,
        lineItems: updatedLineItems,
        subtotal,
        taxTotal,
        grandTotal
      };
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(documentData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-auto">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold capitalize">
                  {documentData.type}
                </h2>
                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save {documentData.type}
                  </Button>
                </div>
              </div>
              
              {/* Document Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Your Company</h3>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <p className="font-medium">Your Company Name</p>
                    <p>123 Business Street</p>
                    <p>Business City, ST 12345</p>
                    <p>contact@yourcompany.com</p>
                    <p>(123) 456-7890</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {documentData.type === DocumentType.INVOICE ? 'Invoice' : 
                       documentData.type === DocumentType.ESTIMATE ? 'Estimate' : 
                       documentData.type === DocumentType.BILL ? 'Bill' : 'Record'} Number
                    </label>
                    <Input 
                      name="documentNumber"
                      value={documentData.documentNumber}
                      onChange={handleInputChange}
                      className="w-full"
                      readOnly
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Issue Date
                      </label>
                      <Input 
                        type="date"
                        name="issueDate"
                        value={documentData.issueDate}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {documentData.type === DocumentType.INVOICE ? 'Due Date' : 
                         documentData.type === DocumentType.ESTIMATE ? 'Valid Until' : 
                         documentData.type === DocumentType.BILL ? 'Payment Date' : 'Date'}
                      </label>
                      <Input 
                        type="date"
                        name="dueDate"
                        value={documentData.dueDate}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Client Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Name
                    </label>
                    <Input 
                      name="clientName"
                      value={documentData.clientName}
                      onChange={handleInputChange}
                      className="w-full"
                      placeholder="Enter client name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Email
                    </label>
                    <Input 
                      type="email"
                      name="clientEmail"
                      value={documentData.clientEmail}
                      onChange={handleInputChange}
                      className="w-full"
                      placeholder="Enter client email"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Address
                    </label>
                    <Textarea 
                      name="clientAddress"
                      value={documentData.clientAddress}
                      onChange={handleInputChange}
                      className="w-full"
                      placeholder="Enter client address"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              
              {/* Line Items */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Line Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse mb-2">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">Description</th>
                        <th className="border border-gray-200 px-4 py-2 text-right">Quantity</th>
                        <th className="border border-gray-200 px-4 py-2 text-right">Unit Price</th>
                        <th className="border border-gray-200 px-4 py-2 text-right">Tax (%)</th>
                        <th className="border border-gray-200 px-4 py-2 text-right">Total</th>
                        <th className="border border-gray-200 px-4 py-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documentData.lineItems.map((item) => (
                        <tr key={item.id} className="border-b border-gray-200">
                          <td className="border border-gray-200 px-4 py-2">
                            <Input 
                              value={item.description}
                              onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                              className="w-full"
                              placeholder="Item description"
                            />
                          </td>
                          <td className="border border-gray-200 px-4 py-2">
                            <Input 
                              type="number"
                              min="0"
                              step="1"
                              value={item.quantity}
                              onChange={(e) => handleLineItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-full text-right"
                            />
                          </td>
                          <td className="border border-gray-200 px-4 py-2">
                            <Input 
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => handleLineItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-full text-right"
                            />
                          </td>
                          <td className="border border-gray-200 px-4 py-2">
                            <Input 
                              type="number"
                              min="0"
                              step="0.1"
                              value={item.tax}
                              onChange={(e) => handleLineItemChange(item.id, 'tax', parseFloat(e.target.value) || 0)}
                              className="w-full text-right"
                            />
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-right">
                            ${item.total.toFixed(2)}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLineItem(item.id)}
                              className="text-red-600 hover:text-red-800"
                              disabled={documentData.lineItems.length <= 1}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-blue-600 hover:text-blue-800 mb-4"
                  >
                    + Add Line Item
                  </button>
                </div>
              </div>
              
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Notes</h3>
                  <Textarea 
                    name="notes"
                    value={documentData.notes}
                    onChange={handleInputChange}
                    className="w-full"
                    placeholder="Enter notes for the client (optional)"
                    rows={4}
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Summary</h3>
                  <div className="border border-gray-200 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${documentData.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${documentData.taxTotal.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold">
                      <span>Total:</span>
                      <span>${documentData.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}