import React from 'react';
import { Link } from 'wouter';

const MinimalLanding: React.FC = () => {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">PayrollPro AI</h1>
      <p className="mb-8">AI-powered payroll management system</p>
      <Link href="/agents">
        <span className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer">
          Try AI Playground
        </span>
      </Link>
    </div>
  );
};

export default MinimalLanding;