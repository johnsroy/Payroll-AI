/**
 * This script creates sample payroll entries for testing purposes
 */
import { db } from '../server/db';
import { 
  employees, 
  payrollEntries, 
  insertEmployeeSchema, 
  insertPayrollEntrySchema 
} from '../shared/schema';
import { eq } from 'drizzle-orm';

async function seedPayrollData() {
  console.log('Creating sample employees...');
  
  // Create sample employees
  const employeeData = [
    {
      employeeId: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      position: 'Software Engineer',
      department: 'Engineering',
      hireDate: '2022-01-15', // Format as string for Zod validation
      status: 'active',
    },
    {
      employeeId: 'EMP002',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      position: 'Product Manager',
      department: 'Product',
      hireDate: '2021-05-10', // Format as string for Zod validation
      status: 'active',
    },
    {
      employeeId: 'EMP003',
      firstName: 'Robert',
      lastName: 'Johnson',
      email: 'robert.johnson@example.com',
      position: 'HR Specialist',
      department: 'Human Resources',
      hireDate: '2022-08-20', // Format as string for Zod validation
      status: 'active',
    },
  ];

  // Skip inserting employees as they already exist
  console.log('Employees already exist, skipping employee creation...');
  
  console.log('Creating sample payroll entries...');
  
  // Create payroll entries
  const payrollData = [
    {
      employeeId: 'EMP001',
      payPeriodStart: '2025-02-01',
      payPeriodEnd: '2025-02-15',
      regularHours: '80.0',
      overtimeHours: '5.0',
      regularRate: '45.0',
      overtimeRate: '67.5',
      grossPay: '3825.00', // 80 * 45 + 5 * 45 * 1.5
      federalTax: '574.00',
      stateTax: '191.25',
      medicareTax: '55.46',
      socialSecurityTax: '237.15',
      healthInsurance: '120.00',
      retirement401k: '191.25',
      otherDeductions: '0',
      netPay: '2455.89',
      status: 'paid',
    },
    {
      employeeId: 'EMP001',
      payPeriodStart: '2025-02-16',
      payPeriodEnd: '2025-02-28',
      regularHours: '80.0',
      overtimeHours: '2.0',
      regularRate: '45.0',
      overtimeRate: '67.5',
      grossPay: '3690.00', // 80 * 45 + 2 * 45 * 1.5
      federalTax: '553.50',
      stateTax: '184.50',
      medicareTax: '53.51',
      socialSecurityTax: '228.78',
      healthInsurance: '120.00',
      retirement401k: '184.50',
      otherDeductions: '0',
      netPay: '2365.21',
      status: 'approved',
    },
    {
      employeeId: 'EMP002',
      payPeriodStart: '2025-02-01',
      payPeriodEnd: '2025-02-15',
      regularHours: '80.0',
      overtimeHours: '0',
      regularRate: '43.27',
      overtimeRate: '64.91',
      grossPay: '3461.54', // 90000 / 26 pay periods
      federalTax: '519.23',
      stateTax: '173.08',
      medicareTax: '50.19',
      socialSecurityTax: '214.62',
      healthInsurance: '150.00',
      retirement401k: '173.08',
      otherDeductions: '50.00',
      netPay: '2131.34',
      status: 'paid',
    },
    {
      employeeId: 'EMP002',
      payPeriodStart: '2025-02-16',
      payPeriodEnd: '2025-02-28',
      regularHours: '80.0',
      overtimeHours: '0',
      regularRate: '43.27',
      overtimeRate: '64.91',
      grossPay: '3461.54', // 90000 / 26 pay periods
      federalTax: '519.23',
      stateTax: '173.08',
      medicareTax: '50.19',
      socialSecurityTax: '214.62',
      healthInsurance: '150.00',
      retirement401k: '173.08',
      otherDeductions: '50.00',
      netPay: '2131.34',
      status: 'approved',
    },
    {
      employeeId: 'EMP003',
      payPeriodStart: '2025-02-01',
      payPeriodEnd: '2025-02-15',
      regularHours: '80.0',
      overtimeHours: '0',
      regularRate: '35.0',
      overtimeRate: '52.5',
      grossPay: '2800.00', // 80 * 35
      federalTax: '420.00',
      stateTax: '140.00',
      medicareTax: '40.60',
      socialSecurityTax: '173.60',
      healthInsurance: '100.00',
      retirement401k: '140.00',
      otherDeductions: '0',
      netPay: '1785.80',
      status: 'paid',
    },
    {
      employeeId: 'EMP003',
      payPeriodStart: '2025-02-16',
      payPeriodEnd: '2025-02-28',
      regularHours: '76.0',
      overtimeHours: '0',
      regularRate: '35.0',
      overtimeRate: '52.5',
      grossPay: '2660.00', // 76 * 35
      federalTax: '399.00',
      stateTax: '133.00',
      medicareTax: '38.57',
      socialSecurityTax: '164.92',
      healthInsurance: '100.00',
      retirement401k: '133.00',
      otherDeductions: '0',
      netPay: '1691.51',
      status: 'pending',
    },
  ];

  // Insert payroll entries
  for (const entry of payrollData) {
    const parsedEntry = insertPayrollEntrySchema.parse(entry);
    await db.insert(payrollEntries).values(parsedEntry);
  }

  console.log('Sample data created successfully!');
}

// Run the seed function
seedPayrollData().catch(console.error);