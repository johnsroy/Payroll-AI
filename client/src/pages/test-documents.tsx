import React from 'react';

export default function TestDocumentsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Document Management</h1>
      <p className="text-gray-600 mb-6">This is a test page for the document management functionality.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-blue-600">Invoices</h2>
          <p className="text-gray-600 mb-4">Create and manage your invoices</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Create Invoice
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-green-600">Estimates</h2>
          <p className="text-gray-600 mb-4">Create and manage your estimates</p>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Create Estimate
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-purple-600">Bills</h2>
          <p className="text-gray-600 mb-4">Create and manage your bills</p>
          <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
            Create Bill
          </button>
        </div>
      </div>
    </div>
  );
}