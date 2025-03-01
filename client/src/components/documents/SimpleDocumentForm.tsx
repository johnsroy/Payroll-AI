import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Document types enum
export enum DocumentType {
  INVOICE = 'invoice',
  ESTIMATE = 'estimate',
  BILL = 'bill',
  BOOKKEEPING = 'bookkeeping'
}

interface DocumentFormProps {
  type: DocumentType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (document: any) => void;
}

export function SimpleDocumentForm({ type, open, onOpenChange, onSave }: DocumentFormProps) {
  const [document, setDocument] = useState({
    id: `doc-${Math.random().toString(36).substring(2, 9)}`,
    type: type,
    title: '',
    client: {
      name: '',
      email: '',
      address: ''
    },
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: 0,
    notes: ''
  });

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
      }
    } else {
      setDocument(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(document);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create {type.charAt(0).toUpperCase() + type.slice(1)}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={document.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
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
                value={document.client.email}
                onChange={handleInputChange}
                type="email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client.address">Client Address</Label>
              <Input
                id="client.address"
                name="client.address"
                value={document.client.address}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                value={document.date}
                onChange={handleInputChange}
                type="date"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                name="dueDate"
                value={document.dueDate}
                onChange={handleInputChange}
                type="date"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                value={document.amount}
                onChange={handleInputChange}
                type="number"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={document.notes}
              onChange={handleInputChange}
              rows={4}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save {type}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}