import React from 'react';
import { EnhancedPayrollTable } from '../components/payroll/EnhancedPayrollTable';

export default function EnhancedPayrollPage() {
  const handleSavePayrollData = (data: any[]) => {
    console.log('Saving payroll data:', data);
    // Here we would call an API to save the data
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Payroll Data Entry</h1>
          <p className="text-gray-600">
            Enter employee time and pay information. The system will automatically calculate net pay based on hours worked and adjustments.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <EnhancedPayrollTable onSave={handleSavePayrollData} />
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">How to use this form</h3>
          <ul className="list-disc pl-5 space-y-1 text-blue-700">
            <li>Click "Add Employee" to add a new entry</li>
            <li>Click the edit icon to modify existing entries</li>
            <li>All fields with validation errors will be highlighted in red</li>
            <li>Net pay is automatically calculated based on hours, deductions, bonuses, and taxes</li>
            <li>Search for employees by ID or name using the search box</li>
            <li>Click "Save All" when finished to submit all changes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}