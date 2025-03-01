'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight,
  Info
} from "lucide-react"
import { cn } from '@/lib/utils'

interface Employee {
  id: string
  name: string
  payPeriodStart: string
  payPeriodEnd: string
  regularHours: number
  overtimeHours: number
  deductions: number
  bonuses: number
  taxes: number
  netPay: number
  comments: string
  isNew?: boolean
}

interface PayrollDataEntryTableProps {
  initialData?: Employee[]
  onSave?: (data: Employee[]) => void
}

export function PayrollDataEntryTable({ initialData = [], onSave }: PayrollDataEntryTableProps) {
  // State for employees, editing, and validation
  const [employees, setEmployees] = useState<Employee[]>(initialData.length ? initialData : [createEmptyEmployee()])
  const [editingCell, setEditingCell] = useState<{rowIndex: number, columnName: string} | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [validationErrors, setValidationErrors] = useState<Record<string, Record<string, string>>>({})
  const [sortConfig, setSortConfig] = useState<{key: keyof Employee, direction: 'asc' | 'desc'}>({
    key: 'id',
    direction: 'asc'
  })
  
  const ROWS_PER_PAGE = 5

  // Calculate derived values for tax and net pay when inputs change
  useEffect(() => {
    const updatedEmployees = employees.map(employee => {
      // Simple tax calculation (just for demonstration)
      const grossPay = employee.regularHours * 25 + employee.overtimeHours * 37.5 + employee.bonuses
      const taxes = grossPay * 0.2 // 20% tax rate for demo
      const netPay = grossPay - taxes - employee.deductions
      
      return {
        ...employee,
        taxes: Number(taxes.toFixed(2)),
        netPay: Number(netPay.toFixed(2))
      }
    })
    
    setEmployees(updatedEmployees)
  }, [employees.map(e => [e.regularHours, e.overtimeHours, e.bonuses, e.deductions].join(','))])
  
  // Create a new empty employee record
  function createEmptyEmployee(): Employee {
    return {
      id: `EMP${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      name: '',
      payPeriodStart: '',
      payPeriodEnd: '',
      regularHours: 0,
      overtimeHours: 0,
      deductions: 0,
      bonuses: 0,
      taxes: 0,
      netPay: 0,
      comments: '',
      isNew: true
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
    
    // Type checking and validation
    if (['regularHours', 'overtimeHours', 'deductions', 'bonuses'].includes(columnName)) {
      const numValue = parseFloat(value)
      
      // Validate numeric inputs
      if (isNaN(numValue) || numValue < 0) {
        setValidationError(rowIndex, columnName, 'Must be a positive number')
        updatedEmployees[rowIndex] = {
          ...updatedEmployees[rowIndex],
          [columnName]: value // Keep as string temporarily for editing
        }
      } else {
        clearValidationError(rowIndex, columnName)
        updatedEmployees[rowIndex] = {
          ...updatedEmployees[rowIndex],
          [columnName]: numValue
        }
      }
    } else if (columnName === 'payPeriodStart' || columnName === 'payPeriodEnd') {
      // Date validation
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(value) && value !== '') {
        setValidationError(rowIndex, columnName, 'Use YYYY-MM-DD format')
      } else {
        clearValidationError(rowIndex, columnName)
      }
      updatedEmployees[rowIndex] = {
        ...updatedEmployees[rowIndex],
        [columnName]: value
      }
    } else {
      // For text fields
      updatedEmployees[rowIndex] = {
        ...updatedEmployees[rowIndex],
        [columnName]: value
      }
    }
    
    setEmployees(updatedEmployees)
  }
  
  // Finish editing a cell
  const finishEditing = () => {
    // Convert any string values back to numbers for numeric fields
    const updatedEmployees = employees.map(employee => {
      const updated = { ...employee }
      
      // Convert numeric fields
      ;['regularHours', 'overtimeHours', 'deductions', 'bonuses'].forEach(field => {
        if (typeof updated[field as keyof Employee] === 'string') {
          const numValue = parseFloat(updated[field as keyof Employee] as string)
          if (!isNaN(numValue)) {
            updated[field as keyof Employee] = numValue
          } else {
            updated[field as keyof Employee] = 0
          }
        }
      })
      
      return updated
    })
    
    setEmployees(updatedEmployees)
    setEditingCell(null)
  }
  
  // Set validation error
  const setValidationError = (rowIndex: number, columnName: string, message: string) => {
    setValidationErrors(prev => ({
      ...prev,
      [rowIndex]: {
        ...(prev[rowIndex] || {}),
        [columnName]: message
      }
    }))
  }
  
  // Clear validation error
  const clearValidationError = (rowIndex: number, columnName: string) => {
    if (validationErrors[rowIndex] && validationErrors[rowIndex][columnName]) {
      const newErrors = { ...validationErrors }
      delete newErrors[rowIndex][columnName]
      
      if (Object.keys(newErrors[rowIndex]).length === 0) {
        delete newErrors[rowIndex]
      }
      
      setValidationErrors(newErrors)
    }
  }
  
  // Check if a cell has validation errors
  const hasError = (rowIndex: number, columnName: string): boolean => {
    return !!(validationErrors[rowIndex] && validationErrors[rowIndex][columnName])
  }
  
  // Get error message for a cell
  const getErrorMessage = (rowIndex: number, columnName: string): string => {
    return validationErrors[rowIndex]?.[columnName] || ''
  }
  
  // Handle saving the data
  const handleSave = () => {
    // Check if there are any validation errors
    if (Object.keys(validationErrors).length > 0) {
      alert('Please fix validation errors before saving')
      return
    }
    
    // Convert any remaining string values to numbers
    const finalData = employees.map(employee => {
      const newEmployee = { ...employee }
      delete newEmployee.isNew
      return newEmployee
    })
    
    if (onSave) {
      onSave(finalData)
    }
    
    console.log('Saving payroll data:', finalData)
    // Here you would typically make an API call to save the data
  }
  
  // Sorting logic
  const handleSort = (key: keyof Employee) => {
    let direction: 'asc' | 'desc' = 'asc'
    
    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc'
    }
    
    setSortConfig({ key, direction })
  }
  
  // Filter employees based on search term
  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employees
    
    return employees.filter(employee => 
      employee.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [employees, searchTerm])
  
  // Sort employees
  const sortedEmployees = useMemo(() => {
    const sorted = [...filteredEmployees]
    
    sorted.sort((a, b) => {
      // Different sorting logic based on column type
      if (['regularHours', 'overtimeHours', 'deductions', 'bonuses', 'taxes', 'netPay'].includes(sortConfig.key)) {
        return sortConfig.direction === 'asc' 
          ? (a[sortConfig.key] as number) - (b[sortConfig.key] as number)
          : (b[sortConfig.key] as number) - (a[sortConfig.key] as number)
      }
      
      // String comparison for other columns
      const aValue = String(a[sortConfig.key] || '')
      const bValue = String(b[sortConfig.key] || '')
      
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    })
    
    return sorted
  }, [filteredEmployees, sortConfig])
  
  // Pagination
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE
    return sortedEmployees.slice(startIndex, startIndex + ROWS_PER_PAGE)
  }, [sortedEmployees, currentPage])
  
  const totalPages = Math.ceil(sortedEmployees.length / ROWS_PER_PAGE)
  
  // Calculate totals for numeric columns
  const totals = useMemo(() => {
    return employees.reduce((acc, employee) => {
      return {
        regularHours: acc.regularHours + (employee.regularHours || 0),
        overtimeHours: acc.overtimeHours + (employee.overtimeHours || 0),
        deductions: acc.deductions + (employee.deductions || 0),
        bonuses: acc.bonuses + (employee.bonuses || 0),
        taxes: acc.taxes + (employee.taxes || 0),
        netPay: acc.netPay + (employee.netPay || 0)
      }
    }, {
      regularHours: 0,
      overtimeHours: 0,
      deductions: 0,
      bonuses: 0,
      taxes: 0,
      netPay: 0
    })
  }, [employees])
  
  // Tooltip content for each column
  const tooltips = {
    id: "Employee ID (auto-generated)",
    name: "Employee's full name",
    payPeriodStart: "Start date of pay period (YYYY-MM-DD)",
    payPeriodEnd: "End date of pay period (YYYY-MM-DD)",
    regularHours: "Regular hours worked during pay period",
    overtimeHours: "Overtime hours worked during pay period",
    deductions: "Total deductions (health insurance, 401k, etc.)",
    bonuses: "Additional compensation (bonuses, commissions)",
    taxes: "Calculated tax withholdings (auto-calculated)",
    netPay: "Final pay amount after deductions and taxes (auto-calculated)",
    comments: "Additional notes or comments about this payroll entry"
  }
  
  return (
    <div className="w-full space-y-4 rounded-md border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-blue-700">Payroll Data Entry</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search employees..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={addNewEmployee} variant="outline" className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" />
            New Entry
          </Button>
          <Button onClick={handleSave} variant="default">Save Changes</Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <div className="max-h-[600px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-white">
              <TableRow>
                <TableHead 
                  className="w-24 cursor-pointer"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center">
                    ID
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer" 
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Employee Name
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Pay Period Start</TableHead>
                <TableHead>Pay Period End</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('regularHours')}
                >
                  <div className="flex items-center">
                    Regular Hours
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('overtimeHours')}
                >
                  <div className="flex items-center">
                    Overtime Hours
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('deductions')}
                >
                  <div className="flex items-center">
                    Deductions ($)
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('bonuses')}
                >
                  <div className="flex items-center">
                    Bonuses ($)
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('taxes')}
                >
                  <div className="flex items-center">
                    Taxes ($)
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('netPay')}
                >
                  <div className="flex items-center">
                    Net Pay ($)
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((employee, rowIndex) => {
                  const actualRowIndex = employees.findIndex(e => e.id === employee.id)
                  
                  return (
                    <TableRow 
                      key={employee.id} 
                      className={cn(
                        rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50",
                        employee.isNew ? "bg-blue-50" : ""
                      )}
                    >
                      {/* Employee ID */}
                      <TableCell 
                        className="relative"
                        onDoubleClick={() => startEditing(actualRowIndex, 'id')}
                      >
                        <div className="group flex items-center">
                          {editingCell?.rowIndex === actualRowIndex && editingCell.columnName === 'id' ? (
                            <Input
                              value={employee.id}
                              onChange={(e) => handleCellChange(actualRowIndex, 'id', e.target.value)}
                              onBlur={finishEditing}
                              onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                              autoFocus
                              className={hasError(actualRowIndex, 'id') ? "border-red-500" : ""}
                            />
                          ) : (
                            <>
                              <span>{employee.id}</span>
                              <Info 
                                className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-70 text-gray-400"
                                title={tooltips.id}
                              />
                            </>
                          )}
                          {hasError(actualRowIndex, 'id') && (
                            <span className="absolute -bottom-1 left-0 text-xs text-red-500">
                              {getErrorMessage(actualRowIndex, 'id')}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      
                      {/* Employee Name */}
                      <TableCell 
                        className="relative"
                        onDoubleClick={() => startEditing(actualRowIndex, 'name')}
                      >
                        <div className="group flex items-center">
                          {editingCell?.rowIndex === actualRowIndex && editingCell.columnName === 'name' ? (
                            <Input
                              value={employee.name}
                              onChange={(e) => handleCellChange(actualRowIndex, 'name', e.target.value)}
                              onBlur={finishEditing}
                              onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                              autoFocus
                              className={hasError(actualRowIndex, 'name') ? "border-red-500" : ""}
                            />
                          ) : (
                            <>
                              <span>{employee.name || <span className="text-gray-400 italic">Click to add name</span>}</span>
                              <Info 
                                className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-70 text-gray-400"
                                title={tooltips.name}
                              />
                            </>
                          )}
                          {hasError(actualRowIndex, 'name') && (
                            <span className="absolute -bottom-1 left-0 text-xs text-red-500">
                              {getErrorMessage(actualRowIndex, 'name')}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      
                      {/* Pay Period Start */}
                      <TableCell 
                        className="relative"
                        onDoubleClick={() => startEditing(actualRowIndex, 'payPeriodStart')}
                      >
                        <div className="group flex items-center">
                          {editingCell?.rowIndex === actualRowIndex && editingCell.columnName === 'payPeriodStart' ? (
                            <Input
                              value={employee.payPeriodStart}
                              placeholder="YYYY-MM-DD"
                              onChange={(e) => handleCellChange(actualRowIndex, 'payPeriodStart', e.target.value)}
                              onBlur={finishEditing}
                              onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                              autoFocus
                              className={hasError(actualRowIndex, 'payPeriodStart') ? "border-red-500" : ""}
                            />
                          ) : (
                            <>
                              <span>{employee.payPeriodStart || <span className="text-gray-400 italic">YYYY-MM-DD</span>}</span>
                              <Info 
                                className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-70 text-gray-400"
                                title={tooltips.payPeriodStart}
                              />
                            </>
                          )}
                          {hasError(actualRowIndex, 'payPeriodStart') && (
                            <span className="absolute -bottom-1 left-0 text-xs text-red-500">
                              {getErrorMessage(actualRowIndex, 'payPeriodStart')}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      
                      {/* Pay Period End */}
                      <TableCell 
                        className="relative"
                        onDoubleClick={() => startEditing(actualRowIndex, 'payPeriodEnd')}
                      >
                        <div className="group flex items-center">
                          {editingCell?.rowIndex === actualRowIndex && editingCell.columnName === 'payPeriodEnd' ? (
                            <Input
                              value={employee.payPeriodEnd}
                              placeholder="YYYY-MM-DD"
                              onChange={(e) => handleCellChange(actualRowIndex, 'payPeriodEnd', e.target.value)}
                              onBlur={finishEditing}
                              onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                              autoFocus
                              className={hasError(actualRowIndex, 'payPeriodEnd') ? "border-red-500" : ""}
                            />
                          ) : (
                            <>
                              <span>{employee.payPeriodEnd || <span className="text-gray-400 italic">YYYY-MM-DD</span>}</span>
                              <Info 
                                className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-70 text-gray-400"
                                title={tooltips.payPeriodEnd}
                              />
                            </>
                          )}
                          {hasError(actualRowIndex, 'payPeriodEnd') && (
                            <span className="absolute -bottom-1 left-0 text-xs text-red-500">
                              {getErrorMessage(actualRowIndex, 'payPeriodEnd')}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      
                      {/* Regular Hours */}
                      <TableCell 
                        className="relative"
                        onDoubleClick={() => startEditing(actualRowIndex, 'regularHours')}
                      >
                        <div className="group flex items-center">
                          {editingCell?.rowIndex === actualRowIndex && editingCell.columnName === 'regularHours' ? (
                            <Input
                              value={String(employee.regularHours)}
                              type="number"
                              min="0"
                              step="0.5"
                              onChange={(e) => handleCellChange(actualRowIndex, 'regularHours', e.target.value)}
                              onBlur={finishEditing}
                              onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                              autoFocus
                              className={hasError(actualRowIndex, 'regularHours') ? "border-red-500" : ""}
                            />
                          ) : (
                            <>
                              <span className="tabular-nums">{employee.regularHours}</span>
                              <Info 
                                className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-70 text-gray-400"
                                title={tooltips.regularHours}
                              />
                            </>
                          )}
                          {hasError(actualRowIndex, 'regularHours') && (
                            <span className="absolute -bottom-1 left-0 text-xs text-red-500">
                              {getErrorMessage(actualRowIndex, 'regularHours')}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      
                      {/* Overtime Hours */}
                      <TableCell 
                        className="relative"
                        onDoubleClick={() => startEditing(actualRowIndex, 'overtimeHours')}
                      >
                        <div className="group flex items-center">
                          {editingCell?.rowIndex === actualRowIndex && editingCell.columnName === 'overtimeHours' ? (
                            <Input
                              value={String(employee.overtimeHours)}
                              type="number"
                              min="0"
                              step="0.5"
                              onChange={(e) => handleCellChange(actualRowIndex, 'overtimeHours', e.target.value)}
                              onBlur={finishEditing}
                              onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                              autoFocus
                              className={hasError(actualRowIndex, 'overtimeHours') ? "border-red-500" : ""}
                            />
                          ) : (
                            <>
                              <span className="tabular-nums">{employee.overtimeHours}</span>
                              <Info 
                                className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-70 text-gray-400"
                                title={tooltips.overtimeHours}
                              />
                            </>
                          )}
                          {hasError(actualRowIndex, 'overtimeHours') && (
                            <span className="absolute -bottom-1 left-0 text-xs text-red-500">
                              {getErrorMessage(actualRowIndex, 'overtimeHours')}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      
                      {/* Deductions */}
                      <TableCell 
                        className="relative"
                        onDoubleClick={() => startEditing(actualRowIndex, 'deductions')}
                      >
                        <div className="group flex items-center">
                          {editingCell?.rowIndex === actualRowIndex && editingCell.columnName === 'deductions' ? (
                            <Input
                              value={String(employee.deductions)}
                              type="number"
                              min="0"
                              step="0.01"
                              onChange={(e) => handleCellChange(actualRowIndex, 'deductions', e.target.value)}
                              onBlur={finishEditing}
                              onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                              autoFocus
                              className={hasError(actualRowIndex, 'deductions') ? "border-red-500" : ""}
                            />
                          ) : (
                            <>
                              <span className="tabular-nums">${employee.deductions.toFixed(2)}</span>
                              <Info 
                                className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-70 text-gray-400"
                                title={tooltips.deductions}
                              />
                            </>
                          )}
                          {hasError(actualRowIndex, 'deductions') && (
                            <span className="absolute -bottom-1 left-0 text-xs text-red-500">
                              {getErrorMessage(actualRowIndex, 'deductions')}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      
                      {/* Bonuses */}
                      <TableCell 
                        className="relative"
                        onDoubleClick={() => startEditing(actualRowIndex, 'bonuses')}
                      >
                        <div className="group flex items-center">
                          {editingCell?.rowIndex === actualRowIndex && editingCell.columnName === 'bonuses' ? (
                            <Input
                              value={String(employee.bonuses)}
                              type="number"
                              min="0"
                              step="0.01"
                              onChange={(e) => handleCellChange(actualRowIndex, 'bonuses', e.target.value)}
                              onBlur={finishEditing}
                              onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                              autoFocus
                              className={hasError(actualRowIndex, 'bonuses') ? "border-red-500" : ""}
                            />
                          ) : (
                            <>
                              <span className="tabular-nums">${employee.bonuses.toFixed(2)}</span>
                              <Info 
                                className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-70 text-gray-400"
                                title={tooltips.bonuses}
                              />
                            </>
                          )}
                          {hasError(actualRowIndex, 'bonuses') && (
                            <span className="absolute -bottom-1 left-0 text-xs text-red-500">
                              {getErrorMessage(actualRowIndex, 'bonuses')}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      
                      {/* Taxes (auto-calculated) */}
                      <TableCell className="group">
                        <div className="flex items-center">
                          <span className="tabular-nums">${employee.taxes.toFixed(2)}</span>
                          <Badge variant="outline" className="ml-2 text-xs">Auto</Badge>
                          <Info 
                            className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-70 text-gray-400"
                            title={tooltips.taxes}
                          />
                        </div>
                      </TableCell>
                      
                      {/* Net Pay (auto-calculated) */}
                      <TableCell className="group">
                        <div className="flex items-center font-medium">
                          <span className="tabular-nums">${employee.netPay.toFixed(2)}</span>
                          <Badge variant="outline" className="ml-2 text-xs">Auto</Badge>
                          <Info 
                            className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-70 text-gray-400"
                            title={tooltips.netPay}
                          />
                        </div>
                      </TableCell>
                      
                      {/* Comments */}
                      <TableCell 
                        className="relative max-w-xs truncate"
                        onDoubleClick={() => startEditing(actualRowIndex, 'comments')}
                      >
                        <div className="group flex items-center">
                          {editingCell?.rowIndex === actualRowIndex && editingCell.columnName === 'comments' ? (
                            <Input
                              value={employee.comments}
                              onChange={(e) => handleCellChange(actualRowIndex, 'comments', e.target.value)}
                              onBlur={finishEditing}
                              onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                              autoFocus
                            />
                          ) : (
                            <>
                              <span>{employee.comments || <span className="text-gray-400 italic">Add comments</span>}</span>
                              <Info 
                                className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-70 text-gray-400"
                                title={tooltips.comments}
                              />
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="h-24 text-center">
                    No employees found. Add a new entry or clear your search.
                  </TableCell>
                </TableRow>
              )}
              
              {/* Totals row */}
              <TableRow className="bg-gray-100 font-semibold">
                <TableCell colSpan={4} className="text-right">Totals:</TableCell>
                <TableCell className="tabular-nums">{totals.regularHours.toFixed(1)}</TableCell>
                <TableCell className="tabular-nums">{totals.overtimeHours.toFixed(1)}</TableCell>
                <TableCell className="tabular-nums">${totals.deductions.toFixed(2)}</TableCell>
                <TableCell className="tabular-nums">${totals.bonuses.toFixed(2)}</TableCell>
                <TableCell className="tabular-nums">${totals.taxes.toFixed(2)}</TableCell>
                <TableCell className="tabular-nums">${totals.netPay.toFixed(2)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Helper message */}
      <div className="text-sm text-gray-500 mt-2 flex items-center">
        <Info className="h-4 w-4 mr-1" />
        <span>Double-click any cell to edit. Press Enter or click outside to save.</span>
      </div>
    </div>
  )
}