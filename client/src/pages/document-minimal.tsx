import React from 'react';

export default function MinimalDocumentManager() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Document Management</h1>
      
      <div className="flex space-x-4 mb-6">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
          Invoices
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">
          Estimates
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">
          Bills
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">
          Bookkeeping
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 border-b">
            <h3 className="text-lg font-bold">INV-1001</h3>
            <p className="text-gray-600">Acme Corporation</p>
          </div>
          <div className="p-4">
            <p className="mb-1"><span className="font-medium">Amount:</span> $2,150.00</p>
            <p className="mb-1"><span className="font-medium">Date:</span> Mar 1, 2025</p>
            <p className="mb-1"><span className="font-medium">Status:</span> <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded-full text-xs">Draft</span></p>
          </div>
          <div className="p-3 bg-gray-50 border-t">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View Details
            </button>
          </div>
        </div>
        
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 border-b">
            <h3 className="text-lg font-bold">INV-1002</h3>
            <p className="text-gray-600">TechStart LLC</p>
          </div>
          <div className="p-4">
            <p className="mb-1"><span className="font-medium">Amount:</span> $3,500.00</p>
            <p className="mb-1"><span className="font-medium">Date:</span> Mar 5, 2025</p>
            <p className="mb-1"><span className="font-medium">Status:</span> <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs">Paid</span></p>
          </div>
          <div className="p-3 bg-gray-50 border-t">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}