import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

// Document types enum
enum DocumentType {
  INVOICE = 'invoice',
  ESTIMATE = 'estimate',
  BILL = 'bill',
  BOOKKEEPING = 'bookkeeping'
}

// Interface for a line item
interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

// Interface for the document
interface Document {
  id: string;
  type: DocumentType;
  number: string;
  title: string;
  date: string;
  dueDate: string;
  client: {
    name: string;
    email: string;
    address: string;
  };
  company: {
    name: string;
    email: string;
    address: string;
    logo?: string;
  };
  lineItems: LineItem[];
  notes: string;
  terms: string;
  subtotal: number;
  taxTotal: number;
  discount: number;
  grandTotal: number;
  status: string;
}

// Props for the component
interface AdvancedDocumentFormProps {
  type: DocumentType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (document: Document) => void;
}

export function AdvancedDocumentForm({ type, open, onOpenChange, onSave }: AdvancedDocumentFormProps) {
  // State for the document
  const [document, setDocument] = useState<Document>({
    id: '',
    type: type,
    number: `${type.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    title: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    client: {
      name: '',
      email: '',
      address: ''
    },
    company: {
      name: 'Your Company',
      email: 'contact@yourcompany.com',
      address: '123 Business St, City, ST 12345'
    },
    lineItems: [
      {
        id: '1',
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 0,
        total: 0
      }
    ],
    notes: '',
    terms: 'Payment due within 30 days',
    subtotal: 0,
    taxTotal: 0,
    discount: 0,
    grandTotal: 0,
    status: 'Draft'
  });

  // State for active tab
  const [activeTab, setActiveTab] = useState('details');

  // Handle input changes for basic fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      
      if (parent === 'client') {
        setDocument(prev => ({
          ...prev,
          client: {
            ...prev.client,
            [child]: value
          }
        }));
      } else if (parent === 'company') {
        setDocument(prev => ({
          ...prev,
          company: {
            ...prev.company,
            [child]: value
          }
        }));
      }
    } else {
      setDocument(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle line item changes
  const handleLineItemChange = (index: number, field: string, value: any) => {
    const updatedLineItems = [...document.lineItems];
    updatedLineItems[index] = {
      ...updatedLineItems[index],
      [field]: value
    };
    
    // Recalculate total for the line
    if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate') {
      const quantity = field === 'quantity' ? value : updatedLineItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? value : updatedLineItems[index].unitPrice;
      const subtotal = quantity * unitPrice;
      const taxRate = field === 'taxRate' ? value : updatedLineItems[index].taxRate;
      const total = subtotal * (1 + taxRate / 100);
      
      updatedLineItems[index].total = total;
    }
    
    setDocument(prev => ({
      ...prev,
      lineItems: updatedLineItems
    }));
  };

  // Add a new line item
  const addLineItem = () => {
    setDocument(prev => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        {
          id: `item-${prev.lineItems.length + 1}`,
          description: '',
          quantity: 1,
          unitPrice: 0,
          taxRate: 0,
          total: 0
        }
      ]
    }));
  };

  // Remove a line item
  const removeLineItem = (index: number) => {
    if (document.lineItems.length <= 1) {
      return; // Don't remove the last item
    }
    
    setDocument(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index)
    }));
  };

  // Calculate totals
  React.useEffect(() => {
    const subtotal = document.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxTotal = document.lineItems.reduce((sum, item) => sum + ((item.quantity * item.unitPrice) * item.taxRate / 100), 0);
    const grandTotal = subtotal + taxTotal - document.discount;
    
    setDocument(prev => ({
      ...prev,
      subtotal,
      taxTotal,
      grandTotal
    }));
  }, [document.lineItems, document.discount]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate an ID if one doesn't exist
    const finalDocument = {
      ...document,
      id: document.id || `doc-${Math.random().toString(36).substring(2, 9)}`
    };
    
    onSave(finalDocument);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Create {type.charAt(0).toUpperCase() + type.slice(1)}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="items">Line Items</TabsTrigger>
              <TabsTrigger value="terms">Notes & Terms</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title/Description</Label>
                  <Input
                    id="title"
                    name="title"
                    value={document.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="number">Document Number</Label>
                  <Input
                    id="number"
                    name="number"
                    value={document.number}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={document.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={document.dueDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="border p-4 rounded-md mt-4">
                <h3 className="font-medium mb-3">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client.name">Client Name</Label>
                    <Input
                      id="client.name"
                      name="client.name"
                      value={document.client.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client.email">Client Email</Label>
                    <Input
                      id="client.email"
                      name="client.email"
                      type="email"
                      value={document.client.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="client.address">Client Address</Label>
                    <Textarea
                      id="client.address"
                      name="client.address"
                      value={document.client.address}
                      onChange={handleInputChange}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
              
              <div className="border p-4 rounded-md">
                <h3 className="font-medium mb-3">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company.name">Company Name</Label>
                    <Input
                      id="company.name"
                      name="company.name"
                      value={document.company.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company.email">Company Email</Label>
                    <Input
                      id="company.email"
                      name="company.email"
                      type="email"
                      value={document.company.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="company.address">Company Address</Label>
                    <Textarea
                      id="company.address"
                      name="company.address"
                      value={document.company.address}
                      onChange={handleInputChange}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="items">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="px-2 py-3 text-left">Description</th>
                      <th className="px-2 py-3 text-right w-24">Quantity</th>
                      <th className="px-2 py-3 text-right w-32">Unit Price</th>
                      <th className="px-2 py-3 text-right w-24">Tax (%)</th>
                      <th className="px-2 py-3 text-right w-32">Total</th>
                      <th className="px-2 py-3 w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {document.lineItems.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-2 py-2">
                          <Input
                            value={item.description}
                            onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                            placeholder="Enter description"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="text-right"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleLineItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="text-right"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={item.taxRate}
                            onChange={(e) => handleLineItemChange(index, 'taxRate', parseFloat(e.target.value) || 0)}
                            className="text-right"
                          />
                        </td>
                        <td className="px-2 py-2 text-right font-medium">
                          ${item.total.toFixed(2)}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(index)}
                            disabled={document.lineItems.length <= 1}
                          >
                            &times;
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={6} className="px-2 py-3">
                        <Button 
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addLineItem}
                        >
                          Add Line Item
                        </Button>
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td colSpan={4} className="px-2 py-2 text-right font-medium">
                        Subtotal:
                      </td>
                      <td className="px-2 py-2 text-right font-medium">
                        ${document.subtotal.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="px-2 py-2 text-right font-medium">
                        Tax:
                      </td>
                      <td className="px-2 py-2 text-right font-medium">
                        ${document.taxTotal.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="px-2 py-2 text-right font-medium">
                        Discount:
                      </td>
                      <td className="px-2 py-2 text-right">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={document.discount}
                          onChange={(e) => setDocument(prev => ({
                            ...prev,
                            discount: parseFloat(e.target.value) || 0
                          }))}
                          className="text-right w-32 inline-block"
                        />
                      </td>
                      <td></td>
                    </tr>
                    <tr className="border-t">
                      <td colSpan={4} className="px-2 py-2 text-right font-medium">
                        Total:
                      </td>
                      <td className="px-2 py-2 text-right font-bold">
                        ${document.grandTotal.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="terms" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={document.notes}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Additional notes to be displayed on the document"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="terms">Terms and Conditions</Label>
                <Textarea
                  id="terms"
                  name="terms"
                  value={document.terms}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Terms and conditions"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <div className="flex space-x-2">
                  {['Draft', 'Pending', 'Sent', 'Paid'].map(status => (
                    <Badge
                      key={status}
                      variant={document.status === status ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setDocument(prev => ({ ...prev, status }))}
                    >
                      {status}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save {type}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}