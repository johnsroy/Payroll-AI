import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Upload, 
  Database, 
  Share2, 
  CheckCircle2, 
  Info, 
  AlertCircle,
  XCircle
} from "lucide-react";
import { apiRequest } from '@/lib/queryClient';

// Define types for data sources
interface DataSource {
  id: string;
  name: string;
  type: 'csv' | 'api' | 'database' | 'hr_system';
  status: 'connected' | 'disconnected' | 'pending';
  lastSynced?: string;
  config?: any;
}

// Placeholder HR systems for integration
const HR_SYSTEMS = [
  { id: 'workday', name: 'Workday', icon: '🏢' },
  { id: 'adp', name: 'ADP', icon: '📊' },
  { id: 'bamboo', name: 'BambooHR', icon: '🎋' },
  { id: 'gusto', name: 'Gusto', icon: '💰' },
  { id: 'zenefits', name: 'Zenefits', icon: '📋' },
  { id: 'paychex', name: 'Paychex', icon: '💵' },
  { id: 'other', name: 'Other System', icon: '🔄' },
];

// Database connection types
const DATABASE_TYPES = [
  { id: 'postgresql', name: 'PostgreSQL', icon: '🐘' },
  { id: 'mysql', name: 'MySQL', icon: '🐬' },
  { id: 'oracle', name: 'Oracle', icon: '☁️' },
  { id: 'sqlserver', name: 'SQL Server', icon: '🔷' },
  { id: 'other_db', name: 'Other Database', icon: '💾' },
];

// Data source connection component
export default function DataSourceConnection() {
  const [activeTab, setActiveTab] = useState('file-upload');
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states for different connection methods
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [hrSystem, setHRSystem] = useState<string>('');
  const [databaseConfig, setDatabaseConfig] = useState({
    type: '',
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
  });
  const [apiConfig, setApiConfig] = useState({
    url: '',
    key: '',
    secret: '',
    type: 'other',
  });

  // Load existing data sources on component mount
  React.useEffect(() => {
    loadDataSources();
  }, []);

  // Load existing data sources from the server
  const loadDataSources = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<DataSource[]>('GET', '/api/data-sources');
      setDataSources(response || []);
      setError(null);
    } catch (err) {
      console.error('Error loading data sources:', err);
      setError('Failed to load existing data sources.');
      // For demo, add sample data sources
      setDataSources([
        { 
          id: 'csv1', 
          name: 'Employee Data.csv', 
          type: 'csv', 
          status: 'connected',
          lastSynced: '2025-02-27T15:30:00Z'
        },
        { 
          id: 'demo-hr', 
          name: 'Workday HR Integration', 
          type: 'hr_system', 
          status: 'connected',
          lastSynced: '2025-02-28T09:15:00Z',
          config: { system: 'workday', apiKey: '***' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!fileUpload) {
      setError('Please select a file to upload.');
      return;
    }

    try {
      setLoading(true);
      // Create form data
      const formData = new FormData();
      formData.append('file', fileUpload);
      
      // In a real implementation, you would send this to your server
      // For demo, we'll simulate a successful upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful response
      const newDataSource: DataSource = {
        id: `csv-${Date.now()}`,
        name: fileUpload.name,
        type: 'csv',
        status: 'connected',
        lastSynced: new Date().toISOString()
      };
      
      setDataSources([...dataSources, newDataSource]);
      setSuccess(`File "${fileUpload.name}" uploaded successfully!`);
      setFileUpload(null);
      setError(null);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Connect to HR system
  const connectHRSystem = async () => {
    if (!hrSystem) {
      setError('Please select an HR system to connect to.');
      return;
    }

    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const selectedSystem = HR_SYSTEMS.find(sys => sys.id === hrSystem);
      
      // Add the new connection
      const newDataSource: DataSource = {
        id: `hr-${Date.now()}`,
        name: `${selectedSystem?.name} Integration`,
        type: 'hr_system',
        status: 'connected',
        lastSynced: new Date().toISOString(),
        config: { system: hrSystem }
      };
      
      setDataSources([...dataSources, newDataSource]);
      setSuccess(`Connected to ${selectedSystem?.name} successfully!`);
      setHRSystem('');
      setError(null);
    } catch (err) {
      console.error('Error connecting to HR system:', err);
      setError('Failed to connect to HR system. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Connect to database
  const connectDatabase = async () => {
    const { type, host, port, database, username, password } = databaseConfig;
    
    if (!type || !host || !port || !database || !username || !password) {
      setError('Please fill in all database connection fields.');
      return;
    }

    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const selectedDbType = DATABASE_TYPES.find(db => db.id === type);
      
      // Add the new connection
      const newDataSource: DataSource = {
        id: `db-${Date.now()}`,
        name: `${selectedDbType?.name} - ${database}`,
        type: 'database',
        status: 'connected',
        lastSynced: new Date().toISOString(),
        config: { ...databaseConfig, password: '********' }
      };
      
      setDataSources([...dataSources, newDataSource]);
      setSuccess(`Connected to ${selectedDbType?.name} database "${database}" successfully!`);
      setDatabaseConfig({
        type: '',
        host: '',
        port: '',
        database: '',
        username: '',
        password: '',
      });
      setError(null);
    } catch (err) {
      console.error('Error connecting to database:', err);
      setError('Failed to connect to database. Please check your connection details and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Connect to API
  const connectAPI = async () => {
    const { url, key, secret, type } = apiConfig;
    
    if (!url || !key) {
      setError('Please provide API URL and API key.');
      return;
    }

    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add the new connection
      const newDataSource: DataSource = {
        id: `api-${Date.now()}`,
        name: `API Integration - ${new URL(url).hostname}`,
        type: 'api',
        status: 'connected',
        lastSynced: new Date().toISOString(),
        config: { ...apiConfig, key: '********', secret: secret ? '********' : undefined }
      };
      
      setDataSources([...dataSources, newDataSource]);
      setSuccess(`Connected to API at ${url} successfully!`);
      setApiConfig({
        url: '',
        key: '',
        secret: '',
        type: 'other',
      });
      setError(null);
    } catch (err) {
      console.error('Error connecting to API:', err);
      setError('Failed to connect to API. Please check your API details and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Disconnect a data source
  const disconnectDataSource = async (id: string) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove from state
      setDataSources(dataSources.filter(source => source.id !== id));
      setSuccess('Data source disconnected successfully.');
      setError(null);
    } catch (err) {
      console.error('Error disconnecting data source:', err);
      setError('Failed to disconnect data source. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Connect Your Data</h1>
      <p className="text-muted-foreground">
        Connect your HR data sources to get the most out of PayrollPro AI. We support various data integration methods.
      </p>
      
      {/* Success and error alerts */}
      {success && (
        <Alert className="bg-green-50 border-green-300">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* List of connected data sources */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Connected Data Sources</h2>
        
        {dataSources.length === 0 ? (
          <Card className="bg-muted p-6 text-center">
            <Info className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No data sources connected yet. Use the options below to connect your data.</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dataSources.map((source) => (
              <Card key={source.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        {source.type === 'csv' && <Upload className="mr-2 h-5 w-5" />}
                        {source.type === 'database' && <Database className="mr-2 h-5 w-5" />}
                        {source.type === 'api' && <Share2 className="mr-2 h-5 w-5" />}
                        {source.type === 'hr_system' && (
                          <span className="mr-2">
                            {HR_SYSTEMS.find(sys => sys.id === source.config?.system)?.icon || '🔄'}
                          </span>
                        )}
                        {source.name}
                      </CardTitle>
                      <CardDescription>
                        {source.type === 'csv' && 'CSV File Upload'}
                        {source.type === 'database' && 'Database Connection'}
                        {source.type === 'api' && 'API Integration'}
                        {source.type === 'hr_system' && 'HR System Integration'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center">
                      {source.status === 'connected' ? (
                        <span className="flex items-center text-green-600 text-sm">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Connected
                        </span>
                      ) : (
                        <span className="flex items-center text-amber-600 text-sm">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {source.status}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  {source.lastSynced && (
                    <p className="text-sm text-muted-foreground">
                      Last synchronized: {new Date(source.lastSynced).toLocaleString()}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={() => alert('Sync feature not implemented in demo')}>
                    Sync Now
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    onClick={() => disconnectDataSource(source.id)}
                  >
                    Disconnect
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Data connection options */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Connect New Data Source</h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="file-upload" className="flex items-center gap-2">
              <FileUpload className="h-4 w-4" />
              <span className="hidden sm:inline">CSV Upload</span>
              <span className="sm:hidden">CSV</span>
            </TabsTrigger>
            <TabsTrigger value="hr-system" className="flex items-center gap-2">
              <span className="text-sm">🏢</span>
              <span className="hidden sm:inline">HR System</span>
              <span className="sm:hidden">HR</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Database</span>
              <span className="sm:hidden">DB</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              <span>API</span>
            </TabsTrigger>
          </TabsList>
          
          {/* File Upload Tab */}
          <TabsContent value="file-upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload CSV Data</CardTitle>
                <CardDescription>
                  Upload employee data, payroll records, or any CSV file to import into the system.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="file-upload">CSV File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFileUpload(e.target.files?.[0] || null)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Supported formats: CSV files with headers
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleFileUpload} 
                  disabled={!fileUpload || loading}
                >
                  {loading ? 'Uploading...' : 'Upload File'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* HR System Integration Tab */}
          <TabsContent value="hr-system">
            <Card>
              <CardHeader>
                <CardTitle>Connect HR System</CardTitle>
                <CardDescription>
                  Integrate with your existing HR system to import employee and payroll data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="hr-system">HR System</Label>
                  <Select
                    value={hrSystem}
                    onValueChange={setHRSystem}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select HR system" />
                    </SelectTrigger>
                    <SelectContent>
                      {HR_SYSTEMS.map((system) => (
                        <SelectItem key={system.id} value={system.id}>
                          <span className="flex items-center">
                            <span className="mr-2">{system.icon}</span>
                            {system.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {hrSystem && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="api-key">API Key</Label>
                        <Input
                          id="api-key"
                          type="password"
                          placeholder="Enter API key"
                        />
                      </div>
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="api-secret">API Secret (Optional)</Label>
                        <Input
                          id="api-secret"
                          type="password"
                          placeholder="Enter API secret"
                        />
                      </div>
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="api-url">API URL/Endpoint</Label>
                        <Input
                          id="api-url"
                          type="text"
                          placeholder="https://api.example.com"
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={connectHRSystem} 
                  disabled={!hrSystem || loading}
                >
                  {loading ? 'Connecting...' : 'Connect HR System'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Database Connection Tab */}
          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle>Connect Database</CardTitle>
                <CardDescription>
                  Connect directly to your database to import and sync data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="db-type">Database Type</Label>
                  <Select
                    value={databaseConfig.type}
                    onValueChange={(value) => setDatabaseConfig({...databaseConfig, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select database type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DATABASE_TYPES.map((db) => (
                        <SelectItem key={db.id} value={db.id}>
                          <span className="flex items-center">
                            <span className="mr-2">{db.icon}</span>
                            {db.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {databaseConfig.type && (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="db-host">Host</Label>
                        <Input
                          id="db-host"
                          type="text"
                          placeholder="localhost or IP address"
                          value={databaseConfig.host}
                          onChange={(e) => setDatabaseConfig({...databaseConfig, host: e.target.value})}
                        />
                      </div>
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="db-port">Port</Label>
                        <Input
                          id="db-port"
                          type="text"
                          placeholder="5432"
                          value={databaseConfig.port}
                          onChange={(e) => setDatabaseConfig({...databaseConfig, port: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="db-name">Database Name</Label>
                      <Input
                        id="db-name"
                        type="text"
                        placeholder="Database name"
                        value={databaseConfig.database}
                        onChange={(e) => setDatabaseConfig({...databaseConfig, database: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="db-username">Username</Label>
                        <Input
                          id="db-username"
                          type="text"
                          placeholder="Database username"
                          value={databaseConfig.username}
                          onChange={(e) => setDatabaseConfig({...databaseConfig, username: e.target.value})}
                        />
                      </div>
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="db-password">Password</Label>
                        <Input
                          id="db-password"
                          type="password"
                          placeholder="Database password"
                          value={databaseConfig.password}
                          onChange={(e) => setDatabaseConfig({...databaseConfig, password: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={connectDatabase} 
                  disabled={!databaseConfig.type || loading}
                >
                  {loading ? 'Connecting...' : 'Connect Database'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* API Integration Tab */}
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>Connect API</CardTitle>
                <CardDescription>
                  Integrate with third-party APIs to import data from external systems.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="api-url">API URL/Endpoint</Label>
                  <Input
                    id="api-url"
                    type="text"
                    placeholder="https://api.example.com"
                    value={apiConfig.url}
                    onChange={(e) => setApiConfig({...apiConfig, url: e.target.value})}
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter API key"
                    value={apiConfig.key}
                    onChange={(e) => setApiConfig({...apiConfig, key: e.target.value})}
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="api-secret">API Secret (Optional)</Label>
                  <Input
                    id="api-secret"
                    type="password"
                    placeholder="Enter API secret if required"
                    value={apiConfig.secret}
                    onChange={(e) => setApiConfig({...apiConfig, secret: e.target.value})}
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="api-type">API Type</Label>
                  <Select
                    value={apiConfig.type}
                    onValueChange={(value) => setApiConfig({...apiConfig, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select API type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payroll">Payroll API</SelectItem>
                      <SelectItem value="hr">HR API</SelectItem>
                      <SelectItem value="financial">Financial API</SelectItem>
                      <SelectItem value="other">Other API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={connectAPI} 
                  disabled={!apiConfig.url || !apiConfig.key || loading}
                >
                  {loading ? 'Connecting...' : 'Connect API'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}