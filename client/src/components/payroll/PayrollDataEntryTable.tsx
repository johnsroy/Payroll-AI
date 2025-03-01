'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { format, isValid, parseISO } from 'date-fns'
import { 
  ArrowUpDown, 
  ChevronsUpDown, 
  Download, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Trash2,
  Info,
  Check,
  X,
  Pencil
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Employee interface matching our database schema
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
  isNew?: boolean
}

interface PayrollDataEntryTableProps {
  initialData?: Employee[]
  onSave?: (data: Employee[]) => void
}

// API functions for CRUD operations
const fetchPayrollEntries = async (): Promise<Employee[]> => {
  const response = await fetch('/api/payroll/entries')
  if (!response.ok) {
    throw new Error('Failed to fetch payroll entries')
  }
  return response.json()
}

const createPayrollEntry = async (entry: Omit<Employee, 'id'>): Promise<Employee> => {
  const response = await fetch('/api/payroll/entries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entry),
  })
  
  if (!response.ok) {
    throw new Error('Failed to create payroll entry')
  }
  
  return response.json()
}

const updatePayrollEntry = async (entry: Employee): Promise<Employee> => {
  const response = await fetch(`/api/payroll/entries/${entry.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entry),
  })
  
  if (!response.ok) {
    throw new Error('Failed to update payroll entry')
  }
  
  return response.json()
}

const deletePayrollEntry = async (id: string): Promise<void> => {
  const response = await fetch(`/api/payroll/entries/${id}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    throw new Error('Failed to delete payroll entry')
  }
}

export function PayrollDataEntryTable({ initialData = [], onSave }: PayrollDataEntryTableProps) {
  const [data, setData] = useState<Employee[]>(initialData)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<keyof Employee>('employee_name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)
  const [confirmValue, setConfirmValue] = useState('')
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch data from API
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['/api/payroll/entries'],
    queryFn: fetchPayrollEntries,
  })

  // Add a new payroll entry
  const createMutation = useMutation({
    mutationFn: createPayrollEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/entries'] })
      toast({
        title: 'Entry created',
        description: 'New payroll entry has been created successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create entry: ${error.message}`,
        variant: 'destructive',
      })
    }
  })

  // Update a payroll entry
  const updateMutation = useMutation({
    mutationFn: updatePayrollEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/entries'] })
      toast({
        title: 'Entry updated',
        description: 'Payroll entry has been updated successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update entry: ${error.message}`,
        variant: 'destructive',
      })
    }
  })

  // Delete a payroll entry
  const deleteMutation = useMutation({
    mutationFn: deletePayrollEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/entries'] })
      toast({
        title: 'Entry deleted',
        description: 'Payroll entry has been removed successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete entry: ${error.message}`,
        variant: 'destructive',
      })
    }
  })

  // Update local data when API data is fetched
  useEffect(() => {
    if (fetchedData) {
      setData(fetchedData.map(item => ({
        ...item,
        isEditing: false,
        isNew: false
      })))
    }
  }, [fetchedData])

  // Function to add a new row
  const addNewRow = () => {
    const newEmployee: Employee = {
      id: `temp-${Date.now()}`,
      employee_id: '',
      employee_name: '',
      pay_period_start: format(new Date(), 'yyyy-MM-dd'),
      pay_period_end: format(new Date(), 'yyyy-MM-dd'),
      regular_hours: 0,
      overtime_hours: 0,
      deductions: 0,
      bonuses: 0,
      taxes: 0,
      net_pay: 0,
      comments: '',
      isEditing: true,
      isNew: true
    }
    
    setData([newEmployee, ...data])
  }

  // Function to start editing a row
  const startEditing = (id: string) => {
    setData(data.map(item => 
      item.id === id ? { ...item, isEditing: true } : item
    ))
  }

  // Function to cancel editing
  const cancelEditing = (id: string) => {
    setData(data.map(item => {
      if (item.id === id) {
        if (item.isNew) {
          return null // Remove new rows that haven't been saved
        }
        return { ...item, isEditing: false }
      }
      return item
    }).filter(Boolean) as Employee[])
  }

  // Function to save changes to a row
  const saveRow = async (id: string) => {
    const rowToSave = data.find(row => row.id === id)
    
    if (!rowToSave) return
    
    // Validate required fields
    if (!rowToSave.employee_id || !rowToSave.employee_name) {
      toast({
        title: 'Validation Error',
        description: 'Employee ID and Name are required.',
        variant: 'destructive',
      })
      return
    }
    
    try {
      if (rowToSave.isNew) {
        // Create new entry
        const { isNew, isEditing, ...entryData } = rowToSave
        await createMutation.mutateAsync(entryData as Omit<Employee, 'id'>)
      } else {
        // Update existing entry
        const { isNew, isEditing, ...entryData } = rowToSave
        await updateMutation.mutateAsync(entryData as Employee)
      }
      
      // Update UI state
      setData(data.map(item => 
        item.id === id ? { ...item, isEditing: false, isNew: false } : item
      ))
    } catch (error) {
      console.error('Error saving row:', error)
    }
  }

  // Function to confirm deletion
  const confirmDelete = () => {
    if (employeeToDelete && confirmValue === 'DELETE') {
      deleteMutation.mutate(employeeToDelete.id)
      setIsDeleteDialogOpen(false)
      setEmployeeToDelete(null)
      setConfirmValue('')
    }
  }

  // Function to update a field value
  const updateField = (id: string, field: keyof Employee, value: any) => {
    setData(data.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        
        // Auto-calculate net pay when relevant fields change
        if (['regular_hours', 'overtime_hours', 'deductions', 'bonuses', 'taxes'].includes(field)) {
          const regularHours = parseFloat(updatedItem.regular_hours.toString()) || 0
          const overtimeHours = parseFloat(updatedItem.overtime_hours.toString()) || 0
          const deductions = parseFloat(updatedItem.deductions.toString()) || 0
          const bonuses = parseFloat(updatedItem.bonuses.toString()) || 0
          const taxes = parseFloat(updatedItem.taxes.toString()) || 0
          
          // Assuming $25/hr for regular and $37.5/hr for overtime (1.5x)
          const regularPay = regularHours * 25
          const overtimePay = overtimeHours * 37.5
          const grossPay = regularPay + overtimePay + bonuses
          
          updatedItem.net_pay = grossPay - deductions - taxes
        }
        
        return updatedItem
      }
      return item
    }))
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    
    const date = typeof dateString === 'string' 
      ? (dateString.includes('T') ? parseISO(dateString) : new Date(dateString))
      : new Date(dateString)
      
    return isValid(date) ? format(date, 'MMM d, yyyy') : dateString
  }

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  // Handle column sorting
  const handleSort = (column: keyof Employee) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let result = [...data]
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      result = result.filter(item => 
        item.employee_id.toLowerCase().includes(searchLower) ||
        item.employee_name.toLowerCase().includes(searchLower) ||
        (item.comments && item.comments.toLowerCase().includes(searchLower))
      )
    }
    
    // Sort data
    result.sort((a, b) => {
      let aValue = a[sortColumn]
      let bValue = b[sortColumn]
      
      // Handle date sorting
      if (sortColumn === 'pay_period_start' || sortColumn === 'pay_period_end') {
        aValue = new Date(aValue as string).getTime()
        bValue = new Date(bValue as string).getTime()
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    
    return result
  }, [data, searchTerm, sortColumn, sortDirection])

  // Calculate totals for the summary row
  const totals = useMemo(() => {
    return filteredAndSortedData.reduce((acc, curr) => {
      return {
        regularHours: acc.regularHours + (parseFloat(curr.regular_hours.toString()) || 0),
        overtimeHours: acc.overtimeHours + (parseFloat(curr.overtime_hours.toString()) || 0),
        deductions: acc.deductions + (parseFloat(curr.deductions.toString()) || 0),
        bonuses: acc.bonuses + (parseFloat(curr.bonuses.toString()) || 0),
        taxes: acc.taxes + (parseFloat(curr.taxes.toString()) || 0),
        netPay: acc.netPay + (parseFloat(curr.net_pay.toString()) || 0)
      }
    }, {
      regularHours: 0,
      overtimeHours: 0,
      deductions: 0,
      bonuses: 0,
      taxes: 0,
      netPay: 0
    })
  }, [filteredAndSortedData])

  // Handle bulk save - submit all modified rows
  const handleBulkSave = async () => {
    const modifiedRows = data.filter(row => row.isEditing || row.isNew)
    
    if (modifiedRows.length === 0) {
      toast({
        title: 'No changes',
        description: 'No changes to save.',
      })
      return
    }
    
    setIsSaveDialogOpen(false)
    
    // Process each modified row
    for (const row of modifiedRows) {
      try {
        if (row.isNew) {
          const { isNew, isEditing, ...entryData } = row
          await createMutation.mutateAsync(entryData as Omit<Employee, 'id'>)
        } else {
          const { isNew, isEditing, ...entryData } = row
          await updateMutation.mutateAsync(entryData as Employee)
        }
      } catch (error) {
        console.error('Error saving row:', error)
      }
    }
    
    // Update all rows to not be in edit mode
    setData(data.map(item => ({ ...item, isEditing: false, isNew: false })))
    
    toast({
      title: 'Changes saved',
      description: `Successfully saved ${modifiedRows.length} entries.`,
    })
    
    // Call the onSave callback if provided
    if (onSave) {
      onSave(data)
    }
  }

  // Export to CSV
  const exportToCSV = () => {
    // Create CSV header
    const headers = [
      'Employee ID',
      'Employee Name',
      'Pay Period Start',
      'Pay Period End',
      'Regular Hours',
      'Overtime Hours',
      'Deductions',
      'Bonuses',
      'Taxes',
      'Net Pay',
      'Comments'
    ].join(',')
    
    // Create CSV rows
    const rows = filteredAndSortedData.map(item => [
      item.employee_id,
      `"${item.employee_name}"`, // Quote names to handle commas
      item.pay_period_start,
      item.pay_period_end,
      item.regular_hours,
      item.overtime_hours,
      item.deductions,
      item.bonuses,
      item.taxes,
      item.net_pay,
      `"${item.comments || ''}"` // Quote comments to handle commas
    ].join(','))
    
    // Combine header and rows
    const csv = [headers, ...rows].join('\n')
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `payroll_data_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle loading and error states
  if (isLoading) {
    return <div className="flex justify-center p-6">Loading payroll data...</div>
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 my-4">
        <div className="flex">
          <X className="h-5 w-5 text-red-400" aria-hidden="true" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading payroll data</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{(error as Error).message || 'Unknown error occurred'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Button onClick={addNewRow} size="sm" className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Entry</span>
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          {data.some(row => row.isEditing || row.isNew) && (
            <Button 
              variant="outline" 
              onClick={() => setIsSaveDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <Check className="h-4 w-4" />
              <span>Save All</span>
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={exportToCSV}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[100px]">
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort('employee_id')}
                  >
                    Employee ID
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort('employee_name')}
                  >
                    Name
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort('pay_period_start')}
                  >
                    Pay Period
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div 
                    className="flex items-center justify-end cursor-pointer"
                    onClick={() => handleSort('regular_hours')}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center">
                            Regular Hours
                            <Info className="ml-1 h-4 w-4 text-muted-foreground" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Standard working hours ($25/hr)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div 
                    className="flex items-center justify-end cursor-pointer"
                    onClick={() => handleSort('overtime_hours')}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center">
                            Overtime
                            <Info className="ml-1 h-4 w-4 text-muted-foreground" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Overtime hours (1.5x rate, $37.50/hr)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div 
                    className="flex items-center justify-end cursor-pointer"
                    onClick={() => handleSort('deductions')}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center">
                            Deductions
                            <Info className="ml-1 h-4 w-4 text-muted-foreground" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Total of all deductions (benefits, retirement, etc.)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div 
                    className="flex items-center justify-end cursor-pointer"
                    onClick={() => handleSort('bonuses')}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center">
                            Bonuses
                            <Info className="ml-1 h-4 w-4 text-muted-foreground" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Additional payments (commissions, special bonuses)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div 
                    className="flex items-center justify-end cursor-pointer"
                    onClick={() => handleSort('taxes')}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center">
                            Taxes
                            <Info className="ml-1 h-4 w-4 text-muted-foreground" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Total of all tax withholdings</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div 
                    className="flex items-center justify-end cursor-pointer"
                    onClick={() => handleSort('net_pay')}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center">
                            Net Pay
                            <Info className="ml-1 h-4 w-4 text-muted-foreground" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Final pay amount after deductions and taxes</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Comments</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.map((employee) => (
                <TableRow key={employee.id} className={employee.isNew ? 'bg-blue-50' : ''}>
                  <TableCell>
                    {employee.isEditing ? (
                      <Input
                        className="w-24"
                        value={employee.employee_id}
                        onChange={(e) => updateField(employee.id, 'employee_id', e.target.value)}
                      />
                    ) : (
                      employee.employee_id
                    )}
                  </TableCell>
                  <TableCell>
                    {employee.isEditing ? (
                      <Input
                        value={employee.employee_name}
                        onChange={(e) => updateField(employee.id, 'employee_name', e.target.value)}
                      />
                    ) : (
                      employee.employee_name
                    )}
                  </TableCell>
                  <TableCell>
                    {employee.isEditing ? (
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs">Start:</span>
                          <Input
                            type="date"
                            className="w-32"
                            value={employee.pay_period_start ? new Date(employee.pay_period_start).toISOString().split('T')[0] : ''}
                            onChange={(e) => updateField(employee.id, 'pay_period_start', e.target.value)}
                          />
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs">End:</span>
                          <Input
                            type="date"
                            className="w-32"
                            value={employee.pay_period_end ? new Date(employee.pay_period_end).toISOString().split('T')[0] : ''}
                            onChange={(e) => updateField(employee.id, 'pay_period_end', e.target.value)}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm">
                        <div>{formatDate(employee.pay_period_start)}</div>
                        <div className="text-gray-500">to</div>
                        <div>{formatDate(employee.pay_period_end)}</div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {employee.isEditing ? (
                      <Input
                        type="number"
                        className="w-20 text-right"
                        value={employee.regular_hours}
                        onChange={(e) => updateField(employee.id, 'regular_hours', parseFloat(e.target.value) || 0)}
                      />
                    ) : (
                      employee.regular_hours
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {employee.isEditing ? (
                      <Input
                        type="number"
                        className="w-20 text-right"
                        value={employee.overtime_hours}
                        onChange={(e) => updateField(employee.id, 'overtime_hours', parseFloat(e.target.value) || 0)}
                      />
                    ) : (
                      employee.overtime_hours
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {employee.isEditing ? (
                      <Input
                        type="number"
                        className="w-24 text-right"
                        value={employee.deductions}
                        onChange={(e) => updateField(employee.id, 'deductions', parseFloat(e.target.value) || 0)}
                      />
                    ) : (
                      formatCurrency(employee.deductions)
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {employee.isEditing ? (
                      <Input
                        type="number"
                        className="w-24 text-right"
                        value={employee.bonuses}
                        onChange={(e) => updateField(employee.id, 'bonuses', parseFloat(e.target.value) || 0)}
                      />
                    ) : (
                      formatCurrency(employee.bonuses)
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {employee.isEditing ? (
                      <Input
                        type="number"
                        className="w-24 text-right"
                        value={employee.taxes}
                        onChange={(e) => updateField(employee.id, 'taxes', parseFloat(e.target.value) || 0)}
                      />
                    ) : (
                      formatCurrency(employee.taxes)
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <Badge variant={employee.net_pay < 0 ? "destructive" : "default"} className="text-right w-auto">
                      {formatCurrency(employee.net_pay)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {employee.isEditing ? (
                      <Input
                        value={employee.comments || ''}
                        onChange={(e) => updateField(employee.id, 'comments', e.target.value)}
                      />
                    ) : (
                      <div className="max-w-xs truncate">{employee.comments}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      {employee.isEditing ? (
                        <div className="flex space-x-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => saveRow(employee.id)}
                            title="Save Changes"
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => cancelEditing(employee.id)}
                            title="Cancel Editing"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => startEditing(employee.id)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setEmployeeToDelete(employee)
                                setIsDeleteDialogOpen(true)
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Summary Row */}
              <TableRow className="bg-gray-50 font-medium">
                <TableCell colSpan={3}>Summary / Totals</TableCell>
                <TableCell className="text-right">{totals.regularHours.toFixed(2)}</TableCell>
                <TableCell className="text-right">{totals.overtimeHours.toFixed(2)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totals.deductions)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totals.bonuses)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totals.taxes)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totals.netPay)}</TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Save Confirmation Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save All Changes</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to save all changes? This will update the database with all modifications.</p>
            <p className="mt-2 text-gray-600">
              • {data.filter(row => row.isNew).length} new entries will be created<br />
              • {data.filter(row => row.isEditing && !row.isNew).length} existing entries will be updated
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkSave}>Save All</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this payroll entry? This action cannot be undone.</p>
            {employeeToDelete && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p><strong>Employee:</strong> {employeeToDelete.employee_name}</p>
                <p><strong>ID:</strong> {employeeToDelete.employee_id}</p>
                <p><strong>Pay Period:</strong> {formatDate(employeeToDelete.pay_period_start)} to {formatDate(employeeToDelete.pay_period_end)}</p>
              </div>
            )}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">
                Type DELETE to confirm
              </label>
              <Input 
                value={confirmValue}
                onChange={(e) => setConfirmValue(e.target.value)}
                placeholder="DELETE"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={confirmValue !== 'DELETE'}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}