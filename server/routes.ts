import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getAgents, processQuery } from "./api/agent";
import { getAvailableAgents, processAgentQuery, processMultiAgentQuery } from "./api/agent-brain";
import { Pool } from '@neondatabase/serverless';

// Create PostgreSQL pool for Supabase database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Agent API endpoints - new implementation
  app.get('/api/agents', getAgents);
  app.post('/api/query', processQuery);
  
  // Multi-agent API endpoints
  app.get('/api/brain/agents', getAvailableAgents);
  app.post('/api/brain/query/single', processAgentQuery);
  app.post('/api/brain/query/multi', processMultiAgentQuery);
  
  // Keep old endpoints for backward compatibility
  app.get('/api/agent/available', getAgents);
  app.post('/api/agent/query', processQuery);

  // Payroll API Endpoints
  app.get('/api/payroll/entries', async (_req: Request, res: Response) => {
    try {
      const result = await pool.query('SELECT * FROM payroll_entries_new ORDER BY pay_period_start DESC, employee_name');
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching payroll entries:', error);
      res.status(500).json({ error: 'Failed to fetch payroll entries' });
    }
  });

  app.get('/api/payroll/entries/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM payroll_entries_new WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Payroll entry not found' });
      }
      
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching payroll entry:', error);
      res.status(500).json({ error: 'Failed to fetch payroll entry' });
    }
  });

  app.post('/api/payroll/entries', async (req: Request, res: Response) => {
    try {
      const { 
        employee_id, 
        employee_name, 
        pay_period_start, 
        pay_period_end, 
        regular_hours, 
        overtime_hours, 
        deductions, 
        bonuses, 
        taxes, 
        net_pay, 
        comments 
      } = req.body;

      // Validate required fields
      if (!employee_id || !employee_name || !pay_period_start || !pay_period_end) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await pool.query(
        `INSERT INTO payroll_entries_new 
        (employee_id, employee_name, pay_period_start, pay_period_end, regular_hours, overtime_hours, deductions, bonuses, taxes, net_pay, comments) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING *`,
        [employee_id, employee_name, pay_period_start, pay_period_end, regular_hours, overtime_hours, deductions, bonuses, taxes, net_pay, comments]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating payroll entry:', error);
      res.status(500).json({ error: 'Failed to create payroll entry' });
    }
  });

  app.put('/api/payroll/entries/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { 
        employee_id, 
        employee_name, 
        pay_period_start, 
        pay_period_end, 
        regular_hours, 
        overtime_hours, 
        deductions, 
        bonuses, 
        taxes, 
        net_pay, 
        comments 
      } = req.body;

      // Validate required fields
      if (!employee_id || !employee_name || !pay_period_start || !pay_period_end) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await pool.query(
        `UPDATE payroll_entries_new 
        SET employee_id = $1, employee_name = $2, pay_period_start = $3, pay_period_end = $4,
            regular_hours = $5, overtime_hours = $6, deductions = $7, bonuses = $8, taxes = $9,
            net_pay = $10, comments = $11, updated_at = NOW()
        WHERE id = $12
        RETURNING *`,
        [employee_id, employee_name, pay_period_start, pay_period_end, regular_hours, overtime_hours, 
         deductions, bonuses, taxes, net_pay, comments, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Payroll entry not found' });
      }

      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating payroll entry:', error);
      res.status(500).json({ error: 'Failed to update payroll entry' });
    }
  });

  app.delete('/api/payroll/entries/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await pool.query('DELETE FROM payroll_entries_new WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Payroll entry not found' });
      }
      
      res.status(200).json({ message: 'Payroll entry deleted successfully' });
    } catch (error) {
      console.error('Error deleting payroll entry:', error);
      res.status(500).json({ error: 'Failed to delete payroll entry' });
    }
  });

  // Example endpoint for user management
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

  const httpServer = createServer(app);

  return httpServer;
}
