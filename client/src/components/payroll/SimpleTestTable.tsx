import React from 'react';

export function SimpleTestTable() {
  const data = [
    { id: 1, name: 'John Doe', hours: 40, rate: 25, total: 1000 },
    { id: 2, name: 'Jane Smith', hours: 35, rate: 30, total: 1050 },
    { id: 3, name: 'Bob Johnson', hours: 42, rate: 22, total: 924 },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Simple Payroll Test Table</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-right">Hours</th>
              <th className="px-4 py-2 text-right">Rate</th>
              <th className="px-4 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{row.id}</td>
                <td className="px-4 py-2">{row.name}</td>
                <td className="px-4 py-2 text-right">{row.hours}</td>
                <td className="px-4 py-2 text-right">${row.rate}</td>
                <td className="px-4 py-2 text-right">${row.total}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td colSpan={4} className="px-4 py-2 text-right font-semibold">Total:</td>
              <td className="px-4 py-2 text-right font-semibold">
                ${data.reduce((sum, row) => sum + row.total, 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}