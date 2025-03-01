import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, PlusCircle, Save, Trash2, Edit, X, AlertCircle } from 'lucide-react';

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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [employeesToDelete, setEmployeesToDelete] = useState<string[]>([]);
  const [confirmSaveDialogOpen, setConfirmSaveDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totals, setTotals] = useState({
    regularHours: 0,
    overtimeHours: 0,
    deductions: 0,
    bonuses: 0,
    taxes: 0,
    netPay: 0
  });
  
  // Mock API call to get initial data
  useEffect(() => {
    // Simulating data fetching
    setTimeout(() => {
      const initialData = [
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
          comments: 'Regular performance',
          isEditing: false
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
          comments: 'Part-time',
          isEditing: false
        }
      ];
      setEmployees(initialData);
      setFilteredEmployees(initialData);
      calculateTotals(initialData);
    }, 500);
  }, []);

  // Calculate totals for the footer row
  const calculateTotals = (data: Employee[]) => {
    const newTotals = data.reduce((acc, employee) => {
      return {
        regularHours: acc.regularHours + employee.regular_hours,
        overtimeHours: acc.overtimeHours + employee.overtime_hours,
        deductions: acc.deductions + employee.deductions,
        bonuses: acc.bonuses + employee.bonuses,
        taxes: acc.taxes + employee.taxes,
        netPay: acc.netPay + employee.net_pay
      };
    }, {
      regularHours: 0,
      overtimeHours: 0,
      deductions: 0,
      bonuses: 0,
      taxes: 0,
      netPay: 0
    });
    
    setTotals(newTotals);
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Create a new employee record
  const createEmptyEmployee = (): Employee => {
    const newId = String(Math.max(...employees.map(e => Number(e.id)), 0) + 1);
    const paddedId = String(newId).padStart(3, '0');
    
    return {
      id: newId,
      employee_id: `EMP${paddedId}`,
      employee_name: '',
      pay_period_start: new Date().toISOString().split('T')[0],
      pay_period_end: new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0],
      regular_hours: 0,
      overtime_hours: 0,
      deductions: 0,
      bonuses: 0,
      taxes: 0,
      net_pay: 0,
      comments: '',
      isEditing: true,
      validation: {}
    };
  };
  
  // Add a new employee
  const handleAddEmployee = () => {
    const newEmployee = createEmptyEmployee();
    const updatedEmployees = [...employees, newEmployee];
    setEmployees(updatedEmployees);
    setFilteredEmployees(applySearch(updatedEmployees, searchQuery));
  };
  
  // Handle field change for an employee
  const handleFieldChange = (id: string, field: keyof Employee, value: any) => {
    const updatedEmployees = employees.map(emp => {
      if (emp.id === id) {
        const updatedEmployee = { ...emp, [field]: value };
        
        // Validate the field
        const validation = { ...updatedEmployee.validation || {} };
        const errorMessage = validateField(updatedEmployee, field, value);
        
        if (errorMessage) {
          validation[field] = errorMessage;
        } else {
          delete validation[field];
        }
        
        updatedEmployee.validation = validation;
        
        // If field affects net pay, recalculate
        if (['regular_hours', 'overtime_hours', 'deductions', 'bonuses', 'taxes'].includes(field)) {
          updatedEmployee.net_pay = calculateNetPay(
            updatedEmployee.regular_hours,
            updatedEmployee.overtime_hours,
            updatedEmployee.deductions,
            updatedEmployee.bonuses,
            updatedEmployee.taxes
          );
        }
        
        return updatedEmployee;
      }
      return emp;
    });
    
    setEmployees(updatedEmployees);
    setFilteredEmployees(applySearch(updatedEmployees, searchQuery));
    calculateTotals(updatedEmployees);
  };
  
  // Calculate net pay based on input values
  const calculateNetPay = (
    regularHours: number,
    overtimeHours: number,
    deductions: number,
    bonuses: number,
    taxes: number
  ): number => {
    const regularPay = regularHours * 25; // $25/hour
    const overtimePay = overtimeHours * 37.5; // $37.5/hour (1.5x)
    return regularPay + overtimePay + bonuses - deductions - taxes;
  };
  
  // Toggle edit mode for an employee
  const toggleEditMode = (id: string) => {
    setEmployees(employees.map(emp => {
      if (emp.id === id) {
        return { ...emp, isEditing: !emp.isEditing };
      }
      return emp;
    }));
    
    setFilteredEmployees(applySearch(employees, searchQuery));
  };
  
  // Validate field input
  const validateField = (employee: Employee, field: keyof Employee, value: any): string => {
    switch (field) {
      case 'employee_id':
        if (!value) return 'Employee ID is required';
        if (employees.some(e => e.employee_id === value && e.id !== employee.id)) {
          return 'Employee ID must be unique';
        }
        return '';
        
      case 'employee_name':
        if (!value) return 'Employee name is required';
        return '';
        
      case 'regular_hours':
        if (value < 0) return 'Hours cannot be negative';
        if (value > 168) return 'Hours exceed maximum weekly hours (168)';
        return '';
        
      case 'overtime_hours':
        if (value < 0) return 'Hours cannot be negative';
        if (value > 80) return 'Overtime hours seem excessive';
        return '';
        
      case 'pay_period_start':
      case 'pay_period_end':
        if (!value) return 'Date is required';
        const startDate = field === 'pay_period_end' ? new Date(employee.pay_period_start) : null;
        const endDate = field === 'pay_period_start' ? new Date(employee.pay_period_end) : null;
        const currentDate = new Date(value);
        
        if (startDate && currentDate > startDate) {
          return 'End date must be after start date';
        }
        if (endDate && currentDate < endDate) {
          return 'Start date must be before end date';
        }
        return '';
        
      default:
        return '';
    }
  };
  
  // Apply search filter to employees
  const applySearch = (data: Employee[], query: string): Employee[] => {
    if (!query.trim()) return data;
    
    const lowercaseQuery = query.toLowerCase();
    return data.filter(employee => 
      employee.employee_id.toLowerCase().includes(lowercaseQuery) ||
      employee.employee_name.toLowerCase().includes(lowercaseQuery)
    );
  };
  
  // Handle search input change
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    setFilteredEmployees(applySearch(employees, query));
  };
  
  // Handle delete confirmation
  const confirmDelete = (id: string) => {
    setEmployeesToDelete([id]);
    setConfirmDialogOpen(true);
  };
  
  // Delete employees after confirmation
  const handleDeleteConfirmed = () => {
    const updatedEmployees = employees.filter(emp => !employeesToDelete.includes(emp.id));
    setEmployees(updatedEmployees);
    setFilteredEmployees(applySearch(updatedEmployees, searchQuery));
    calculateTotals(updatedEmployees);
    setConfirmDialogOpen(false);
    setEmployeesToDelete([]);
  };
  
  // Save all employee data
  const handleSave = () => {
    // Check if there are any validation errors
    const hasErrors = employees.some(emp => 
      emp.validation && Object.keys(emp.validation).length > 0
    );
    
    if (hasErrors) {
      alert('Please fix validation errors before saving');
      return;
    }
    
    setConfirmSaveDialogOpen(true);
  };
  
  // Save confirmed
  const handleSaveConfirmed = async () => {
    setIsLoading(true);
    
    try {
      // Remove editing flags before saving
      const dataToSave = employees.map(({ isEditing, validation, ...emp }) => emp);
      
      // Call the onSave callback if provided
      if (onSave) {
        onSave(dataToSave);
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConfirmSaveDialogOpen(false);
      setIsLoading(false);
      
      // Set all employees to non-editing mode
      setEmployees(employees.map(emp => ({ ...emp, isEditing: false })));
      alert('Payroll data saved successfully!');
    } catch (error) {
      console.error('Error saving payroll data:', error);
      setIsLoading(false);
      alert('Failed to save payroll data. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleAddEmployee} className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" />
            Add Employee
          </Button>
          
          <Button onClick={handleSave} variant="secondary" className="flex items-center gap-1">
            <Save className="h-4 w-4" />
            Save All
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Pay Period</TableHead>
              <TableHead className="text-right">Reg. Hours</TableHead>
              <TableHead className="text-right">OT Hours</TableHead>
              <TableHead className="text-right">Deductions</TableHead>
              <TableHead className="text-right">Bonuses</TableHead>
              <TableHead className="text-right">Taxes</TableHead>
              <TableHead className="text-right">Net Pay</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {filteredEmployees.map(employee => (
              <TableRow key={employee.id} className={employee.isEditing ? 'bg-blue-50' : ''}>
                <TableCell>
                  {employee.isEditing ? (
                    <div className="space-y-1">
                      <Input 
                        value={employee.employee_id}
                        onChange={e => handleFieldChange(employee.id, 'employee_id', e.target.value)}
                        className={employee.validation?.employee_id ? 'border-red-500' : ''}
                      />
                      {employee.validation?.employee_id && (
                        <div className="text-xs text-red-500">{employee.validation.employee_id}</div>
                      )}
                    </div>
                  ) : (
                    employee.employee_id
                  )}
                </TableCell>
                
                <TableCell>
                  {employee.isEditing ? (
                    <div className="space-y-1">
                      <Input 
                        value={employee.employee_name}
                        onChange={e => handleFieldChange(employee.id, 'employee_name', e.target.value)}
                        className={employee.validation?.employee_name ? 'border-red-500' : ''}
                      />
                      {employee.validation?.employee_name && (
                        <div className="text-xs text-red-500">{employee.validation.employee_name}</div>
                      )}
                    </div>
                  ) : (
                    employee.employee_name
                  )}
                </TableCell>
                
                <TableCell>
                  {employee.isEditing ? (
                    <div className="flex flex-col gap-2">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">Start</div>
                        <Input 
                          type="date"
                          value={employee.pay_period_start}
                          onChange={e => handleFieldChange(employee.id, 'pay_period_start', e.target.value)}
                          className={employee.validation?.pay_period_start ? 'border-red-500' : ''}
                        />
                        {employee.validation?.pay_period_start && (
                          <div className="text-xs text-red-500">{employee.validation.pay_period_start}</div>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">End</div>
                        <Input 
                          type="date"
                          value={employee.pay_period_end}
                          onChange={e => handleFieldChange(employee.id, 'pay_period_end', e.target.value)}
                          className={employee.validation?.pay_period_end ? 'border-red-500' : ''}
                        />
                        {employee.validation?.pay_period_end && (
                          <div className="text-xs text-red-500">{employee.validation.pay_period_end}</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div>{formatDate(employee.pay_period_start)}</div>
                      <div className="text-gray-500">to</div>
                      <div>{formatDate(employee.pay_period_end)}</div>
                    </div>
                  )}
                </TableCell>
                
                <TableCell className="text-right">
                  {employee.isEditing ? (
                    <div className="space-y-1">
                      <Input 
                        type="number"
                        value={employee.regular_hours}
                        onChange={e => handleFieldChange(employee.id, 'regular_hours', Number(e.target.value))}
                        className={employee.validation?.regular_hours ? 'border-red-500 text-right' : 'text-right'}
                      />
                      {employee.validation?.regular_hours && (
                        <div className="text-xs text-red-500">{employee.validation.regular_hours}</div>
                      )}
                    </div>
                  ) : (
                    employee.regular_hours
                  )}
                </TableCell>
                
                <TableCell className="text-right">
                  {employee.isEditing ? (
                    <div className="space-y-1">
                      <Input 
                        type="number"
                        value={employee.overtime_hours}
                        onChange={e => handleFieldChange(employee.id, 'overtime_hours', Number(e.target.value))}
                        className={employee.validation?.overtime_hours ? 'border-red-500 text-right' : 'text-right'}
                      />
                      {employee.validation?.overtime_hours && (
                        <div className="text-xs text-red-500">{employee.validation.overtime_hours}</div>
                      )}
                    </div>
                  ) : (
                    employee.overtime_hours
                  )}
                </TableCell>
                
                <TableCell className="text-right">
                  {employee.isEditing ? (
                    <Input 
                      type="number"
                      value={employee.deductions}
                      onChange={e => handleFieldChange(employee.id, 'deductions', Number(e.target.value))}
                      className="text-right"
                    />
                  ) : (
                    formatCurrency(employee.deductions)
                  )}
                </TableCell>
                
                <TableCell className="text-right">
                  {employee.isEditing ? (
                    <Input 
                      type="number"
                      value={employee.bonuses}
                      onChange={e => handleFieldChange(employee.id, 'bonuses', Number(e.target.value))}
                      className="text-right"
                    />
                  ) : (
                    formatCurrency(employee.bonuses)
                  )}
                </TableCell>
                
                <TableCell className="text-right">
                  {employee.isEditing ? (
                    <Input 
                      type="number"
                      value={employee.taxes}
                      onChange={e => handleFieldChange(employee.id, 'taxes', Number(e.target.value))}
                      className="text-right"
                    />
                  ) : (
                    formatCurrency(employee.taxes)
                  )}
                </TableCell>
                
                <TableCell className="text-right font-semibold">
                  {formatCurrency(employee.net_pay)}
                </TableCell>
                
                <TableCell>
                  {employee.isEditing ? (
                    <Input 
                      value={employee.comments}
                      onChange={e => handleFieldChange(employee.id, 'comments', e.target.value)}
                    />
                  ) : (
                    employee.comments
                  )}
                </TableCell>
                
                <TableCell>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => toggleEditMode(employee.id)}
                      className="h-8 w-8"
                    >
                      {employee.isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(employee.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            
            {/* Summary Row */}
            <TableRow className="bg-gray-100 font-semibold">
              <TableCell colSpan={3}>Totals</TableCell>
              <TableCell className="text-right">{totals.regularHours}</TableCell>
              <TableCell className="text-right">{totals.overtimeHours}</TableCell>
              <TableCell className="text-right">{formatCurrency(totals.deductions)}</TableCell>
              <TableCell className="text-right">{formatCurrency(totals.bonuses)}</TableCell>
              <TableCell className="text-right">{formatCurrency(totals.taxes)}</TableCell>
              <TableCell className="text-right">{formatCurrency(totals.netPay)}</TableCell>
              <TableCell colSpan={2}></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      
      {/* No results message */}
      {filteredEmployees.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No employees found. Try adjusting your search or add a new employee.
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this employee record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirmed}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Save Confirmation Dialog */}
      <Dialog open={confirmSaveDialogOpen} onOpenChange={setConfirmSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Payroll Data</DialogTitle>
            <DialogDescription>
              Are you sure you want to save all payroll data? This will update employee records in the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmSaveDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfirmed} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}