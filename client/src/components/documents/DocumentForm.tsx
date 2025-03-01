import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export enum DocumentType {
  ESTIMATE = 'estimate',
  INVOICE = 'invoice',
  BILL = 'bill',
  BOOKKEEPING = 'bookkeeping'
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
}

interface DocumentFormProps {
  type: DocumentType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: any) => void;
}

export function DocumentForm({ type, open, onOpenChange, onSave }: DocumentFormProps) {
  const [documentNumber, setDocumentNumber] = useState(generateDocumentNumber(type));
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [issueDate, setIssueDate] = useState(getCurrentDate());
  const [dueDate, setDueDate] = useState(getDefaultDueDate());
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: '1',
      description: '',
      quantity: 1,
      unitPrice: 0,
      tax: 0,
      total: 0
    }
  ]);

  const handleAddLineItem = () => {
    const newId = String(lineItems.length + 1);
    setLineItems([
      ...lineItems,
      {
        id: newId,
        description: '',
        quantity: 1,
        unitPrice: 0,
        tax: 0,
        total: 0
      }
    ]);
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const handleLineItemChange = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        if (field === 'quantity' || field === 'unitPrice' || field === 'tax') {
          updated.total = calculateTotal(updated.quantity, updated.unitPrice, updated.tax);
        }
        
        return updated;
      }
      return item;
    }));
  };

  const calculateTotal = (quantity: number, unitPrice: number, tax: number): number => {
    const subtotal = quantity * unitPrice;
    const taxAmount = subtotal * (tax / 100);
    return subtotal + taxAmount;
  };

  const calculateSubtotal = (): number => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTaxTotal = (): number => {
    return lineItems.reduce((sum, item) => {
      const subtotal = item.quantity * item.unitPrice;
      return sum + (subtotal * (item.tax / 100));
    }, 0);
  };

  const calculateGrandTotal = (): number => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSave = () => {
    const documentData = {
      type,
      documentNumber,
      clientName,
      clientEmail,
      clientAddress,
      issueDate,
      dueDate,
      notes,
      lineItems,
      subtotal: calculateSubtotal(),
      taxTotal: calculateTaxTotal(),
      grandTotal: calculateGrandTotal()
    };
    
    if (onSave) {
      onSave(documentData);
    }
    
    onOpenChange(false);
  };

  const getFormTitle = () => {
    switch (type) {
      case DocumentType.INVOICE:
        return 'Create Invoice';
      case DocumentType.ESTIMATE:
        return 'Create Estimate';
      case DocumentType.BILL:
        return 'Create Bill';
      case DocumentType.BOOKKEEPING:
        return 'Create Bookkeeping Record';
      default:
        return 'Create Document';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getFormTitle()}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="documentNumber">Document Number</Label>
              <Input
                id="documentNumber"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="clientEmail">Client Email</Label>
              <Input
                id="clientEmail"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="clientAddress">Client Address</Label>
              <Textarea
                id="clientAddress"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="py-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Line Items</h3>
            <Button
              onClick={handleAddLineItem}
              variant="outline"
              size="sm"
            >
              + Add Line Item
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Description</th>
                  <th className="text-right p-2">Quantity</th>
                  <th className="text-right p-2">Unit Price</th>
                  <th className="text-right p-2">Tax (%)</th>
                  <th className="text-right p-2">Total</th>
                  <th className="text-center p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2">
                      <Input
                        value={item.description}
                        onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    </td>
                    <td className="p-2 w-24">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(item.id, 'quantity', Number(e.target.value))}
                        className="text-right"
                        min="1"
                      />
                    </td>
                    <td className="p-2 w-32">
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleLineItemChange(item.id, 'unitPrice', Number(e.target.value))}
                        className="text-right"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="p-2 w-24">
                      <Input
                        type="number"
                        value={item.tax}
                        onChange={(e) => handleLineItemChange(item.id, 'tax', Number(e.target.value))}
                        className="text-right"
                        min="0"
                        max="100"
                      />
                    </td>
                    <td className="p-2 text-right font-medium w-28">
                      ${item.total.toFixed(2)}
                    </td>
                    <td className="p-2 text-center w-20">
                      <Button
                        onClick={() => handleRemoveLineItem(item.id)}
                        variant="ghost"
                        size="sm"
                        disabled={lineItems.length === 1}
                      >
                        ✕
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end mt-4">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span className="font-medium">${calculateTaxTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="font-bold">Total:</span>
                <span className="font-bold">${calculateGrandTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="py-4">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter any additional notes or payment terms"
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function generateDocumentNumber(type: DocumentType): string {
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const prefix = type.substring(0, 3).toUpperCase();
  return `${prefix}-${random}`;
}

function getCurrentDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function getDefaultDueDate(): string {
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + 30); // Default due date is 30 days from now
  return dueDate.toISOString().split('T')[0];
}