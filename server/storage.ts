import { 
  users, type User, type InsertUser,
  employees, type Employee, type InsertEmployee,
  payrollEntries, type PayrollEntry, type InsertPayrollEntry
} from "@shared/schema";
import { db } from "./db";
import { eq, and, between, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Employee methods
  getEmployee(id: number): Promise<Employee | undefined>;
  getEmployeeByEmployeeId(employeeId: string): Promise<Employee | undefined>;
  getEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;
  
  // Payroll entry methods
  getPayrollEntry(id: number): Promise<PayrollEntry | undefined>;
  getPayrollEntries(limit?: number, offset?: number): Promise<PayrollEntry[]>;
  getPayrollEntriesByEmployeeId(employeeId: string): Promise<PayrollEntry[]>;
  getPayrollEntriesByDateRange(startDate: Date, endDate: Date): Promise<PayrollEntry[]>;
  createPayrollEntry(payrollEntry: InsertPayrollEntry): Promise<PayrollEntry>;
  updatePayrollEntry(id: number, payrollEntry: Partial<InsertPayrollEntry>): Promise<PayrollEntry | undefined>;
  deletePayrollEntry(id: number): Promise<boolean>;
  getPayrollStatistics(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Employee methods
  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }
  
  async getEmployeeByEmployeeId(employeeId: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.employeeId, employeeId));
    return employee;
  }
  
  async getEmployees(): Promise<Employee[]> {
    return db.select().from(employees).orderBy(employees.lastName);
  }
  
  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db.insert(employees).values(employee).returning();
    return newEmployee;
  }
  
  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [updatedEmployee] = await db
      .update(employees)
      .set({ ...employee, updatedAt: new Date() })
      .where(eq(employees.id, id))
      .returning();
    return updatedEmployee;
  }
  
  async deleteEmployee(id: number): Promise<boolean> {
    const result = await db.delete(employees).where(eq(employees.id, id));
    return true; // In Drizzle, successful execution means the delete occurred
  }
  
  // Payroll entry methods
  async getPayrollEntry(id: number): Promise<PayrollEntry | undefined> {
    const [entry] = await db.select().from(payrollEntries).where(eq(payrollEntries.id, id));
    return entry;
  }
  
  async getPayrollEntries(limit = 50, offset = 0): Promise<PayrollEntry[]> {
    return db
      .select()
      .from(payrollEntries)
      .orderBy(desc(payrollEntries.payPeriodEnd))
      .limit(limit)
      .offset(offset);
  }
  
  async getPayrollEntriesByEmployeeId(employeeId: string): Promise<PayrollEntry[]> {
    return db
      .select()
      .from(payrollEntries)
      .where(eq(payrollEntries.employeeId, employeeId))
      .orderBy(desc(payrollEntries.payPeriodEnd));
  }
  
  async getPayrollEntriesByDateRange(startDate: Date, endDate: Date): Promise<PayrollEntry[]> {
    // Convert the dates to strings in ISO format
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    return db
      .select()
      .from(payrollEntries)
      .where(
        and(
          between(payrollEntries.payPeriodStart, startDateStr, endDateStr),
          between(payrollEntries.payPeriodEnd, startDateStr, endDateStr)
        )
      )
      .orderBy(desc(payrollEntries.payPeriodEnd));
  }
  
  async createPayrollEntry(payrollEntry: InsertPayrollEntry): Promise<PayrollEntry> {
    const [newEntry] = await db.insert(payrollEntries).values(payrollEntry).returning();
    return newEntry;
  }
  
  async updatePayrollEntry(id: number, payrollEntry: Partial<InsertPayrollEntry>): Promise<PayrollEntry | undefined> {
    const [updatedEntry] = await db
      .update(payrollEntries)
      .set({ ...payrollEntry, updatedAt: new Date() })
      .where(eq(payrollEntries.id, id))
      .returning();
    return updatedEntry;
  }
  
  async deletePayrollEntry(id: number): Promise<boolean> {
    const result = await db.delete(payrollEntries).where(eq(payrollEntries.id, id));
    return true; // In Drizzle, successful execution means the delete occurred
  }
  
  async getPayrollStatistics(): Promise<any> {
    // This would be more complex with SQL aggregations
    // For simplicity, we'll get the data and calculate stats
    const entries = await db.select().from(payrollEntries);
    
    // Simple statistics calculation
    const totalGrossPay = entries.reduce((sum, entry) => sum + Number(entry.grossPay), 0);
    const totalNetPay = entries.reduce((sum, entry) => sum + Number(entry.netPay), 0);
    const totalFederalTax = entries.reduce((sum, entry) => sum + Number(entry.federalTax || 0), 0);
    const totalHours = entries.reduce((sum, entry) => sum + Number(entry.regularHours) + Number(entry.overtimeHours || 0), 0);
    const avgGrossPay = entries.length ? totalGrossPay / entries.length : 0;
    const avgNetPay = entries.length ? totalNetPay / entries.length : 0;
    
    return {
      totalEntries: entries.length,
      totalGrossPay,
      totalNetPay,
      totalFederalTax,
      totalHours,
      avgGrossPay,
      avgNetPay,
      taxPercentage: totalGrossPay ? (totalFederalTax / totalGrossPay) * 100 : 0
    };
  }
}

// Use the DatabaseStorage implementation
export const storage = new DatabaseStorage();
