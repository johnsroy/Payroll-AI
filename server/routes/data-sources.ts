import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { log } from '../vite';

// Extend Express Request to include session
declare global {
  namespace Express {
    interface Request {
      session: {
        userId?: string;
        [key: string]: any;
      }
    }
  }
}

// Create a router
const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads');
    
    // Create the uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    const fileName = `${uniqueId}${extension}`;
    cb(null, fileName);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function(req, file, cb) {
    // Only allow CSV files
    if (file.mimetype !== 'text/csv' && path.extname(file.originalname).toLowerCase() !== '.csv') {
      return cb(new Error('Only CSV files are allowed'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// In-memory storage for connected data sources
const dataSources: DataSource[] = [
  { 
    id: 'demo-csv', 
    name: 'Employee Data.csv', 
    type: 'csv', 
    status: 'connected',
    lastSynced: new Date().toISOString(),
    userId: 'demo-user'
  },
  { 
    id: 'demo-hr', 
    name: 'Workday Integration', 
    type: 'hr_system', 
    status: 'connected',
    lastSynced: new Date().toISOString(),
    userId: 'demo-user',
    config: { system: 'workday', apiKey: '***' }
  }
];

// Define data source type
interface DataSource {
  id: string;
  name: string;
  type: 'csv' | 'api' | 'database' | 'hr_system';
  status: 'connected' | 'disconnected' | 'pending';
  lastSynced?: string;
  userId: string;
  config?: any;
  filePath?: string;
}

// Helper function to parse CSV headers
function parseCsvHeaders(filePath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Split the first line by comma to get headers
      const lines = data.split('\n');
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(header => header.trim());
        resolve(headers);
      } else {
        reject(new Error('CSV file is empty'));
      }
    });
  });
}

// GET /api/data-sources - Get all data sources for the current user
router.get('/', (req: Request, res: Response) => {
  try {
    // In a real application, you would get the user ID from the session
    const userId = req.session?.userId || 'demo-user';
    
    // Filter data sources for the current user
    const userDataSources = dataSources.filter(source => source.userId === userId);
    
    // Return the data sources without sensitive info
    const sanitizedDataSources = userDataSources.map(({ filePath, ...source }) => source);
    
    res.json(sanitizedDataSources);
  } catch (error) {
    log(`Error fetching data sources: ${error instanceof Error ? error.message : String(error)}`, 'data-sources');
    res.status(500).json({ error: 'Failed to fetch data sources' });
  }
});

// POST /api/data-sources/upload - Upload a CSV file
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // In a real application, you would get the user ID from the session
    const userId = req.session?.userId || 'demo-user';
    
    // Get file information
    const originalName = req.file.originalname;
    const filePath = req.file.path;
    
    // Parse CSV headers
    const headers = await parseCsvHeaders(filePath);
    
    // Create a new data source
    const newDataSource: DataSource = {
      id: uuidv4(),
      name: originalName,
      type: 'csv',
      status: 'connected',
      lastSynced: new Date().toISOString(),
      userId,
      filePath,
      config: {
        headers,
        rowCount: 0, // This would be calculated in a real application
        fileSize: req.file.size
      }
    };
    
    // Add to data sources
    dataSources.push(newDataSource);
    
    // Return the data source without the file path
    const { filePath: _, ...sanitizedDataSource } = newDataSource;
    
    res.status(201).json(sanitizedDataSource);
  } catch (error) {
    log(`Error uploading file: ${error instanceof Error ? error.message : String(error)}`, 'data-sources');
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// POST /api/data-sources/hr-system - Connect to HR system
router.post('/hr-system', (req: Request, res: Response) => {
  try {
    // Get parameters from the request body
    const { system, apiKey, apiSecret, apiUrl } = req.body;
    
    if (!system || !apiKey) {
      return res.status(400).json({ error: 'System name and API key are required' });
    }
    
    // In a real application, you would get the user ID from the session
    const userId = req.session?.userId || 'demo-user';
    
    // Create a new data source
    const newDataSource: DataSource = {
      id: uuidv4(),
      name: `${system.charAt(0).toUpperCase() + system.slice(1)} Integration`,
      type: 'hr_system',
      status: 'connected',
      lastSynced: new Date().toISOString(),
      userId,
      config: {
        system,
        apiKey: '***', // We don't store the actual API key in the response
        apiSecret: apiSecret ? '***' : undefined,
        apiUrl
      }
    };
    
    // Add to data sources
    dataSources.push(newDataSource);
    
    res.status(201).json(newDataSource);
  } catch (error) {
    log(`Error connecting to HR system: ${error instanceof Error ? error.message : String(error)}`, 'data-sources');
    res.status(500).json({ error: 'Failed to connect to HR system' });
  }
});

// POST /api/data-sources/database - Connect to database
router.post('/database', (req: Request, res: Response) => {
  try {
    // Get parameters from the request body
    const { type, host, port, database, username, password } = req.body;
    
    if (!type || !host || !port || !database || !username || !password) {
      return res.status(400).json({ error: 'All database connection fields are required' });
    }
    
    // In a real application, you would get the user ID from the session
    const userId = req.session?.userId || 'demo-user';
    
    // Create a new data source
    const newDataSource: DataSource = {
      id: uuidv4(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} - ${database}`,
      type: 'database',
      status: 'connected',
      lastSynced: new Date().toISOString(),
      userId,
      config: {
        type,
        host,
        port,
        database,
        username,
        password: '********' // We don't store the actual password in the response
      }
    };
    
    // Add to data sources
    dataSources.push(newDataSource);
    
    res.status(201).json(newDataSource);
  } catch (error) {
    log(`Error connecting to database: ${error instanceof Error ? error.message : String(error)}`, 'data-sources');
    res.status(500).json({ error: 'Failed to connect to database' });
  }
});

// POST /api/data-sources/api - Connect to API
router.post('/api', (req: Request, res: Response) => {
  try {
    // Get parameters from the request body
    const { url, key, secret, type } = req.body;
    
    if (!url || !key) {
      return res.status(400).json({ error: 'API URL and key are required' });
    }
    
    // In a real application, you would get the user ID from the session
    const userId = req.session?.userId || 'demo-user';
    
    // Try to extract hostname from URL
    let hostname = url;
    try {
      const urlObj = new URL(url);
      hostname = urlObj.hostname;
    } catch (err) {
      // Use the URL as is if it's not a valid URL
    }
    
    // Create a new data source
    const newDataSource: DataSource = {
      id: uuidv4(),
      name: `API Integration - ${hostname}`,
      type: 'api',
      status: 'connected',
      lastSynced: new Date().toISOString(),
      userId,
      config: {
        url,
        key: '********', // We don't store the actual API key in the response
        secret: secret ? '********' : undefined,
        type
      }
    };
    
    // Add to data sources
    dataSources.push(newDataSource);
    
    res.status(201).json(newDataSource);
  } catch (error) {
    log(`Error connecting to API: ${error instanceof Error ? error.message : String(error)}`, 'data-sources');
    res.status(500).json({ error: 'Failed to connect to API' });
  }
});

// DELETE /api/data-sources/:id - Disconnect a data source
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // In a real application, you would get the user ID from the session
    const userId = req.session?.userId || 'demo-user';
    
    // Find the data source
    const dataSourceIndex = dataSources.findIndex(source => source.id === id && source.userId === userId);
    
    if (dataSourceIndex === -1) {
      return res.status(404).json({ error: 'Data source not found' });
    }
    
    // Get the data source
    const dataSource = dataSources[dataSourceIndex];
    
    // If it's a file, remove it
    if (dataSource.type === 'csv' && dataSource.filePath) {
      try {
        fs.unlinkSync(dataSource.filePath);
      } catch (err) {
        log(`Error deleting file: ${err instanceof Error ? err.message : String(err)}`, 'data-sources');
        // Continue even if file deletion fails
      }
    }
    
    // Remove from data sources
    dataSources.splice(dataSourceIndex, 1);
    
    res.status(200).json({ message: 'Data source disconnected successfully' });
  } catch (error) {
    log(`Error disconnecting data source: ${error instanceof Error ? error.message : String(error)}`, 'data-sources');
    res.status(500).json({ error: 'Failed to disconnect data source' });
  }
});

export default router;