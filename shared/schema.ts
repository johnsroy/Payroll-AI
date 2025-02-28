import { pgTable, text, serial, integer, boolean, timestamp, numeric, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Employees table
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  department: text("department"),
  position: text("position"),
  email: text("email"),
  hireDate: date("hire_date"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEmployeeSchema = createInsertSchema(employees).pick({
  employeeId: true,
  firstName: true,
  lastName: true,
  department: true,
  position: true,
  email: true,
  hireDate: true,
  status: true,
});

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

// Payroll entries table
export const payrollEntries = pgTable("payroll_entries", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull(),
  payPeriodStart: date("pay_period_start").notNull(),
  payPeriodEnd: date("pay_period_end").notNull(),
  regularHours: numeric("regular_hours").notNull(),
  overtimeHours: numeric("overtime_hours").default("0"),
  regularRate: numeric("regular_rate").notNull(),
  overtimeRate: numeric("overtime_rate"),
  grossPay: numeric("gross_pay").notNull(),
  federalTax: numeric("federal_tax"),
  stateTax: numeric("state_tax"),
  medicareTax: numeric("medicare_tax"),
  socialSecurityTax: numeric("social_security_tax"),
  otherTaxes: numeric("other_taxes").default("0"),
  healthInsurance: numeric("health_insurance").default("0"),
  retirement401k: numeric("retirement_401k").default("0"),
  otherDeductions: numeric("other_deductions").default("0"),
  bonuses: numeric("bonuses").default("0"),
  netPay: numeric("net_pay").notNull(),
  status: text("status").default("pending"), // pending, approved, paid
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPayrollEntrySchema = createInsertSchema(payrollEntries).pick({
  employeeId: true,
  payPeriodStart: true,
  payPeriodEnd: true,
  regularHours: true,
  overtimeHours: true,
  regularRate: true,
  overtimeRate: true,
  grossPay: true,
  federalTax: true,
  stateTax: true,
  medicareTax: true,
  socialSecurityTax: true,
  otherTaxes: true,
  healthInsurance: true,
  retirement401k: true,
  otherDeductions: true,
  bonuses: true,
  netPay: true,
  status: true,
  notes: true,
});

export type InsertPayrollEntry = z.infer<typeof insertPayrollEntrySchema>;
export type PayrollEntry = typeof payrollEntries.$inferSelect;
