import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  processAgentQuery, 
  getAvailableAgents,
  processMultiAgentQuery
} from "./api/agent-brain";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Agent API endpoints
  app.post('/api/agent/query', processAgentQuery);
  app.get('/api/agent/available', getAvailableAgents);
  app.post('/api/agent/multi-query', processMultiAgentQuery);

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
