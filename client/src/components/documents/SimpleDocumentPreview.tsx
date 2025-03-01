import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DocumentType } from '@/components/documents/SimpleDocumentForm';

interface Document {
  id: string;
  type: DocumentType;
  title: string;
  client: {
    name: string;
    email: string;
    address: string;
  };
  date: string;
  dueDate: string;
  amount: number;
  notes: string;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{document.type.charAt(0).toUpperCase() + document.type.slice(1)} Preview</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-4 border rounded-md">
          <div className="border-b pb-4">
            <h2 className="text-2xl font-bold">{document.title || 'Untitled'}</h2>
            <p className="text-sm text-gray-500">Document ID: {document.id}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">From</h3>
              <p className="text-sm">Your Company</p>
              <p className="text-sm">123 Business St.</p>
              <p className="text-sm">contact@yourcompany.com</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">To</h3>
              <p className="text-sm">{document.client.name}</p>
              <p className="text-sm">{document.client.address}</p>
              <p className="text-sm">{document.client.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-b py-4">
            <div>
              <p className="text-sm font-medium">Date</p>
              <p>{document.date}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Due Date</p>
              <p>{document.dueDate}</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Total Amount</h3>
              <p className="text-xl font-bold">${document.amount.toFixed(2)}</p>
            </div>
          </div>
          
          {document.notes && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Notes</h3>
              <p className="text-sm">{document.notes}</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button>Download PDF</Button>
          <Button>Send to Email</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}