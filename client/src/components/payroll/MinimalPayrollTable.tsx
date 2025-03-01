import React, { useState } from 'react';

interface Employee {
  id: string;
  employee_id: string;
  name: string;
  pay_period_start: string;
  pay_period_end: string;
  regular_hours: number;
  overtime_hours: number;
  deductions: number;
  bonuses: number;
  taxes: number;
  net_pay: number;
}

export function MinimalPayrollTable() {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      employee_id: 'EMP001',
      name: 'John Doe',
      pay_period_start: '2025-02-01',
      pay_period_end: '2025-02-15',
      regular_hours: 80,
      overtime_hours: 5,
      deductions: 150,
      bonuses: 200,
      taxes: 320,
      net_pay: 2230
    },
    {
      id: '2',
      employee_id: 'EMP002',
      name: 'Jane Smith',
      pay_period_start: '2025-02-01',
      pay_period_end: '2025-02-15',
      regular_hours: 75,
      overtime_hours: 0,
      deductions: 120,
      bonuses: 0,
      taxes: 280,
      net_pay: 1850
    }
  ]);

  const addEmployee = () => {
    const newId = String(employees.length + 1);
    const newEmpId = `EMP${String(employees.length + 1).padStart(3, '0')}`;
    setEmployees([
      ...employees,
      {
        id: newId,
        employee_id: newEmpId,
        name: '',
        pay_period_start: '2025-02-01',
        pay_period_end: '2025-02-15',
        regular_hours: 0,
        overtime_hours: 0,
        deductions: 0,
        bonuses: 0,
        taxes: 0,
        net_pay: 0
      }
    ]);
  };

  const updateEmployee = (id: string, field: keyof Employee, value: any) => {
    setEmployees(employees.map(emp => {
      if (emp.id === id) {
        const updated = { ...emp, [field]: value };
        
        // Recalculate net pay if needed
        if (['regular_hours', 'overtime_hours', 'deductions', 'bonuses', 'taxes'].includes(field)) {
          const regularPay = updated.regular_hours * 25;
          const overtimePay = updated.overtime_hours * 37.5;
          updated.net_pay = regularPay + overtimePay + updated.bonuses - updated.deductions - updated.taxes;
        }
        
        return updated;
      }
      return emp;
    }));
  };

  const removeEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  const handleSave = () => {
    alert('Payroll data saved!');
  };

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={addEmployee}
        >
          Add Employee
        </button>
        
        <button 
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={handleSave}
        >
          Save Payroll Data
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Start Date</th>
              <th className="border p-2">End Date</th>
              <th className="border p-2">Regular Hours</th>
              <th className="border p-2">Overtime Hours</th>
              <th className="border p-2">Deductions</th>
              <th className="border p-2">Bonuses</th>
              <th className="border p-2">Taxes</th>
              <th className="border p-2">Net Pay</th>
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
                    value={emp.employee_id}
                    onChange={e => updateEmployee(emp.id, 'employee_id', e.target.value)}
                  />
                </td>
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
                    type="date"
                    className="w-full p-1 border rounded"
                    value={emp.pay_period_start}
                    onChange={e => updateEmployee(emp.id, 'pay_period_start', e.target.value)}
                  />
                </td>
                <td className="border p-2">
                  <input 
                    type="date"
                    className="w-full p-1 border rounded"
                    value={emp.pay_period_end}
                    onChange={e => updateEmployee(emp.id, 'pay_period_end', e.target.value)}
                  />
                </td>
                <td className="border p-2">
                  <input 
                    type="number"
                    className="w-full p-1 border rounded"
                    value={emp.regular_hours}
                    onChange={e => updateEmployee(emp.id, 'regular_hours', Number(e.target.value))}
                  />
                </td>
                <td className="border p-2">
                  <input 
                    type="number"
                    className="w-full p-1 border rounded"
                    value={emp.overtime_hours}
                    onChange={e => updateEmployee(emp.id, 'overtime_hours', Number(e.target.value))}
                  />
                </td>
                <td className="border p-2">
                  <input 
                    type="number"
                    className="w-full p-1 border rounded"
                    value={emp.deductions}
                    onChange={e => updateEmployee(emp.id, 'deductions', Number(e.target.value))}
                  />
                </td>
                <td className="border p-2">
                  <input 
                    type="number"
                    className="w-full p-1 border rounded"
                    value={emp.bonuses}
                    onChange={e => updateEmployee(emp.id, 'bonuses', Number(e.target.value))}
                  />
                </td>
                <td className="border p-2">
                  <input 
                    type="number"
                    className="w-full p-1 border rounded"
                    value={emp.taxes}
                    onChange={e => updateEmployee(emp.id, 'taxes', Number(e.target.value))}
                  />
                </td>
                <td className="border p-2">
                  ${emp.net_pay.toFixed(2)}
                </td>
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
    </div>
  );
}