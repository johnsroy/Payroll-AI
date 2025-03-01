'use client'

import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

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
    { id: "EMP0001", name: "John Doe", regularHours: 40, overtimeHours: 5, netPay: 1250 },
    { id: "EMP0002", name: "Jane Smith", regularHours: 35, overtimeHours: 0, netPay: 875 }
  ])
  
  const [editingCell, setEditingCell] = useState<{rowIndex: number, columnName: string} | null>(null)
  
  // Create a new empty employee record
  function createEmptyEmployee(): Employee {
    return {
      id: `EMP${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      name: '',
      regularHours: 0,
      overtimeHours: 0,
      netPay: 0
    }
  }
  
  // Add a new employee row
  const addNewEmployee = () => {
    setEmployees([...employees, createEmptyEmployee()])
  }
  
  // Start editing a cell
  const startEditing = (rowIndex: number, columnName: string) => {
    setEditingCell({ rowIndex, columnName })
  }
  
  // Handle cell value change
  const handleCellChange = (rowIndex: number, columnName: string, value: string) => {
    const updatedEmployees = [...employees]
    
    if (columnName === 'regularHours' || columnName === 'overtimeHours') {
      const numValue = parseFloat(value)
      updatedEmployees[rowIndex] = {
        ...updatedEmployees[rowIndex],
        [columnName]: isNaN(numValue) ? 0 : numValue
      }
    } else {
      updatedEmployees[rowIndex] = {
        ...updatedEmployees[rowIndex],
        [columnName]: value
      }
    }
    
    setEmployees(updatedEmployees)
  }
  
  // Finish editing a cell
  const finishEditing = () => {
    setEditingCell(null)
  }
  
  // Calculate net pay
  useEffect(() => {
    const updatedEmployees = employees.map(employee => {
      // Simple calculation formula - regular hours at $25/hr, overtime at $37.5/hr
      const netPay = (employee.regularHours * 25) + (employee.overtimeHours * 37.5)
      return {
        ...employee,
        netPay
      }
    })
    
    setEmployees(updatedEmployees)
  }, [employees.map(e => `${e.regularHours},${e.overtimeHours}`).join('|')])
  
  // Save data
  const handleSave = () => {
    if (onSave) {
      onSave(employees)
    }
    console.log('Saving payroll data:', employees)
  }
  
  return (
    <div className="w-full space-y-4 rounded-md border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Payroll Data Entry</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={addNewEmployee} variant="outline" className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" />
            New Entry
          </Button>
          <Button onClick={handleSave} variant="default">Save Changes</Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Employee Name</TableHead>
              <TableHead>Regular Hours</TableHead>
              <TableHead>Overtime Hours</TableHead>
              <TableHead>Net Pay ($)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee, rowIndex) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.id}</TableCell>
                <TableCell onDoubleClick={() => startEditing(rowIndex, 'name')}>
                  {editingCell?.rowIndex === rowIndex && editingCell.columnName === 'name' ? (
                    <Input
                      value={employee.name}
                      onChange={(e) => handleCellChange(rowIndex, 'name', e.target.value)}
                      onBlur={finishEditing}
                      onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                      autoFocus
                    />
                  ) : (
                    employee.name || <span className="text-gray-400 italic">Click to add name</span>
                  )}
                </TableCell>
                <TableCell onDoubleClick={() => startEditing(rowIndex, 'regularHours')}>
                  {editingCell?.rowIndex === rowIndex && editingCell.columnName === 'regularHours' ? (
                    <Input
                      value={String(employee.regularHours)}
                      type="number"
                      min="0"
                      step="0.5"
                      onChange={(e) => handleCellChange(rowIndex, 'regularHours', e.target.value)}
                      onBlur={finishEditing}
                      onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                      autoFocus
                    />
                  ) : (
                    employee.regularHours
                  )}
                </TableCell>
                <TableCell onDoubleClick={() => startEditing(rowIndex, 'overtimeHours')}>
                  {editingCell?.rowIndex === rowIndex && editingCell.columnName === 'overtimeHours' ? (
                    <Input
                      value={String(employee.overtimeHours)}
                      type="number"
                      min="0"
                      step="0.5"
                      onChange={(e) => handleCellChange(rowIndex, 'overtimeHours', e.target.value)}
                      onBlur={finishEditing}
                      onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                      autoFocus
                    />
                  ) : (
                    employee.overtimeHours
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  ${employee.netPay.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-gray-500 mt-2">
        Double-click any cell to edit. Press Enter or click outside to save.
      </div>
    </div>
  )
}