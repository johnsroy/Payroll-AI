import React, { useState, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Document types enum (matching our existing enum)
enum DocumentType {
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
  total: number;
}

// Document interface
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

interface AdvancedDocumentFormProps {
  type: DocumentType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (document: Document) => void;
}

// Draggable line item component
const DraggableLineItem = ({ 
  item, 
  index, 
  moveItem, 
  updateItem, 
  removeItem 
}: { 
  item: LineItem; 
  index: number; 
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  updateItem: (index: number, field: string, value: any) => void;
  removeItem: (index: number) => void;
}) => {
  const ref = useRef<HTMLTableRowElement>(null);
  
  const [, drop] = useDrop({
    accept: 'line-item',
    hover(draggedItem: { index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = draggedItem.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Move the item
      moveItem(dragIndex, hoverIndex);
      
      // Update the dragged item's index
      draggedItem.index = hoverIndex;
    }
  });
  
  const [{ isDragging }, drag] = useDrag({
    type: 'line-item',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  // Apply the drag and drop refs
  drag(drop(ref));
  
  return (
    <tr 
      ref={ref} 
      className={`border-b ${isDragging ? 'opacity-50 bg-gray-100' : ''}`}
      style={{ cursor: 'move' }}
    >
      <td className="py-2 px-3">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mr-1">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          <input 
            type="text" 
            value={item.description} 
            onChange={(e) => updateItem(index, 'description', e.target.value)}
            className="w-full p-1 border border-gray-300 rounded"
            placeholder="Item description"
          />
        </div>
      </td>
      <td className="py-2 px-3">
        <input 
          type="number" 
          value={item.quantity} 
          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
          className="w-full p-1 border border-gray-300 rounded text-right"
          min="0"
          step="1"
        />
      </td>
      <td className="py-2 px-3">
        <input 
          type="number" 
          value={item.unitPrice} 
          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
          className="w-full p-1 border border-gray-300 rounded text-right"
          min="0"
          step="0.01"
        />
      </td>
      <td className="py-2 px-3">
        <div className="flex items-center">
          <input 
            type="number" 
            value={item.taxRate} 
            onChange={(e) => updateItem(index, 'taxRate', parseFloat(e.target.value) || 0)}
            className="w-full p-1 border border-gray-300 rounded text-right"
            min="0"
            max="100"
            step="0.1"
          />
          <span className="ml-1">%</span>
        </div>
      </td>
      <td className="py-2 px-3 text-right font-medium">
        ${(item.quantity * item.unitPrice * (1 + item.taxRate / 100)).toFixed(2)}
      </td>
      <td className="py-2 px-3 text-center">
        <button 
          onClick={() => removeItem(index)}
          className="text-red-500 hover:text-red-700 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </td>
    </tr>
  );
};

export function AdvancedDocumentForm({ type, open, onOpenChange, onSave }: AdvancedDocumentFormProps) {
  // Default document data based on type
  const getDefaultDocument = (): Document => ({
    id: '',
    type,
    number: `${type.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    client: {
      name: '',
      email: '',
      address: '',
    },
    company: {
      name: 'Your Company',
      email: 'contact@yourcompany.com',
      address: '123 Business St, Business City, ST 12345',
    },
    lineItems: [],
    notes: '',
    terms: '',
    subtotal: 0,
    taxTotal: 0,
    discount: 0,
    grandTotal: 0,
    status: 'Draft',
  });
  
  // Document state
  const [document, setDocument] = useState<Document>(getDefaultDocument());
  
  // Suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('details');
  
  // State for custom field modal
  const [showCustomFieldModal, setShowCustomFieldModal] = useState(false);
  const [customFieldName, setCustomFieldName] = useState('');
  const [customFieldValue, setCustomFieldValue] = useState('');
  
  // State for preview
  const [showPreview, setShowPreview] = useState(false);
  
  // Reset form when type changes
  React.useEffect(() => {
    setDocument(getDefaultDocument());
  }, [type]);
  
  // Calculate totals when line items change
  React.useEffect(() => {
    const subtotal = document.lineItems.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0);
      
    const taxTotal = document.lineItems.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0);
      
    setDocument(prev => ({
      ...prev,
      subtotal,
      taxTotal,
      grandTotal: subtotal + taxTotal - document.discount
    }));
  }, [document.lineItems, document.discount]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setDocument(prev => {
        // Create a properly typed nested update
        const newDoc = { ...prev };
        if (section === 'client') {
          newDoc.client = { 
            ...newDoc.client, 
            [field]: value 
          };
        } else if (section === 'company') {
          newDoc.company = { 
            ...newDoc.company, 
            [field]: value 
          };
        }
        return newDoc;
      });
    } else {
      setDocument(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Add a new line item
  const addLineItem = () => {
    const newItem: LineItem = {
      id: `item-${document.lineItems.length + 1}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
      total: 0
    };
    
    setDocument(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem]
    }));
    
    // Provide suggestions based on existing items
    if (document.lineItems.length > 0) {
      const descriptions = document.lineItems.map(item => item.description);
      setSuggestions(descriptions);
      setShowSuggestions(true);
      
      // Hide suggestions after 5 seconds
      setTimeout(() => setShowSuggestions(false), 5000);
    }
  };
  
  // Update a line item
  const updateLineItem = (index: number, field: string, value: any) => {
    const updatedItems = [...document.lineItems];
    updatedItems[index] = { 
      ...updatedItems[index], 
      [field]: value,
      total: field === 'quantity' || field === 'unitPrice' || field === 'taxRate' 
        ? updatedItems[index].quantity * updatedItems[index].unitPrice * (1 + updatedItems[index].taxRate / 100)
        : updatedItems[index].total
    };
    
    setDocument(prev => ({
      ...prev,
      lineItems: updatedItems
    }));
  };
  
  // Remove a line item
  const removeLineItem = (index: number) => {
    setDocument(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index)
    }));
  };
  
  // Move a line item (for drag and drop)
  const moveLineItem = (dragIndex: number, hoverIndex: number) => {
    const draggedItem = document.lineItems[dragIndex];
    const updatedItems = [...document.lineItems];
    
    updatedItems.splice(dragIndex, 1);
    updatedItems.splice(hoverIndex, 0, draggedItem);
    
    setDocument(prev => ({
      ...prev,
      lineItems: updatedItems
    }));
  };
  
  // Add a custom field
  const addCustomField = () => {
    if (customFieldName && customFieldValue) {
      setDocument(prev => ({
        ...prev,
        [customFieldName]: customFieldValue
      }));
      
      setShowCustomFieldModal(false);
      setCustomFieldName('');
      setCustomFieldValue('');
    }
  };
  
  // Handle save
  const handleSave = () => {
    onSave(document);
    onOpenChange(false);
  };
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <DndProvider backend={HTML5Backend}>
        <div className="bg-white rounded-lg shadow-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                Create {type.charAt(0).toUpperCase() + type.slice(1)}
              </h2>
              
              <div className="flex space-x-2">
                <button
                  type="button"
                  className={`px-4 py-2 ${activeTab === 'details' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'} rounded-md hover:bg-blue-50`}
                  onClick={() => setActiveTab('details')}
                >
                  Details
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 ${activeTab === 'items' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'} rounded-md hover:bg-blue-50`}
                  onClick={() => setActiveTab('items')}
                >
                  Line Items
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 ${activeTab === 'terms' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'} rounded-md hover:bg-blue-50`}
                  onClick={() => setActiveTab('terms')}
                >
                  Terms & Notes
                </button>
              </div>
            </div>
            
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Document Details</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={document.title}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {type.charAt(0).toUpperCase() + type.slice(1)} Number
                        </label>
                        <input
                          type="text"
                          name="number"
                          value={document.number}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            name="date"
                            value={document.date}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {type === DocumentType.INVOICE ? 'Due Date' : 
                              type === DocumentType.ESTIMATE ? 'Valid Until' : 'Due Date'}
                          </label>
                          <input
                            type="date"
                            name="dueDate"
                            value={document.dueDate}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Client Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Client Name
                        </label>
                        <input
                          type="text"
                          name="client.name"
                          value={document.client.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Client Email
                        </label>
                        <input
                          type="email"
                          name="client.email"
                          value={document.client.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Client Address
                        </label>
                        <textarea
                          name="client.address"
                          value={document.client.address}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Your Company Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="company.name"
                        value={document.company.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Email
                      </label>
                      <input
                        type="email"
                        name="company.email"
                        value={document.company.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Address
                      </label>
                      <textarea
                        name="company.address"
                        value={document.company.address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Line Items Tab */}
            {activeTab === 'items' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Line Items</h3>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Item
                  </button>
                </div>
                
                {showSuggestions && suggestions.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 relative">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-blue-600 mb-1 font-medium">Suggestions</p>
                        <p className="text-sm text-blue-600 mt-1">
                          Based on your previous documents, consider adding the following items:
                        </p>
                        <ul className="text-sm text-blue-600 mt-1 ml-4 list-disc">
                          {suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                      <button 
                        onClick={() => setShowSuggestions(false)}
                        className="ml-auto text-blue-500 hover:text-blue-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-3 py-2 text-left">Description</th>
                        <th className="px-3 py-2 text-left">Quantity</th>
                        <th className="px-3 py-2 text-left">Unit Price</th>
                        <th className="px-3 py-2 text-left">Tax Rate</th>
                        <th className="px-3 py-2 text-right">Total</th>
                        <th className="px-3 py-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {document.lineItems.length > 0 ? (
                        document.lineItems.map((item, index) => (
                          <DraggableLineItem
                            key={item.id}
                            item={item}
                            index={index}
                            moveItem={moveLineItem}
                            updateItem={updateLineItem}
                            removeItem={removeLineItem}
                          />
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-gray-500">
                            No items added yet. Click the "Add Item" button to add your first item.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-end">
                  <div className="w-72">
                    <div className="bg-gray-50 p-4 rounded border border-gray-200">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">${document.subtotal.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Tax:</span>
                        <span className="font-medium">${document.taxTotal.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">Discount:</span>
                        <div className="flex items-center">
                          <span className="mr-1">$</span>
                          <input
                            type="number"
                            name="discount"
                            value={document.discount}
                            onChange={(e) => setDocument(prev => ({
                              ...prev,
                              discount: parseFloat(e.target.value) || 0
                            }))}
                            className="w-20 p-1 border border-gray-300 rounded text-right"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold">${document.grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Terms & Notes Tab */}
            {activeTab === 'terms' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={document.notes}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={4}
                    placeholder="Add any notes for your client here..."
                  />
                </div>
                
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Terms and Conditions
                  </label>
                  <textarea
                    name="terms"
                    value={document.terms}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={4}
                    placeholder="Add your terms and conditions here..."
                  />
                </div>
                
                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-3">Additional Fields</h3>
                  <button
                    type="button"
                    onClick={() => setShowCustomFieldModal(true)}
                    className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Custom Field
                  </button>
                </div>
              </div>
            )}
            
            {/* Document Preview */}
            {showPreview && (
              <div className="mt-6 p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
                <div className="flex justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{document.company.name}</h2>
                    <p className="text-gray-500">{document.company.address}</p>
                    <p className="text-gray-500">{document.company.email}</p>
                  </div>
                  <div className="text-right">
                    <h1 className="text-2xl font-bold mb-3 uppercase">{document.type}</h1>
                    <div className="space-y-1">
                      <p><span className="font-medium">{document.type.charAt(0).toUpperCase() + document.type.slice(1)} Number:</span> {document.number}</p>
                      <p><span className="font-medium">Date:</span> {new Date(document.date).toLocaleDateString()}</p>
                      <p>
                        <span className="font-medium">
                          {type === DocumentType.INVOICE ? 'Due Date:' : 
                           type === DocumentType.ESTIMATE ? 'Valid Until:' : 
                           'Due Date:'}
                        </span> {new Date(document.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-gray-700 font-medium mb-2">Bill To:</h3>
                  <p className="font-medium">{document.client.name || '[Client Name]'}</p>
                  <p className="text-gray-600">{document.client.address || '[Client Address]'}</p>
                  <p className="text-gray-600">{document.client.email || '[Client Email]'}</p>
                </div>
                
                <table className="w-full mb-8">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="py-2 text-left">Description</th>
                      <th className="py-2 text-right">Quantity</th>
                      <th className="py-2 text-right">Unit Price</th>
                      <th className="py-2 text-right">Tax Rate</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {document.lineItems.length > 0 ? (
                      document.lineItems.map(item => (
                        <tr key={item.id} className="border-b border-gray-200">
                          <td className="py-3">{item.description || 'Item description'}</td>
                          <td className="py-3 text-right">{item.quantity}</td>
                          <td className="py-3 text-right">${item.unitPrice.toFixed(2)}</td>
                          <td className="py-3 text-right">{item.taxRate}%</td>
                          <td className="py-3 text-right">${(item.quantity * item.unitPrice * (1 + item.taxRate / 100)).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-gray-500">
                          No items added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                
                <div className="flex justify-end mb-8">
                  <div className="w-64">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>${document.subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Tax:</span>
                      <span>${document.taxTotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Discount:</span>
                      <span>${document.discount.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between py-2 border-t border-gray-200 font-bold">
                      <span>Total:</span>
                      <span>${document.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                {document.notes && (
                  <div className="mb-6">
                    <h3 className="text-gray-700 font-medium mb-2">Notes:</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{document.notes}</p>
                  </div>
                )}
                
                {document.terms && (
                  <div>
                    <h3 className="text-gray-700 font-medium mb-2">Terms and Conditions:</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{document.terms}</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t flex justify-between">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                >
                  {showPreview ? 'Hide Preview' : 'Preview'}
                </button>
                
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </DndProvider>
      
      {/* Custom Field Modal */}
      {showCustomFieldModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Add Custom Field</h3>
              
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
                    placeholder="e.g., Purchase Order Number"
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
                    placeholder="e.g., PO-12345"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCustomFieldModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                
                <button
                  type="button"
                  onClick={addCustomField}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={!customFieldName || !customFieldValue}
                >
                  Add Field
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}