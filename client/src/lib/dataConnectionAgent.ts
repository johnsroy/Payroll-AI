/**
 * Data source type definitions
 */
export type DataSourceType = 'google_drive' | 'dropbox' | 'onedrive' | 'local' | 'zapier';

/**
 * Data source connection status
 */
export type ConnectionStatus = 'connected' | 'disconnected' | 'pending' | 'error';

/**
 * Data source definition
 */
export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  status: ConnectionStatus;
  lastSynced?: Date;
  metadata: Record<string, any>;
  user_id?: string;
  company_id?: string;
}

/**
 * File definition from data sources
 */
export interface RemoteFile {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: Date;
  path: string;
  sourceId: string;
  url?: string;
  thumbnailUrl?: string;
  content?: string;
}

/**
 * Mock functions for data connection in demonstration mode
 */

/**
 * Get a list of available data sources
 */
export function getDataSources(): DataSource[] {
  return [
    {
      id: "google-drive-001",
      name: "Google Drive",
      type: "google_drive",
      status: "connected",
      lastSynced: new Date(Date.now() - 2 * 86400000), // 2 days ago
      metadata: {
        email: "user@example.com",
        totalFiles: 47
      }
    },
    {
      id: "dropbox-001",
      name: "Dropbox",
      type: "dropbox",
      status: "pending",
      metadata: {
        authUrl: "https://dropbox.com/authorize"
      }
    },
    {
      id: "local-files-001",
      name: "Local Files",
      type: "local",
      status: "connected",
      lastSynced: new Date(Date.now() - 1 * 3600000), // 1 hour ago
      metadata: {
        totalFiles: 5
      }
    },
    {
      id: "onedrive-001",
      name: "OneDrive",
      type: "onedrive",
      status: "error",
      metadata: {
        errorMessage: "Authentication failed"
      }
    }
  ];
}

/**
 * Get files from a data source
 */
export function getFilesFromSource(sourceId: string): RemoteFile[] {
  // Mock file data
  const mockFiles: Record<string, RemoteFile[]> = {
    "google-drive-001": [
      {
        id: "gdrive-file-001",
        name: "Payroll_2023_Q4.xlsx",
        type: "xlsx",
        size: 2456789,
        lastModified: new Date(Date.now() - 7 * 86400000), // 7 days ago
        path: "/",
        sourceId: "google-drive-001",
        content: "Employee ID,Name,Department,Salary,Tax Withholding,Benefits\n1001,John Smith,Engineering,95000,28500,12350\n1002,Sarah Johnson,Marketing,85000,25500,11050\n1003,Michael Davis,Finance,105000,31500,13650\n1004,Emily Wilson,HR,78000,23400,10140\n1005,James Brown,Engineering,98000,29400,12740"
      },
      {
        id: "gdrive-file-002",
        name: "Employee_Data.csv",
        type: "csv",
        size: 987654,
        lastModified: new Date(Date.now() - 14 * 86400000), // 14 days ago
        path: "/",
        sourceId: "google-drive-001",
        content: "ID,Name,Position,Department,Location,Hire Date,Status\n1001,John Smith,Senior Developer,Engineering,New York,2019-05-15,Full-time\n1002,Sarah Johnson,Marketing Manager,Marketing,Chicago,2020-02-10,Full-time\n1003,Michael Davis,Financial Analyst,Finance,Boston,2018-11-01,Full-time\n1004,Emily Wilson,HR Specialist,HR,Denver,2021-03-22,Full-time\n1005,James Brown,Lead Engineer,Engineering,Seattle,2017-07-14,Full-time"
      }
    ],
    "local-files-001": [
      {
        id: "local-file-001",
        name: "Tax_Reports_2023.pdf",
        type: "pdf",
        size: 3456789,
        lastModified: new Date(Date.now() - 30 * 86400000), // 30 days ago
        path: "/",
        sourceId: "local-files-001",
        content: "[PDF Content - Tax Reports for 2023]"
      },
      {
        id: "local-file-002",
        name: "Expense_Report_Jan2024.xlsx",
        type: "xlsx",
        size: 1234567,
        lastModified: new Date(Date.now() - 5 * 86400000), // 5 days ago
        path: "/",
        sourceId: "local-files-001",
        content: "Date,Employee,Category,Amount,Description,Approved\n2024-01-05,John Smith,Travel,450.25,Flight to Chicago conference,Yes\n2024-01-12,Sarah Johnson,Meals,65.80,Client dinner,Yes\n2024-01-15,Michael Davis,Office Supplies,125.34,New monitor,Yes\n2024-01-22,Emily Wilson,Training,350.00,HR certification course,Yes\n2024-01-28,James Brown,Software,89.99,Monthly subscription,Yes"
      },
      {
        id: "local-file-003",
        name: "Benefits_Summary.pdf",
        type: "pdf",
        size: 2345678,
        lastModified: new Date(Date.now() - 20 * 86400000), // 20 days ago
        path: "/",
        sourceId: "local-files-001",
        content: "[PDF Content - Benefits Summary]"
      }
    ]
  };
  
  return mockFiles[sourceId] || [];
}

/**
 * Connect to a new data source
 */
export function connectDataSource(type: DataSourceType, name: string): DataSource {
  const newSource: DataSource = {
    id: `connected-${Date.now()}`,
    name: name,
    type: type,
    status: 'connected',
    lastSynced: new Date(),
    metadata: {
      email: 'user@example.com',
      totalFiles: Math.floor(Math.random() * 20) + 5 // Random number of files
    }
  };
  
  return newSource;
}

/**
 * Format a file size in a human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }
}