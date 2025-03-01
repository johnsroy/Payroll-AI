'use client'

import React, { useState, useEffect } from 'react'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, HelpCircle, AlertCircle, ArrowUpDown } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Employee {
  id: string
  employee_id: string
  employee_name: string
  pay_period_start: string
  pay_period_end: string
  regular_hours: number
  overtime_hours: number
  deductions: number
  bonuses: number
  taxes: number
  net_pay: number
  comments: string
  isEditing?: boolean
  validation?: Record<string, string>
}

interface PayrollTableProps {
  onSave?: (data: Employee[]) => void
}

export function EnhancedPayrollTable({ onSave }: PayrollTableProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Employee | null,
    direction: 'ascending' | 'descending'
  }>({ key: null, direction: 'ascending' })

  // Initialize with sample data
  useEffect(() => {
    const initialData: Employee[] = [
      {
        id: '1',
        employee_id: 'EMP001',
        employee_name: 'John Doe',
        pay_period_start: '2025-02-01',
        pay_period_end: '2025-02-15',
        regular_hours: 80,
        overtime_hours: 5,
        deductions: 150,
        bonuses: 200,
        taxes: 320,
        net_pay: 2230,
        comments: '',
        validation: {}
      },
      {
        id: '2',
        employee_id: 'EMP002',
        employee_name: 'Jane Smith',
        pay_period_start: '2025-02-01',
        pay_period_end: '2025-02-15',
        regular_hours: 75,
        overtime_hours: 0,
        deductions: 120,
        bonuses: 0,
        taxes: 280,
        net_pay: 1850,
        comments: '',
        validation: {}
      }
    ]
    setEmployees(initialData)
    setFilteredEmployees(initialData)
  }, [])

  // Create a new employee
  const createEmptyEmployee = (): Employee => {
    return {
      id: crypto.randomUUID(),
      employee_id: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
      employee_name: '',
      pay_period_start: formatDate(new Date()),
      pay_period_end: formatDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)), // 14 days later
      regular_hours: 0,
      overtime_hours: 0,
      deductions: 0,
      bonuses: 0,
      taxes: 0,
      net_pay: 0,
      comments: '',
      validation: {}
    }
  }

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Filter employees when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEmployees(employees)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = employees.filter(emp => 
        emp.employee_id.toLowerCase().includes(term) ||
        emp.employee_name.toLowerCase().includes(term)
      )
      setFilteredEmployees(filtered)
    }
  }, [searchTerm, employees])

  // Add a new employee
  const addEmployee = () => {
    const newEmployee = createEmptyEmployee()
    setEmployees([...employees, newEmployee])
  }

  // Remove an employee
  const removeEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id))
  }

  // Validate a field
  const validateField = (employee: Employee, field: keyof Employee, value: any): string => {
    switch (field) {
      case 'employee_name':
        return value.trim() === '' ? 'Name is required' : ''
      case 'employee_id':
        return value.trim() === '' ? 'Employee ID is required' : ''
      case 'pay_period_start':
        return value === '' ? 'Start date is required' : ''
      case 'pay_period_end':
        if (value === '') return 'End date is required'
        if (new Date(value) < new Date(employee.pay_period_start)) 
          return 'End date must be after start date'
        return ''
      case 'regular_hours':
        return value < 0 ? 'Hours cannot be negative' : ''
      case 'overtime_hours':
        return value < 0 ? 'Hours cannot be negative' : ''
      case 'deductions':
        return value < 0 ? 'Deductions cannot be negative' : ''
      case 'bonuses':
        return value < 0 ? 'Bonuses cannot be negative' : ''
      default:
        return ''
    }
  }

  // Update an employee field
  const updateEmployee = (id: string, field: keyof Employee, value: any) => {
    const updatedEmployees = employees.map(emp => {
      if (emp.id === id) {
        // Create updated employee
        const updated = { ...emp, [field]: value }
        
        // Validate the field
        const validationMessage = validateField(updated, field, value)
        const validation = { ...updated.validation, [field]: validationMessage }
        updated.validation = validation
        
        // Recalculate net pay
        if (['regular_hours', 'overtime_hours', 'deductions', 'bonuses', 'taxes'].includes(field as string)) {
          const regularPay = updated.regular_hours * 25  // Assuming $25/hr
          const overtimePay = updated.overtime_hours * 37.5  // Assuming $37.5/hr for overtime
          updated.net_pay = regularPay + overtimePay + updated.bonuses - updated.deductions - updated.taxes
        }
        
        return updated
      }
      return emp
    })
    
    setEmployees(updatedEmployees)
  }

  // Handle sorting - fixed version that handles null key
  const requestSort = (key: keyof Employee) => {
    let direction: 'ascending' | 'descending' = 'ascending'
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
    
    // Apply sorting
    const sortedData = [...filteredEmployees].sort((a, b) => {
      // Get the values to compare
      const valueA = a[key];
      const valueB = b[key];
      
      // Safe comparison with type checks
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return direction === 'ascending' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      } else if (typeof valueA === 'number' && typeof valueB === 'number') {
        return direction === 'ascending' 
          ? valueA - valueB 
          : valueB - valueA;
      } else {
        // Fall back to string comparison for other types
        const strA = String(valueA || '');
        const strB = String(valueB || '');
        return direction === 'ascending' 
          ? strA.localeCompare(strB) 
          : strB.localeCompare(strA);
      }
    });
    
    setFilteredEmployees(sortedData);
  }

  // Handle save
  const handleSave = () => {
    // Validate all employees
    let hasErrors = false
    const validatedEmployees = employees.map(emp => {
      const validation: Record<string, string> = {}
      const fieldsToValidate: (keyof Employee)[] = [
        'employee_id', 'employee_name', 'pay_period_start', 'pay_period_end',
        'regular_hours', 'overtime_hours', 'deductions', 'bonuses'
      ]
      
      fieldsToValidate.forEach(field => {
        const validationMessage = validateField(emp, field, emp[field])
        if (validationMessage) {
          hasErrors = true
          validation[field] = validationMessage
        }
      })
      
      return { ...emp, validation }
    })
    
    if (hasErrors) {
      setEmployees(validatedEmployees)
      setFilteredEmployees(validatedEmployees.filter(emp => {
        if (!searchTerm.trim()) return true
        const term = searchTerm.toLowerCase()
        return emp.employee_id.toLowerCase().includes(term) || 
               emp.employee_name.toLowerCase().includes(term)
      }))
      alert('Please fix validation errors before saving')
      return
    }
    
    // If valid, ask for confirmation
    setConfirmDialogOpen(true)
  }

  // Calculate total values for the summary row
  const calculateSummary = () => {
    return filteredEmployees.reduce((summary, emp) => {
      return {
        regular_hours: summary.regular_hours + emp.regular_hours,
        overtime_hours: summary.overtime_hours + emp.overtime_hours,
        deductions: summary.deductions + emp.deductions,
        bonuses: summary.bonuses + emp.bonuses,
        taxes: summary.taxes + emp.taxes,
        net_pay: summary.net_pay + emp.net_pay
      }
    }, {
      regular_hours: 0,
      overtime_hours: 0,
      deductions: 0,
      bonuses: 0,
      taxes: 0,
      net_pay: 0
    })
  }
  
  const summary = calculateSummary()

  // Confirm save
  const confirmSave = () => {
    if (onSave) onSave(employees)
    setConfirmDialogOpen(false)
    alert('Payroll data saved successfully!')
  }

  // Render the table header with sort buttons
  const renderTableHeader = (label: string, key: keyof Employee) => {
    return (
      <th className="border p-2 bg-gray-100">
        <div className="flex items-center justify-between">
          <span>{label}</span>
          <button 
            className="ml-1 text-gray-500 hover:text-gray-700"
            onClick={() => requestSort(key)}
          >
            <ArrowUpDown size={14} />
          </button>
        </div>
      </th>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by ID or name..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={addEmployee}
          >
            Add Employee
          </Button>
          
          <Button 
            variant="default"
            onClick={handleSave}
          >
            Save Payroll Data
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              {renderTableHeader('Employee ID', 'employee_id')}
              {renderTableHeader('Name', 'employee_name')}
              {renderTableHeader('Pay Period Start', 'pay_period_start')}
              {renderTableHeader('Pay Period End', 'pay_period_end')}
              {renderTableHeader('Regular Hours', 'regular_hours')}
              {renderTableHeader('Overtime Hours', 'overtime_hours')}
              {renderTableHeader('Deductions', 'deductions')}
              {renderTableHeader('Bonuses', 'bonuses')}
              {renderTableHeader('Taxes', 'taxes')}
              {renderTableHeader('Net Pay', 'net_pay')}
              <th className="border p-2 bg-gray-100">Comments</th>
              <th className="border p-2 bg-gray-100">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(emp => (
              <tr key={emp.id} className="hover:bg-gray-50">
                <td className="border p-2 relative">
                  <Input 
                    type="text"
                    className={`w-full p-1 ${emp.validation?.employee_id ? 'border-red-500' : ''}`}
                    value={emp.employee_id}
                    onChange={e => updateEmployee(emp.id, 'employee_id', e.target.value)}
                  />
                  {emp.validation?.employee_id && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className="h-4 w-4 text-red-500 absolute right-2 top-2.5" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{emp.validation.employee_id}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </td>
                <td className="border p-2 relative">
                  <Input 
                    type="text"
                    className={`w-full p-1 ${emp.validation?.employee_name ? 'border-red-500' : ''}`}
                    value={emp.employee_name}
                    onChange={e => updateEmployee(emp.id, 'employee_name', e.target.value)}
                  />
                  {emp.validation?.employee_name && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className="h-4 w-4 text-red-500 absolute right-2 top-2.5" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{emp.validation.employee_name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </td>
                <td className="border p-2 relative">
                  <Input 
                    type="date"
                    className={`w-full p-1 ${emp.validation?.pay_period_start ? 'border-red-500' : ''}`}
                    value={emp.pay_period_start}
                    onChange={e => updateEmployee(emp.id, 'pay_period_start', e.target.value)}
                  />
                  {emp.validation?.pay_period_start && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className="h-4 w-4 text-red-500 absolute right-2 top-2.5" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{emp.validation.pay_period_start}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </td>
                <td className="border p-2 relative">
                  <Input 
                    type="date"
                    className={`w-full p-1 ${emp.validation?.pay_period_end ? 'border-red-500' : ''}`}
                    value={emp.pay_period_end}
                    onChange={e => updateEmployee(emp.id, 'pay_period_end', e.target.value)}
                  />
                  {emp.validation?.pay_period_end && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className="h-4 w-4 text-red-500 absolute right-2 top-2.5" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{emp.validation.pay_period_end}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </td>
                <td className="border p-2 relative">
                  <div className="flex items-center">
                    <Input 
                      type="number"
                      className={`w-full p-1 ${emp.validation?.regular_hours ? 'border-red-500' : ''}`}
                      value={emp.regular_hours}
                      onChange={e => updateEmployee(emp.id, 'regular_hours', Number(e.target.value))}
                      min="0"
                      step="0.5"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Standard hours at base pay rate ($25/hr)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {emp.validation?.regular_hours && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertCircle className="h-4 w-4 text-red-500 absolute right-6 top-2.5" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{emp.validation.regular_hours}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </td>
                <td className="border p-2 relative">
                  <div className="flex items-center">
                    <Input 
                      type="number"
                      className={`w-full p-1 ${emp.validation?.overtime_hours ? 'border-red-500' : ''}`}
                      value={emp.overtime_hours}
                      onChange={e => updateEmployee(emp.id, 'overtime_hours', Number(e.target.value))}
                      min="0"
                      step="0.5"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Overtime hours at 1.5x rate ($37.50/hr)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {emp.validation?.overtime_hours && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertCircle className="h-4 w-4 text-red-500 absolute right-6 top-2.5" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{emp.validation.overtime_hours}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </td>
                <td className="border p-2 relative">
                  <div className="flex items-center">
                    <Input 
                      type="number"
                      className={`w-full p-1 ${emp.validation?.deductions ? 'border-red-500' : ''}`}
                      value={emp.deductions}
                      onChange={e => updateEmployee(emp.id, 'deductions', Number(e.target.value))}
                      min="0"
                      step="0.01"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Total deductions (benefits, retirement, etc.)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {emp.validation?.deductions && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertCircle className="h-4 w-4 text-red-500 absolute right-6 top-2.5" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{emp.validation.deductions}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </td>
                <td className="border p-2 relative">
                  <div className="flex items-center">
                    <Input 
                      type="number"
                      className={`w-full p-1 ${emp.validation?.bonuses ? 'border-red-500' : ''}`}
                      value={emp.bonuses}
                      onChange={e => updateEmployee(emp.id, 'bonuses', Number(e.target.value))}
                      min="0"
                      step="0.01"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Additional compensation (bonuses, commissions)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {emp.validation?.bonuses && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertCircle className="h-4 w-4 text-red-500 absolute right-6 top-2.5" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{emp.validation.bonuses}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </td>
                <td className="border p-2">
                  <div className="flex items-center">
                    <Input 
                      type="number"
                      className="w-full p-1"
                      value={emp.taxes}
                      onChange={e => updateEmployee(emp.id, 'taxes', Number(e.target.value))}
                      min="0"
                      step="0.01"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>All taxes (income, FICA, etc.)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </td>
                <td className="border p-2 font-semibold text-right">
                  ${emp.net_pay.toFixed(2)}
                </td>
                <td className="border p-2">
                  <Input 
                    type="text"
                    className="w-full p-1"
                    value={emp.comments}
                    onChange={e => updateEmployee(emp.id, 'comments', e.target.value)}
                    placeholder="Add notes..."
                  />
                </td>
                <td className="border p-2">
                  <Button 
                    variant="destructive"
                    size="sm"
                    onClick={() => removeEmployee(emp.id)}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
            
            {/* Summary row */}
            <tr className="bg-gray-100 font-semibold">
              <td colSpan={4} className="border p-2 text-right">Summary Totals:</td>
              <td className="border p-2 text-right">{summary.regular_hours.toFixed(1)}</td>
              <td className="border p-2 text-right">{summary.overtime_hours.toFixed(1)}</td>
              <td className="border p-2 text-right">${summary.deductions.toFixed(2)}</td>
              <td className="border p-2 text-right">${summary.bonuses.toFixed(2)}</td>
              <td className="border p-2 text-right">${summary.taxes.toFixed(2)}</td>
              <td className="border p-2 text-right">${summary.net_pay.toFixed(2)}</td>
              <td colSpan={2} className="border p-2"></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payroll Submission</DialogTitle>
            <DialogDescription>
              You are about to submit payroll data for {employees.length} employees with a 
              total net pay of ${summary.net_pay.toFixed(2)}. 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h4 className="font-medium mb-2">Summary</h4>
            <ul className="space-y-1 text-sm">
              <li>Total Employees: {employees.length}</li>
              <li>Total Regular Hours: {summary.regular_hours.toFixed(1)}</li>
              <li>Total Overtime Hours: {summary.overtime_hours.toFixed(1)}</li>
              <li>Total Deductions: ${summary.deductions.toFixed(2)}</li>
              <li>Total Bonuses: ${summary.bonuses.toFixed(2)}</li>
              <li>Total Taxes: ${summary.taxes.toFixed(2)}</li>
              <li className="font-bold">Total Net Pay: ${summary.net_pay.toFixed(2)}</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSave}>
              Confirm Submission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}