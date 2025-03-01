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
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
  Download, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Trash2,
  Check,
  X,
  Pencil,
  Upload
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
    result.sort((rowA, rowB) => {
      // Get values with default to handle undefined
      let aValue = rowA[sortColumn] ?? ''
      let bValue = rowB[sortColumn] ?? ''
      
      // Handle date sorting
      if (sortColumn === 'pay_period_start' || sortColumn === 'pay_period_end') {
        aValue = new Date(aValue as string).getTime()
        bValue = new Date(bValue as string).getTime()
      }
      
      // Handle numeric columns
      if (['regular_hours', 'overtime_hours', 'deductions', 'bonuses', 'taxes', 'net_pay'].includes(sortColumn)) {
        aValue = Number(aValue) || 0
        bValue = Number(bValue) || 0
      }
      
      // Perform comparison
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

  // Create empty CSV template for download
  const downloadTemplate = () => {
    // Create CSV header
    const headers = [
      'Employee ID',
      'Employee Name',
      'Pay Period Start (yyyy-MM-dd)',
      'Pay Period End (yyyy-MM-dd)',
      'Regular Hours',
      'Overtime Hours',
      'Deductions',
      'Bonuses',
      'Taxes',
      'Comments'
    ].join(',')
    
    // Add one example row
    const exampleRow = [
      'EMP001',
      '"John Doe"',
      format(new Date(), 'yyyy-MM-dd'),
      format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      '40',
      '5',
      '100',
      '200',
      '300',
      '"Example comments here"'
    ].join(',')
    
    // Create CSV content with header and example
    const csv = [headers, exampleRow].join('\n')
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `payroll_template.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: 'Template Downloaded',
      description: 'Fill in the template and upload it to bulk add entries.',
    })
  }

  // Parse and handle CSV file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvData = e.target?.result as string
        const rows = csvData.split('\n')
        
        // Skip header row
        const dataRows = rows.slice(1).filter(row => row.trim())
        
        const newEntries: Employee[] = dataRows.map((row, index) => {
          // Split by comma but respect quoted values
          const cells: string[] = []
          let insideQuotes = false
          let currentCell = ''
          
          for (let i = 0; i < row.length; i++) {
            const char = row[i]
            
            if (char === '"') {
              insideQuotes = !insideQuotes
            } else if (char === ',' && !insideQuotes) {
              cells.push(currentCell)
              currentCell = ''
            } else {
              currentCell += char
            }
          }
          
          // Push the last cell
          cells.push(currentCell)
          
          // Map to Employee object
          return {
            id: `temp-${Date.now()}-${index}`,
            employee_id: cells[0]?.trim() || '',
            employee_name: cells[1]?.replace(/"/g, '').trim() || '',
            pay_period_start: cells[2]?.trim() || format(new Date(), 'yyyy-MM-dd'),
            pay_period_end: cells[3]?.trim() || format(new Date(), 'yyyy-MM-dd'),
            regular_hours: parseFloat(cells[4]?.trim() || '0'),
            overtime_hours: parseFloat(cells[5]?.trim() || '0'),
            deductions: parseFloat(cells[6]?.trim() || '0'),
            bonuses: parseFloat(cells[7]?.trim() || '0'),
            taxes: parseFloat(cells[8]?.trim() || '0'),
            net_pay: 0, // Will be calculated
            comments: cells[9]?.replace(/"/g, '').trim() || '',
            isEditing: false,
            isNew: true
          }
        })
        
        // Calculate net pay for each entry
        newEntries.forEach(entry => {
          const regularPay = entry.regular_hours * 25
          const overtimePay = entry.overtime_hours * 37.5
          const grossPay = regularPay + overtimePay + entry.bonuses
          entry.net_pay = grossPay - entry.deductions - entry.taxes
        })
        
        setData([...newEntries, ...data])
        
        toast({
          title: 'CSV Uploaded',
          description: `${newEntries.length} entries added from CSV. Review and save to commit to database.`,
        })
      } catch (error) {
        console.error('Error parsing CSV:', error)
        toast({
          title: 'Error',
          description: 'Failed to parse CSV file. Please check the format and try again.',
          variant: 'destructive',
        })
      }
    }
    
    reader.readAsText(file)
    
    // Reset the input so the same file can be uploaded again
    event.target.value = ''
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search employees..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-1" />
                  Template
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download CSV template</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => document.getElementById('csv-upload')?.click()}>
                  <Upload className="h-4 w-4 mr-1" />
                  Import
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Import from CSV</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
          />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export to CSV</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button variant="default" size="sm" onClick={addNewRow}>
            <Plus className="h-4 w-4 mr-1" />
            Add Entry
          </Button>
          
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => setIsSaveDialogOpen(true)}
            disabled={!data.some(item => item.isEditing || item.isNew)}
          >
            <Check className="h-4 w-4 mr-1" />
            Save All
          </Button>
        </div>
      </div>
      
      {/* Data Table */}
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="w-[100px] cursor-pointer"
                onClick={() => handleSort('employee_id')}
              >
                <div className="flex items-center">
                  Employee ID
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('employee_name')}
              >
                <div className="flex items-center">
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('pay_period_start')}
              >
                <div className="flex items-center">
                  Period Start
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('pay_period_end')}
              >
                <div className="flex items-center">
                  Period End
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              
              <TableHead 
                className="text-right cursor-pointer"
                onClick={() => handleSort('regular_hours')}
              >
                <div className="flex items-center justify-end">
                  Regular Hrs
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              
              <TableHead 
                className="text-right cursor-pointer"
                onClick={() => handleSort('overtime_hours')}
              >
                <div className="flex items-center justify-end">
                  OT Hrs
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              
              <TableHead 
                className="text-right cursor-pointer"
                onClick={() => handleSort('deductions')}
              >
                <div className="flex items-center justify-end">
                  Deductions
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              
              <TableHead 
                className="text-right cursor-pointer"
                onClick={() => handleSort('bonuses')}
              >
                <div className="flex items-center justify-end">
                  Bonuses
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              
              <TableHead 
                className="text-right cursor-pointer"
                onClick={() => handleSort('taxes')}
              >
                <div className="flex items-center justify-end">
                  Taxes
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              
              <TableHead 
                className="text-right cursor-pointer"
                onClick={() => handleSort('net_pay')}
              >
                <div className="flex items-center justify-end">
                  Net Pay
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              
              <TableHead>
                Comments
              </TableHead>
              
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center h-24">
                  Loading data...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center h-24 text-red-500">
                  Error loading data: {(error as Error).message}
                </TableCell>
              </TableRow>
            ) : filteredAndSortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center h-24">
                  No payroll data found. Add a new entry to get started.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {filteredAndSortedData.map((row) => (
                  <TableRow key={row.id} className={row.isNew ? 'bg-green-50 dark:bg-green-950/20' : ''}>
                    {/* Employee ID */}
                    <TableCell>
                      {row.isEditing ? (
                        <Input
                          value={row.employee_id}
                          onChange={(e) => updateField(row.id, 'employee_id', e.target.value)}
                          className="w-full h-8"
                        />
                      ) : (
                        row.employee_id
                      )}
                    </TableCell>
                    
                    {/* Employee Name */}
                    <TableCell>
                      {row.isEditing ? (
                        <Input
                          value={row.employee_name}
                          onChange={(e) => updateField(row.id, 'employee_name', e.target.value)}
                          className="w-full h-8"
                        />
                      ) : (
                        row.employee_name
                      )}
                    </TableCell>
                    
                    {/* Pay Period Start */}
                    <TableCell>
                      {row.isEditing ? (
                        <Input
                          type="date"
                          value={row.pay_period_start}
                          onChange={(e) => updateField(row.id, 'pay_period_start', e.target.value)}
                          className="w-full h-8"
                        />
                      ) : (
                        formatDate(row.pay_period_start)
                      )}
                    </TableCell>
                    
                    {/* Pay Period End */}
                    <TableCell>
                      {row.isEditing ? (
                        <Input
                          type="date"
                          value={row.pay_period_end}
                          onChange={(e) => updateField(row.id, 'pay_period_end', e.target.value)}
                          className="w-full h-8"
                        />
                      ) : (
                        formatDate(row.pay_period_end)
                      )}
                    </TableCell>
                    
                    {/* Regular Hours */}
                    <TableCell className="text-right">
                      {row.isEditing ? (
                        <Input
                          type="number"
                          value={row.regular_hours}
                          onChange={(e) => updateField(row.id, 'regular_hours', parseFloat(e.target.value) || 0)}
                          className="w-full h-8 text-right"
                        />
                      ) : (
                        row.regular_hours.toFixed(2)
                      )}
                    </TableCell>
                    
                    {/* Overtime Hours */}
                    <TableCell className="text-right">
                      {row.isEditing ? (
                        <Input
                          type="number"
                          value={row.overtime_hours}
                          onChange={(e) => updateField(row.id, 'overtime_hours', parseFloat(e.target.value) || 0)}
                          className="w-full h-8 text-right"
                        />
                      ) : (
                        row.overtime_hours.toFixed(2)
                      )}
                    </TableCell>
                    
                    {/* Deductions */}
                    <TableCell className="text-right">
                      {row.isEditing ? (
                        <Input
                          type="number"
                          value={row.deductions}
                          onChange={(e) => updateField(row.id, 'deductions', parseFloat(e.target.value) || 0)}
                          className="w-full h-8 text-right"
                        />
                      ) : (
                        formatCurrency(row.deductions)
                      )}
                    </TableCell>
                    
                    {/* Bonuses */}
                    <TableCell className="text-right">
                      {row.isEditing ? (
                        <Input
                          type="number"
                          value={row.bonuses}
                          onChange={(e) => updateField(row.id, 'bonuses', parseFloat(e.target.value) || 0)}
                          className="w-full h-8 text-right"
                        />
                      ) : (
                        formatCurrency(row.bonuses)
                      )}
                    </TableCell>
                    
                    {/* Taxes */}
                    <TableCell className="text-right">
                      {row.isEditing ? (
                        <Input
                          type="number"
                          value={row.taxes}
                          onChange={(e) => updateField(row.id, 'taxes', parseFloat(e.target.value) || 0)}
                          className="w-full h-8 text-right"
                        />
                      ) : (
                        formatCurrency(row.taxes)
                      )}
                    </TableCell>
                    
                    {/* Net Pay */}
                    <TableCell className="text-right font-medium">
                      {formatCurrency(row.net_pay)}
                    </TableCell>
                    
                    {/* Comments */}
                    <TableCell>
                      {row.isEditing ? (
                        <Input
                          value={row.comments || ''}
                          onChange={(e) => updateField(row.id, 'comments', e.target.value)}
                          className="w-full h-8"
                        />
                      ) : (
                        <div className="truncate max-w-[200px]" title={row.comments || ''}>
                          {row.comments || '-'}
                        </div>
                      )}
                    </TableCell>
                    
                    {/* Actions */}
                    <TableCell>
                      {row.isEditing ? (
                        <div className="flex items-center justify-end space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => saveRow(row.id)}
                            className="h-8 w-8"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => cancelEditing(row.id)}
                            className="h-8 w-8"
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => startEditing(row.id)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setEmployeeToDelete(row)
                                setIsDeleteDialogOpen(true)
                                setConfirmValue('')
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Summary Row */}
                <TableRow className="bg-muted/50 font-medium">
                  <TableCell colSpan={4} className="text-right">Totals:</TableCell>
                  <TableCell className="text-right">{totals.regularHours.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{totals.overtimeHours.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totals.deductions)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totals.bonuses)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totals.taxes)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totals.netPay)}</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination would go here */}
      
      {/* Save Changes Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Changes</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>You have {data.filter(row => row.isEditing || row.isNew).length} unsaved changes. Would you like to save them now?</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>Cancel</Button>
            <Button variant="default" onClick={handleBulkSave}>Save All</Button>
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
            {employeeToDelete && (
              <div className="space-y-2">
                <p><strong>Employee:</strong> {employeeToDelete.employee_name}</p>
                <p><strong>ID:</strong> {employeeToDelete.employee_id}</p>
                <p><strong>Pay Period:</strong> {formatDate(employeeToDelete.pay_period_start)} to {formatDate(employeeToDelete.pay_period_end)}</p>
              </div>
            )}
            <div className="mt-4">
              <p className="text-red-600">This action cannot be undone.</p>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">
                  Type DELETE to confirm
                </p>
                <Input 
                  value={confirmValue}
                  onChange={(e) => setConfirmValue(e.target.value)}
                  className="mt-1"
                  placeholder="DELETE"
                />
              </div>
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