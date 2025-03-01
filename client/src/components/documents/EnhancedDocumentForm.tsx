import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Trash2, MoveVertical, FileText, Mail, Download } from 'lucide-react';

// Document types enum
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
  taxRate: number;
  amount: number;
}

// Document interface
export interface DocumentData {
  id: string;
  type: DocumentType;
  title: string;
  documentNumber: string;
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
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  status: string;
}

interface EnhancedDocumentFormProps {
  type: DocumentType;
  isOpen: boolean;
  onClose: () => void;
  onSave: (document: DocumentData) => void;
  initialData?: Partial<DocumentData>;
}

export function EnhancedDocumentForm({
  type,
  isOpen,
  onClose,
  onSave,
  initialData
}: EnhancedDocumentFormProps) {
  const [document, setDocument] = useState<Partial<DocumentData>>({
    type,
    title: '',
    documentNumber: generateDocumentNumber(type),
    date: new Date().toISOString().split('T')[0],
    dueDate: getDefaultDueDate(),
    client: {
      name: '',
      email: '',
      address: ''
    },
    company: {
      name: 'Your Company',
      email: 'company@example.com',
      address: '123 Business St\nCity, State 12345'
    },
    lineItems: [],
    notes: 'Thank you for your business!',
    subtotal: 0,
    taxTotal: 0,
    discountTotal: 0,
    total: 0,
    status: 'Draft',
    ...initialData
  });

  const [showCustomFieldModal, setShowCustomFieldModal] = useState(false);
  const [customFieldName, setCustomFieldName] = useState('');
  const [customFieldValue, setCustomFieldValue] = useState('');
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [showAgentSuggestion, setShowAgentSuggestion] = useState(false);
  const [agentSuggestion, setAgentSuggestion] = useState('');

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Ensure we have at least one line item
  useEffect(() => {
    if (!document.lineItems || document.lineItems.length === 0) {
      addLineItem();
    }
  }, []);

  // Calculate totals whenever line items change
  useEffect(() => {
    if (document.lineItems && document.lineItems.length > 0) {
      calculateTotals();
    }
  }, [document.lineItems]);

  // Show agent suggestions based on document content
  useEffect(() => {
    if (document.client?.name && document.lineItems && document.lineItems.length > 0) {
      // Only show suggestions occasionally to not overwhelm the user
      if (Math.random() > 0.7) {
        generateAgentSuggestion();
      }
    }
  }, [document.client?.name, document.lineItems]);

  const generateAgentSuggestion = () => {
    const suggestions = [
      "Based on this client's history, consider offering a 5% discount to encourage early payment.",
      "This client typically pays within 15 days. Consider shortening the payment terms.",
      "Similar businesses often include a service agreement with this type of document.",
      "The standard tax rate for these items is 8.5%. Would you like to apply this rate to all items?",
      "Would you like to add your standard terms and conditions to this document?"
    ];
    
    setAgentSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
    setShowAgentSuggestion(true);
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
      amount: 0
    };
    
    setDocument({
      ...document,
      lineItems: [...(document.lineItems || []), newItem]
    });
  };

  const removeLineItem = (index: number) => {
    if (document.lineItems) {
      const updatedItems = [...document.lineItems];
      updatedItems.splice(index, 1);
      setDocument({
        ...document,
        lineItems: updatedItems
      });
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    if (document.lineItems) {
      const updatedItems = [...document.lineItems];
      const item = { ...updatedItems[index] };
      
      // Update the specific field
      (item[field] as any) = value;
      
      // Recalculate the amount
      item.amount = item.quantity * item.unitPrice;
      
      updatedItems[index] = item;
      
      setDocument({
        ...document,
        lineItems: updatedItems
      });
    }
  };

  const calculateTotals = () => {
    if (document.lineItems) {
      const subtotal = document.lineItems.reduce((sum, item) => sum + item.amount, 0);
      const taxTotal = document.lineItems.reduce((sum, item) => sum + (item.amount * item.taxRate / 100), 0);
      const discountTotal = document.discountTotal || 0;
      const total = subtotal + taxTotal - discountTotal;
      
      setDocument({
        ...document,
        subtotal,
        taxTotal,
        total
      });
    }
  };

  const handleDragStart = (index: number) => {
    dragItem.current = index;
    setDraggedItemIndex(index);
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (document.lineItems && dragItem.current !== null && dragOverItem.current !== null) {
      const items = [...document.lineItems];
      const draggedItem = items[dragItem.current];
      
      // Remove the dragged item
      items.splice(dragItem.current, 1);
      
      // Insert at the new position
      items.splice(dragOverItem.current, 0, draggedItem);
      
      // Reset
      dragItem.current = null;
      dragOverItem.current = null;
      setDraggedItemIndex(null);
      
      // Update the state
      setDocument({
        ...document,
        lineItems: items
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested properties (client and company)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setDocument({
        ...document,
        [parent]: {
          ...(document[parent as keyof DocumentData] as any),
          [child]: value
        }
      });
    } else {
      setDocument({
        ...document,
        [name]: value
      });
    }
  };

  const addCustomField = () => {
    if (customFieldName && customFieldValue) {
      setCustomFields({
        ...customFields,
        [customFieldName]: customFieldValue
      });
      
      setCustomFieldName('');
      setCustomFieldValue('');
      setShowCustomFieldModal(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (document.type && document.client?.name && document.lineItems && document.lineItems.length > 0) {
      // Create a complete document with all required fields
      const completeDocument: DocumentData = {
        id: initialData?.id || `${document.type.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        type: document.type,
        title: document.title || `${document.type.charAt(0).toUpperCase() + document.type.slice(1)} for ${document.client?.name}`,
        documentNumber: document.documentNumber || generateDocumentNumber(document.type),
        date: document.date || new Date().toISOString().split('T')[0],
        dueDate: document.dueDate || getDefaultDueDate(),
        client: document.client as Required<DocumentData>['client'],
        company: document.company as Required<DocumentData>['company'],
        lineItems: document.lineItems,
        notes: document.notes || '',
        subtotal: document.subtotal || 0,
        taxTotal: document.taxTotal || 0,
        discountTotal: document.discountTotal || 0,
        total: document.total || 0,
        status: document.status || 'Draft'
      };
      
      onSave(completeDocument);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold">
            {initialData?.id ? 'Edit' : 'Create'} {type.charAt(0).toUpperCase() + type.slice(1)}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Company Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Your Company</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company.name"
                    value={document.company?.name || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="company.email"
                    value={document.company?.email || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    name="company.address"
                    value={document.company?.address || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
            
            {/* Client Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Client Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    name="client.name"
                    value={document.client?.name || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="client.email"
                    value={document.client?.email || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    name="client.address"
                    value={document.client?.address || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Document Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Number
              </label>
              <input
                type="text"
                name="documentNumber"
                value={document.documentNumber || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={document.date || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {type === DocumentType.INVOICE ? 'Due Date' : 
                 type === DocumentType.ESTIMATE ? 'Valid Until' : 'Payment Date'}
              </label>
              <input
                type="date"
                name="dueDate"
                value={document.dueDate || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          {/* Custom Fields */}
          {Object.keys(customFields).length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Custom Fields</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(customFields).map(([key, value]) => (
                  <div key={key} className="flex items-center">
                    <span className="text-sm font-medium mr-2">{key}:</span>
                    <span className="text-sm">{value}</span>
                    <button
                      type="button"
                      className="ml-2 text-red-500 hover:text-red-700"
                      onClick={() => {
                        const updatedFields = { ...customFields };
                        delete updatedFields[key];
                        setCustomFields(updatedFields);
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Line Items */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-500">Line Items</h3>
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                onClick={addLineItem}
              >
                <Plus size={16} className="mr-1" /> Add Item
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-md overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-12 bg-gray-50 p-3 gap-2 text-sm font-medium text-gray-700 border-b border-gray-200">
                <div className="col-span-1"></div>
                <div className="col-span-5">Description</div>
                <div className="col-span-1 text-right">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-1 text-right">Tax %</div>
                <div className="col-span-2 text-right">Amount</div>
              </div>
              
              {/* Line items */}
              {document.lineItems && document.lineItems.map((item, index) => (
                <div 
                  key={item.id}
                  className={`grid grid-cols-12 p-3 gap-2 border-b border-gray-200 items-center ${draggedItemIndex === index ? 'bg-blue-50' : 'bg-white'}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div className="col-span-1 flex items-center">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 mr-2 cursor-grab"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <MoveVertical size={16} />
                    </button>
                  </div>
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      placeholder="Item description"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      min="1"
                      step="1"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-right"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-right"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      value={item.taxRate}
                      onChange={(e) => updateLineItem(index, 'taxRate', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-right"
                    />
                  </div>
                  <div className="col-span-1 text-right font-medium">
                    ${item.amount.toFixed(2)}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => removeLineItem(index)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Notes and summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={document.notes || ''}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Add notes or terms and conditions..."
              />
              <div className="mt-3">
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                  onClick={() => setShowCustomFieldModal(true)}
                >
                  + Add Custom Field
                </button>
              </div>
            </div>
            
            <div>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span>${document.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tax:</span>
                    <span>${document.taxTotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  {document.discountTotal ? (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Discount:</span>
                      <span>-${document.discountTotal.toFixed(2)}</span>
                    </div>
                  ) : null}
                  <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-medium">
                    <span>Total:</span>
                    <span>${document.total?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Agent suggestion */}
          {showAgentSuggestion && (
            <div className="mb-6 bg-blue-50 border border-blue-100 rounded-md p-4 flex items-start">
              <div className="text-blue-500 mr-3 flex-shrink-0 pt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-grow">
                <p className="text-sm text-blue-800">{agentSuggestion}</p>
                <div className="mt-2 flex">
                  <button
                    type="button"
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600"
                    onClick={() => setShowAgentSuggestion(false)}
                  >
                    Apply Suggestion
                  </button>
                  <button
                    type="button"
                    className="text-xs text-gray-500 hover:text-gray-700"
                    onClick={() => setShowAgentSuggestion(false)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              <button
                type="button"
                className="flex items-center text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-md"
              >
                <FileText size={16} className="mr-2" />
                Preview
              </button>
              <button
                type="button"
                className="flex items-center text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-md"
              >
                <Download size={16} className="mr-2" />
                Download PDF
              </button>
              <button
                type="button"
                className="flex items-center text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-md"
              >
                <Mail size={16} className="mr-2" />
                Email
              </button>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save {type}
              </button>
            </div>
          </div>
        </form>
        
        {/* Custom field modal */}
        {showCustomFieldModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium">Add Custom Field</h3>
                <button
                  onClick={() => setShowCustomFieldModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Field Name
                    </label>
                    <input
                      type="text"
                      value={customFieldName}
                      onChange={(e) => setCustomFieldName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g., Project ID, PO Number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Field Value
                    </label>
                    <input
                      type="text"
                      value={customFieldValue}
                      onChange={(e) => setCustomFieldValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    onClick={() => setShowCustomFieldModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={addCustomField}
                  >
                    Add Field
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function generateDocumentNumber(type: DocumentType): string {
  const prefix = type.substring(0, 3).toUpperCase();
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${prefix}${year}${month}-${randomNum}`;
}

function getDefaultDueDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30); // Default to 30 days from now
  return date.toISOString().split('T')[0];
}