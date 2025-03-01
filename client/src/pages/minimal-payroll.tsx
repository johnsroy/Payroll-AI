import React from 'react';
import { MinimalPayrollTable } from '../components/payroll/MinimalPayrollTable';

export default function MinimalPayrollPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Payroll Data Entry</h1>
      <p className="text-gray-600 mb-8">
        Enter employee time and pay information below. The system will automatically calculate net pay based on hours worked.
      </p>
      <MinimalPayrollTable />
    </div>
  );
}