import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getAgents, processQuery } from "./api/agent";
import { z } from "zod";
import { insertEmployeeSchema, insertPayrollEntrySchema } from "@shared/schema";

// Helper function to validate requests
function validateRequest<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: error.errors 
        });
      }
      return res.status(500).json({ error: 'Internal server error during validation' });
    }
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Agent API endpoints - new implementation
  app.get('/api/agents', getAgents);
  app.post('/api/query', processQuery);
  
  // Keep old endpoints for backward compatibility
  app.get('/api/agent/available', getAgents);
  app.post('/api/agent/query', processQuery);

  // User API endpoints
  app.get('/api/user/:id', async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get user' });
    }
  });

  // Employee API endpoints
  app.get('/api/employees', async (_req: Request, res: Response) => {
    try {
      const employees = await storage.getEmployees();
      res.status(200).json(employees);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get employees' });
    }
  });

  app.get('/api/employees/:id', async (req: Request, res: Response) => {
    try {
      const employee = await storage.getEmployee(parseInt(req.params.id));
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.status(200).json(employee);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get employee' });
    }
  });

  app.post('/api/employees', validateRequest(insertEmployeeSchema), async (req: Request, res: Response) => {
    try {
      const employee = await storage.createEmployee(req.body);
      res.status(201).json(employee);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create employee' });
    }
  });

  app.put('/api/employees/:id', async (req: Request, res: Response) => {
    try {
      const updatedEmployee = await storage.updateEmployee(parseInt(req.params.id), req.body);
      if (!updatedEmployee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.status(200).json(updatedEmployee);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update employee' });
    }
  });

  app.delete('/api/employees/:id', async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteEmployee(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete employee' });
    }
  });

  // Payroll API endpoints
  app.get('/api/payroll', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const entries = await storage.getPayrollEntries(limit, offset);
      res.status(200).json(entries);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get payroll entries' });
    }
  });
  
  app.get('/api/payroll/statistics', async (_req: Request, res: Response) => {
    try {
      const stats = await storage.getPayrollStatistics();
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get payroll statistics' });
    }
  });

  app.get('/api/payroll/:id', async (req: Request, res: Response) => {
    try {
      const entry = await storage.getPayrollEntry(parseInt(req.params.id));
      if (!entry) {
        return res.status(404).json({ error: 'Payroll entry not found' });
      }
      res.status(200).json(entry);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get payroll entry' });
    }
  });
  
  app.get('/api/payroll/employee/:employeeId', async (req: Request, res: Response) => {
    try {
      const entries = await storage.getPayrollEntriesByEmployeeId(req.params.employeeId);
      res.status(200).json(entries);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get payroll entries for employee' });
    }
  });

  app.post('/api/payroll', validateRequest(insertPayrollEntrySchema), async (req: Request, res: Response) => {
    try {
      const entry = await storage.createPayrollEntry(req.body);
      res.status(201).json(entry);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create payroll entry' });
    }
  });

  app.put('/api/payroll/:id', async (req: Request, res: Response) => {
    try {
      const updatedEntry = await storage.updatePayrollEntry(parseInt(req.params.id), req.body);
      if (!updatedEntry) {
        return res.status(404).json({ error: 'Payroll entry not found' });
      }
      res.status(200).json(updatedEntry);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update payroll entry' });
    }
  });

  app.delete('/api/payroll/:id', async (req: Request, res: Response) => {
    try {
      const success = await storage.deletePayrollEntry(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: 'Payroll entry not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete payroll entry' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
