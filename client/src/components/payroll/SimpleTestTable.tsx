import React, { useState } from 'react';

interface Employee {
  id: string;
  name: string;
  hours: number;
  rate: number;
  amount: number;
}

export function SimpleTestTable() {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'John Doe',
      hours: 40,
      rate: 25,
      amount: 1000
    },
    {
      id: '2',
      name: 'Jane Smith',
      hours: 35,
      rate: 30,
      amount: 1050
    }
  ]);

  const addEmployee = () => {
    const newId = String(employees.length + 1);
    setEmployees([
      ...employees,
      {
        id: newId,
        name: '',
        hours: 0,
        rate: 0,
        amount: 0
      }
    ]);
  };

  const updateEmployee = (id: string, field: keyof Employee, value: any) => {
    setEmployees(employees.map(emp => {
      if (emp.id === id) {
        const updated = { ...emp, [field]: value };
        
        // Recalculate amount if hours or rate changed
        if (field === 'hours' || field === 'rate') {
          updated.amount = updated.hours * updated.rate;
        }
        
        return updated;
      }
      return emp;
    }));
  };

  const removeEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  return (
    <div>
      <div className="mb-4">
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={addEmployee}
        >
          Add Employee
        </button>
      </div>
      
      <table className="min-w-full bg-white border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Hours</th>
            <th className="border p-2">Rate</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id}>
              <td className="border p-2">
                <input 
                  type="text"
                  className="w-full p-1 border rounded"
                  value={emp.name}
                  onChange={e => updateEmployee(emp.id, 'name', e.target.value)}
                />
              </td>
              <td className="border p-2">
                <input 
                  type="number"
                  className="w-full p-1 border rounded"
                  value={emp.hours}
                  onChange={e => updateEmployee(emp.id, 'hours', Number(e.target.value))}
                />
              </td>
              <td className="border p-2">
                <input 
                  type="number"
                  className="w-full p-1 border rounded"
                  value={emp.rate}
                  onChange={e => updateEmployee(emp.id, 'rate', Number(e.target.value))}
                />
              </td>
              <td className="border p-2">${emp.amount.toFixed(2)}</td>
              <td className="border p-2">
                <button 
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => removeEmployee(emp.id)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}