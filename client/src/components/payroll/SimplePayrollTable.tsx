'use client'

import React, { useState } from 'react'

interface Employee {
  id: string
  name: string
  regularHours: number
  overtimeHours: number
  netPay: number
}

interface PayrollTableProps {
  onSave?: (data: Employee[]) => void
}

export function SimplePayrollTable({ onSave }: PayrollTableProps) {
  const [employees, setEmployees] = useState<Employee[]>([
    { id: '1', name: 'John Doe', regularHours: 40, overtimeHours: 5, netPay: 1125 },
    { id: '2', name: 'Jane Smith', regularHours: 38, overtimeHours: 0, netPay: 950 }
  ])

  function createEmptyEmployee(): Employee {
    return {
      id: crypto.randomUUID(),
      name: '',
      regularHours: 0,
      overtimeHours: 0,
      netPay: 0
    }
  }

  const addEmployee = () => {
    setEmployees([...employees, createEmptyEmployee()])
  }

  const removeEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id))
  }

  const updateEmployee = (id: string, field: keyof Employee, value: any) => {
    setEmployees(employees.map(emp => {
      if (emp.id === id) {
        const updated = { ...emp, [field]: value }
        
        // Recalculate net pay if hours change
        if (field === 'regularHours' || field === 'overtimeHours') {
          const regularPay = updated.regularHours * 25
          const overtimePay = updated.overtimeHours * 37.5
          updated.netPay = regularPay + overtimePay
        }
        
        return updated
      }
      return emp
    }))
  }

  const handleSave = () => {
    if (onSave) onSave(employees)
    alert('Payroll data saved!')
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Payroll Data Entry</h2>
      
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
              <th className="border p-2">Name</th>
              <th className="border p-2">Regular Hours</th>
              <th className="border p-2">Overtime Hours</th>
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
                    value={emp.name}
                    onChange={e => updateEmployee(emp.id, 'name', e.target.value)}
                  />
                </td>
                <td className="border p-2">
                  <input 
                    type="number"
                    className="w-full p-1 border rounded"
                    value={emp.regularHours}
                    onChange={e => updateEmployee(emp.id, 'regularHours', Number(e.target.value))}
                  />
                </td>
                <td className="border p-2">
                  <input 
                    type="number"
                    className="w-full p-1 border rounded"
                    value={emp.overtimeHours}
                    onChange={e => updateEmployee(emp.id, 'overtimeHours', Number(e.target.value))}
                  />
                </td>
                <td className="border p-2">
                  ${emp.netPay.toFixed(2)}
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
  )
}