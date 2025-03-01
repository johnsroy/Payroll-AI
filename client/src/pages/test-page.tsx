import React from 'react';
import { SimpleTestTable } from '../components/payroll/SimpleTestTable';

export default function TestPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Test Page</h1>
      <p className="text-gray-600 mb-8">
        This is a simple test page to validate component rendering.
      </p>
      <SimpleTestTable />
    </div>
  );
}