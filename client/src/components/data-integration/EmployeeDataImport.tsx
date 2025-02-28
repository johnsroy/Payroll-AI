import { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '@/components/ui/alert';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  Check, 
  X, 
  Info, 
  RefreshCw,
  Trash,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle
} from 'lucide-react';

// Define the types for our data
interface EmployeeData {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  salary: string;
  startDate: string;
  status: string;
  [key: string]: any; // For dynamic fields
}

type ImportStatus = 'idle' | 'validating' | 'processing' | 'completed' | 'error';

interface ImportJob {
  id: string;
  fileName: string;
  originalName?: string;
  recordCount: number;
  importedCount: number;
  status: ImportStatus;
  errorCount: number;
  warnings: number;
  timestamp: string;
  dataSource?: string;
  errors?: Array<{line: number, message: string}>;
}

interface ImportPreview {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

export default function EmployeeDataImport() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [headerMapping, setHeaderMapping] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('import');
  
  // Fields we want to map from the CSV
  const desiredFields = [
    { key: 'firstName', label: 'First Name', required: true },
    { key: 'lastName', label: 'Last Name', required: true },
    { key: 'email', label: 'Email', required: true },
    { key: 'department', label: 'Department', required: false },
    { key: 'position', label: 'Position/Title', required: false },
    { key: 'salary', label: 'Salary', required: false },
    { key: 'startDate', label: 'Start Date', required: false },
    { key: 'status', label: 'Status', required: false }
  ];
  
  // Query to get the import jobs
  const { data: importJobs, isLoading: jobsLoading, refetch: refetchJobs } = useQuery({
    queryKey: ['/api/employee-data/jobs'],
    queryFn: async () => {
      return apiRequest<ImportJob[]>('/api/employee-data/jobs');
    }
  });
  
  // Query to get details of a specific job
  const { data: jobDetails, isLoading: jobDetailsLoading, refetch: refetchJobDetails } = useQuery({
    queryKey: ['/api/employee-data/jobs', currentJobId],
    queryFn: async () => {
      if (!currentJobId) return null;
      return apiRequest<ImportJob>(`/api/employee-data/jobs/${currentJobId}`);
    },
    enabled: !!currentJobId
  });
  
  // Mutation to upload a file
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      return apiRequest('/api/employee-data/upload', {
        method: 'POST',
        body: formData,
        headers: {
          // Do not set Content-Type here, the browser will set it with the correct boundary
        }
      });
    },
    onSuccess: (data) => {
      setCurrentJobId(data.job.id);
      setImportPreview(data.preview);
      toast({
        title: 'File uploaded successfully',
        description: `${data.preview.totalRows} records found in the file.`,
        variant: 'default',
      });
      
      // Initialize header mapping
      const newMapping: Record<string, string> = {};
      data.preview.headers.forEach((header: string) => {
        // Try to match headers automatically
        const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Map common variations
        if (normalizedHeader.includes('first') || normalizedHeader.includes('fname')) {
          newMapping[header] = 'firstName';
        } else if (normalizedHeader.includes('last') || normalizedHeader.includes('lname')) {
          newMapping[header] = 'lastName';
        } else if (normalizedHeader.includes('email')) {
          newMapping[header] = 'email';
        } else if (normalizedHeader.includes('dept') || normalizedHeader.includes('department')) {
          newMapping[header] = 'department';
        } else if (normalizedHeader.includes('position') || normalizedHeader.includes('title') || normalizedHeader.includes('job')) {
          newMapping[header] = 'position';
        } else if (normalizedHeader.includes('salary') || normalizedHeader.includes('wage') || normalizedHeader.includes('pay')) {
          newMapping[header] = 'salary';
        } else if (normalizedHeader.includes('start') || normalizedHeader.includes('hire')) {
          newMapping[header] = 'startDate';
        } else if (normalizedHeader.includes('status')) {
          newMapping[header] = 'status';
        }
      });
      
      setHeaderMapping(newMapping);
      refetchJobs();
    },
    onError: (error: any) => {
      toast({
        title: 'Error uploading file',
        description: error.message || 'Failed to upload the file. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Mutation to import the data
  const importMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return apiRequest(`/api/employee-data/import/${jobId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ headerMapping }),
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Import completed',
        description: `${data.importedCount} records imported, ${data.errorCount} errors.`,
        variant: 'default',
      });
      setCurrentJobId(null);
      setImportPreview(null);
      setHeaderMapping({});
      setSelectedFile(null);
      refetchJobs();
      setActiveTab('history');
    },
    onError: (error: any) => {
      toast({
        title: 'Error importing data',
        description: error.message || 'Failed to import the data. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Mutation to delete a job
  const deleteMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return apiRequest(`/api/employee-data/jobs/${jobId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Job deleted',
        description: 'The import job has been deleted.',
        variant: 'default',
      });
      refetchJobs();
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting job',
        description: error.message || 'Failed to delete the job. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      handleUpload(files[0]);
    }
  };
  
  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleUpload = (file: File) => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file to upload.',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate file type
    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file type',
        description: 'Only CSV files are supported.',
        variant: 'destructive',
      });
      return;
    }
    
    uploadMutation.mutate(file);
  };
  
  const handleImport = () => {
    if (!currentJobId) {
      toast({
        title: 'No data to import',
        description: 'Please upload a file first.',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate that required fields are mapped
    const requiredFields = desiredFields.filter(field => field.required).map(field => field.key);
    const mappedFields = Object.values(headerMapping);
    
    const missingFields = requiredFields.filter(field => !mappedFields.includes(field));
    
    if (missingFields.length > 0) {
      toast({
        title: 'Missing required fields',
        description: `Please map the following required fields: ${missingFields.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }
    
    importMutation.mutate(currentJobId);
  };
  
  const handleDelete = (jobId: string) => {
    deleteMutation.mutate(jobId);
  };
  
  const handleMapChange = (csvHeader: string, fieldKey: string) => {
    setHeaderMapping(prev => ({
      ...prev,
      [csvHeader]: fieldKey
    }));
  };
  
  // Helper to get status badge
  const getStatusBadge = (status: ImportStatus) => {
    switch (status) {
      case 'validating':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Validating</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Completed</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Helper to get status icon
  const getStatusIcon = (status: ImportStatus) => {
    switch (status) {
      case 'validating':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'processing':
        return <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employee Data Import</h1>
          <p className="text-muted-foreground">Import employee data from CSV files or other sources</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="history">Import History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="import" className="space-y-4">
          {/* File Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Employee Data</CardTitle>
              <CardDescription>
                Upload a CSV file containing employee data. The file should have headers in the first row.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-md">
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-center mb-4">
                  Drag & drop your CSV file here, or click to browse
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
                <Button onClick={handleFileSelect} disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? 'Uploading...' : 'Select File'}
                </Button>
                {selectedFile && (
                  <div className="mt-4 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="text-sm">{selectedFile.name}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">Supported Format</h3>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  <li>CSV file with headers in the first row</li>
                  <li>Required fields: First Name, Last Name, Email</li>
                  <li>Optional fields: Department, Position, Salary, Start Date, Status</li>
                  <li>Maximum file size: 10 MB</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          {/* Data Preview and Mapping */}
          {importPreview && (
            <Card>
              <CardHeader>
                <CardTitle>Data Preview & Field Mapping</CardTitle>
                <CardDescription>
                  Preview the first few rows and map the CSV columns to employee fields
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Field Mapping</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Map each column from your CSV file to the corresponding employee field.
                    <span className="text-red-500">*</span> indicates required fields.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {importPreview.headers.map((header) => (
                      <div key={header} className="space-y-2">
                        <Label htmlFor={`map-${header}`}>
                          CSV Column: <span className="font-medium">{header}</span>
                        </Label>
                        <Select 
                          value={headerMapping[header] || ''} 
                          onValueChange={(value) => handleMapChange(header, value)}
                        >
                          <SelectTrigger id={`map-${header}`}>
                            <SelectValue placeholder="Select field to map to" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Do not import</SelectItem>
                            {desiredFields.map((field) => (
                              <SelectItem key={field.key} value={field.key}>
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Data Preview</h3>
                  <div className="border rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {importPreview.headers.map((header) => (
                            <TableHead key={header}>
                              {header}
                              {headerMapping[header] && (
                                <Badge variant="outline" className="ml-1 text-xs">
                                  {desiredFields.find(f => f.key === headerMapping[header])?.label || headerMapping[header]}
                                </Badge>
                              )}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importPreview.rows.map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {importPreview.headers.map((header) => (
                              <TableCell key={`${rowIndex}-${header}`}>
                                {row[header]}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableCaption>
                        Showing {importPreview.rows.length} of {importPreview.totalRows} rows
                      </TableCaption>
                    </Table>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => {
                  setImportPreview(null);
                  setSelectedFile(null);
                  setCurrentJobId(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={importMutation.isPending}>
                  {importMutation.isPending ? 'Importing...' : 'Import Data'}
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Import History</CardTitle>
              <CardDescription>
                View past import jobs and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="text-center p-4">
                  <RefreshCw className="h-8 w-8 text-blue-500 mx-auto animate-spin" />
                  <p className="mt-2">Loading import history...</p>
                </div>
              ) : importJobs && importJobs.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Records</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importJobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-blue-500" />
                              <span>{job.originalName || job.fileName}</span>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(job.timestamp)}</TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <span className="flex items-center">
                                    {job.importedCount} / {job.recordCount}
                                    {job.errorCount > 0 && (
                                      <AlertTriangle className="h-4 w-4 text-yellow-500 ml-1" />
                                    )}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Imported: {job.importedCount}</p>
                                  <p>Total: {job.recordCount}</p>
                                  <p>Errors: {job.errorCount}</p>
                                  <p>Warnings: {job.warnings}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(job.status)}
                              {getStatusBadge(job.status)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Import Job Details</DialogTitle>
                                  <DialogDescription>
                                    Details for import job from {formatDate(job.timestamp)}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="text-sm font-medium">File Name</h4>
                                      <p className="text-sm">{job.originalName || job.fileName}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium">Import Date</h4>
                                      <p className="text-sm">{formatDate(job.timestamp)}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium">Status</h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        {getStatusIcon(job.status)}
                                        {getStatusBadge(job.status)}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium">Progress</h4>
                                      <div className="flex items-center gap-2">
                                        <Progress value={(job.importedCount / job.recordCount) * 100} className="mt-1" />
                                        <span className="text-sm">
                                          {Math.round((job.importedCount / job.recordCount) * 100)}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Import Summary</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                      <div className="flex flex-col items-center p-2 bg-green-50 rounded-md">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 mb-1" />
                                        <span className="text-xl font-bold">{job.importedCount}</span>
                                        <span className="text-xs text-muted-foreground">Imported</span>
                                      </div>
                                      <div className="flex flex-col items-center p-2 bg-red-50 rounded-md">
                                        <XCircle className="h-5 w-5 text-red-500 mb-1" />
                                        <span className="text-xl font-bold">{job.errorCount}</span>
                                        <span className="text-xs text-muted-foreground">Errors</span>
                                      </div>
                                      <div className="flex flex-col items-center p-2 bg-yellow-50 rounded-md">
                                        <AlertTriangle className="h-5 w-5 text-yellow-500 mb-1" />
                                        <span className="text-xl font-bold">{job.warnings}</span>
                                        <span className="text-xs text-muted-foreground">Warnings</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {job.errors && job.errors.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-medium mb-2">Errors</h4>
                                      <div className="max-h-40 overflow-y-auto border rounded-md p-2 bg-red-50">
                                        {job.errors.map((error, index) => (
                                          <div key={index} className="flex items-start gap-2 mb-1 text-sm">
                                            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                            <div>
                                              <span className="font-medium">Line {error.line}: </span>
                                              <span>{error.message}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <DialogFooter>
                                  <Button 
                                    variant="destructive" 
                                    onClick={() => handleDelete(job.id)}
                                    className="mr-auto"
                                  >
                                    <Trash className="h-4 w-4 mr-2" />
                                    Delete Job
                                  </Button>
                                  <Button variant="outline" onClick={() => {}}>Close</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(job.id)}
                            >
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center p-8 border rounded-md">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <h3 className="text-lg font-medium mb-1">No Import History</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You haven't imported any employee data yet. Upload a CSV file to get started.
                  </p>
                  <Button onClick={() => setActiveTab('import')}>Import Data</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}