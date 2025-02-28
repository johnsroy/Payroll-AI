import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { log } from '../vite';

// Create a router
const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads', 'employees');
    
    // Create the uploads/employees directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    const fileName = `employee_data_${uniqueId}${extension}`;
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

// Define employee data types
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  salary: string;
  startDate: string;
  status: string;
  [key: string]: any;
}

interface ImportJob {
  id: string;
  fileName: string;
  originalName: string;
  recordCount: number;
  importedCount: number;
  status: 'validating' | 'processing' | 'completed' | 'error';
  errorCount: number;
  warnings: number;
  timestamp: string;
  userId: string;
  filePath: string;
  dataSource: string;
  errors?: Array<{line: number, message: string}>;
}

// In-memory storage for import jobs and employees
const importJobs: ImportJob[] = [
  {
    id: 'demo-job-1',
    fileName: 'employees_feb_2025.csv',
    originalName: 'employees_feb_2025.csv',
    recordCount: 245,
    importedCount: 245,
    status: 'completed',
    errorCount: 0,
    warnings: 3,
    timestamp: new Date().toISOString(),
    userId: 'demo-user',
    filePath: '',
    dataSource: 'CSV Upload'
  },
  {
    id: 'demo-job-2',
    fileName: 'new_hires_q1.csv',
    originalName: 'new_hires_q1.csv',
    recordCount: 32,
    importedCount: 29,
    status: 'completed',
    errorCount: 3,
    warnings: 5,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-user',
    filePath: '',
    dataSource: 'CSV Upload'
  }
];

const employees: Employee[] = [
  {
    id: 'emp-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    department: 'Engineering',
    position: 'Senior Developer',
    salary: '120000',
    startDate: '2022-03-15',
    status: 'Active'
  },
  {
    id: 'emp-2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    department: 'Marketing',
    position: 'Marketing Manager',
    salary: '95000',
    startDate: '2023-01-10',
    status: 'Active'
  }
];

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

// Helper function to parse CSV content
function parseCsvContent(filePath: string): Promise<{headers: string[], rows: string[][]}> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Split by newlines
      const lines = data.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length === 0) {
        reject(new Error('CSV file is empty'));
        return;
      }
      
      // Parse headers
      const headers = lines[0].split(',').map(header => header.trim());
      
      // Parse rows
      const rows: string[][] = [];
      for (let i = 1; i < lines.length; i++) {
        // Simple CSV parsing (doesn't handle quoted commas properly)
        rows.push(lines[i].split(',').map(cell => cell.trim()));
      }
      
      resolve({ headers, rows });
    });
  });
}

// GET /api/employee-data/jobs - Get all import jobs
router.get('/jobs', (req: Request, res: Response) => {
  try {
    // In a real application, you would get the user ID from the session
    const userId = req.session?.userId || 'demo-user';
    
    // Filter jobs for the current user
    const userJobs = importJobs
      .filter(job => job.userId === userId)
      .map(({ filePath, ...job }) => job); // Remove filePath from response
    
    res.json(userJobs);
  } catch (error) {
    log(`Error fetching import jobs: ${error instanceof Error ? error.message : String(error)}`, 'employee-data');
    res.status(500).json({ error: 'Failed to fetch import jobs' });
  }
});

// GET /api/employee-data/employees - Get all employees
router.get('/employees', (req: Request, res: Response) => {
  try {
    // In a real application, you would get the user ID from the session and filter employees
    res.json(employees);
  } catch (error) {
    log(`Error fetching employees: ${error instanceof Error ? error.message : String(error)}`, 'employee-data');
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// POST /api/employee-data/upload - Upload employee data
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
    
    // Parse CSV for preview
    const { headers, rows } = await parseCsvContent(filePath);
    
    // Create a new import job
    const newJob: ImportJob = {
      id: uuidv4(),
      fileName: path.basename(filePath),
      originalName,
      recordCount: rows.length,
      importedCount: 0,
      status: 'validating',
      errorCount: 0,
      warnings: 0,
      timestamp: new Date().toISOString(),
      userId,
      filePath,
      dataSource: 'CSV Upload'
    };
    
    // Add to import jobs
    importJobs.push(newJob);
    
    // Return the preview data and job info
    const { filePath: _, ...jobInfo } = newJob;
    
    // Generate preview data (first 5 rows)
    const previewRows = rows.slice(0, 5).map(row => {
      const previewRow: Record<string, string> = {};
      headers.forEach((header, index) => {
        if (row[index]) {
          previewRow[header] = row[index];
        } else {
          previewRow[header] = '';
        }
      });
      return previewRow;
    });
    
    res.status(201).json({
      job: jobInfo,
      preview: {
        headers,
        rows: previewRows,
        totalRows: rows.length
      }
    });
  } catch (error) {
    log(`Error uploading employee data: ${error instanceof Error ? error.message : String(error)}`, 'employee-data');
    res.status(500).json({ error: 'Failed to upload employee data file' });
  }
});

// POST /api/employee-data/import/:jobId - Process import job
router.post('/import/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const { headerMapping } = req.body;
    
    if (!headerMapping) {
      return res.status(400).json({ error: 'Header mapping is required' });
    }
    
    // In a real application, you would get the user ID from the session
    const userId = req.session?.userId || 'demo-user';
    
    // Find the job
    const jobIndex = importJobs.findIndex(job => job.id === jobId && job.userId === userId);
    
    if (jobIndex === -1) {
      return res.status(404).json({ error: 'Import job not found' });
    }
    
    const job = importJobs[jobIndex];
    
    // Update job status
    job.status = 'processing';
    importJobs[jobIndex] = job;
    
    // In a real application, you would process this asynchronously
    // For demo purposes, we'll do it synchronously
    
    try {
      // Parse the CSV file
      const { headers, rows } = await parseCsvContent(job.filePath);
      
      // Map the data and validate
      const mappedData: Employee[] = [];
      const errors: Array<{line: number, message: string}> = [];
      const requiredFields = ['firstName', 'lastName', 'email'];
      
      rows.forEach((row, rowIndex) => {
        const employee: Partial<Employee> = { id: uuidv4() };
        let hasErrors = false;
        
        // Map fields based on header mapping
        headers.forEach((header, colIndex) => {
          const mappedField = headerMapping[header];
          
          if (mappedField && row[colIndex]) {
            employee[mappedField] = row[colIndex];
          }
        });
        
        // Validate required fields
        for (const field of requiredFields) {
          if (!employee[field]) {
            errors.push({
              line: rowIndex + 2, // +2 because row 0 is header and we're 0-indexed
              message: `Missing required field: ${field}`
            });
            hasErrors = true;
          }
        }
        
        // Validate email format
        if (employee.email && !employee.email.includes('@')) {
          errors.push({
            line: rowIndex + 2,
            message: `Invalid email format: ${employee.email}`
          });
          hasErrors = true;
        }
        
        if (!hasErrors) {
          mappedData.push(employee as Employee);
        }
      });
      
      // Update job status
      job.importedCount = mappedData.length;
      job.errorCount = errors.length;
      job.status = errors.length === rows.length ? 'error' : 'completed';
      job.errors = errors;
      
      // Add imported employees to the employee list
      employees.push(...mappedData);
      
      // Return job status
      const { filePath: _, ...jobInfo } = job;
      res.status(200).json(jobInfo);
    } catch (error) {
      // Update job status in case of error
      job.status = 'error';
      job.errorCount = job.recordCount;
      importJobs[jobIndex] = job;
      
      throw error;
    }
  } catch (error) {
    log(`Error processing import job: ${error instanceof Error ? error.message : String(error)}`, 'employee-data');
    res.status(500).json({ error: 'Failed to process import job' });
  }
});

// GET /api/employee-data/jobs/:jobId - Get job details
router.get('/jobs/:jobId', (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    
    // In a real application, you would get the user ID from the session
    const userId = req.session?.userId || 'demo-user';
    
    // Find the job
    const job = importJobs.find(job => job.id === jobId && job.userId === userId);
    
    if (!job) {
      return res.status(404).json({ error: 'Import job not found' });
    }
    
    // Remove filePath from response
    const { filePath, ...jobInfo } = job;
    
    res.json(jobInfo);
  } catch (error) {
    log(`Error fetching job details: ${error instanceof Error ? error.message : String(error)}`, 'employee-data');
    res.status(500).json({ error: 'Failed to fetch job details' });
  }
});

// DELETE /api/employee-data/jobs/:jobId - Delete import job
router.delete('/jobs/:jobId', (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    
    // In a real application, you would get the user ID from the session
    const userId = req.session?.userId || 'demo-user';
    
    // Find the job
    const jobIndex = importJobs.findIndex(job => job.id === jobId && job.userId === userId);
    
    if (jobIndex === -1) {
      return res.status(404).json({ error: 'Import job not found' });
    }
    
    const job = importJobs[jobIndex];
    
    // Delete the file if it exists
    if (job.filePath && fs.existsSync(job.filePath)) {
      fs.unlinkSync(job.filePath);
    }
    
    // Remove from import jobs
    importJobs.splice(jobIndex, 1);
    
    res.status(200).json({ message: 'Import job deleted successfully' });
  } catch (error) {
    log(`Error deleting import job: ${error instanceof Error ? error.message : String(error)}`, 'employee-data');
    res.status(500).json({ error: 'Failed to delete import job' });
  }
});

export default router;