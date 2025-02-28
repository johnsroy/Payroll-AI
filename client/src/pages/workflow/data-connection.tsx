import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpIcon, FolderIcon, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { WorkflowMenu } from '@/components/layout/WorkflowMenu';
import { StepProgress, Step } from '@/components/workflow/StepProgress';
import { WorkflowBanner } from '@/components/workflow/WorkflowBanner';
import { ZapierIntegrationPanel } from '@/components/data-connection/ZapierIntegrationPanel';
import DataSourcesPanel from '@/components/data-connection/DataSourcesPanel';
import ConnectDataSourceModal from '@/components/data-connection/ConnectDataSourceModal';
import FileViewerPanel from '@/components/data-connection/FileViewerPanel';
import { 
  DataSource, 
  DataSourceType, 
  RemoteFile, 
  connectDataSource,
  getDataSources,
  getFilesFromSource,
  formatFileSize
} from '@/lib/dataConnectionAgent';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: Date;
  path: string;
  content?: string;
}

export default function WorkflowDataConnectionPage() {
  const [completedSteps, setCompletedSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState<Step>(getInitialStep());
  const [activeTab, setActiveTab] = useState<'cloud' | 'file-upload' | 'zapier'>('cloud');
  const [dataSources, setDataSources] = useState<DataSource[]>(getDataSources());
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    if (selectedSource) {
      loadFilesForSource(selectedSource.id);
    }
  }, [selectedSource]);

  const getInitialStep = (): Step => {
    // In a real application, you would check the user's progress
    return 'upload';
  };

  const loadFilesForSource = (sourceId: string) => {
    setIsLoading(true);
    
    // Simulate API call to get files
    setTimeout(() => {
      const remoteFiles = getFilesFromSource(sourceId);
      const fileItems: FileItem[] = remoteFiles.map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        path: file.path
      }));
      
      setFiles(fileItems);
      setIsLoading(false);
    }, 1000);
  };

  const handleSelectDataSource = (source: DataSource) => {
    setSelectedSource(source);
    setSelectedFile(null);
  };

  const handleConnect = async (type: DataSourceType, name: string) => {
    try {
      setIsLoading(true);
      const newSource = await connectDataSource(type, name);
      setDataSources(prev => [...prev, newSource]);
      setSelectedSource(newSource);
      setSelectedFile(null);
      
      // Check if we've completed this step
      if (!completedSteps.includes('upload')) {
        setCompletedSteps(prev => [...prev, 'upload']);
      }
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewFile = (file: FileItem) => {
    // In a real implementation, we would fetch the content of the file here
    const fileWithContent = {
      ...file,
      content: "Sample,Data,Column\n1,John Doe,10000\n2,Jane Smith,12000\n3,Bob Johnson,9500"
    };
    setSelectedFile(fileWithContent);
  };

  const handleAnalyzeFile = (file: FileItem) => {
    // In a real implementation, we would send the file for analysis
    console.log('Analyzing file:', file);
    
    // Move to the next step
    handleStepClick('analyze');
  };

  const handleUploadFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    
    // Simulate file upload
    setTimeout(() => {
      const newFiles: FileItem[] = Array.from(e.target.files || []).map(file => ({
        id: `local-${Date.now()}-${file.name}`,
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: new Date(file.lastModified),
        path: `/uploads/${file.name}`
      }));
      
      setFiles(prev => [...prev, ...newFiles]);
      setIsUploading(false);
      
      // Check if we've completed this step
      if (!completedSteps.includes('upload')) {
        setCompletedSteps(prev => [...prev, 'upload']);
      }
    }, 1500);
  };

  const handleConnectZapier = () => {
    setIsConnectModalOpen(true);
  };

  const handleRefresh = () => {
    if (selectedSource) {
      loadFilesForSource(selectedSource.id);
    }
  };

  const handleStepClick = (step: Step) => {
    // Only allow navigation to completed steps or the current step + 1
    if (
      completedSteps.includes(step) ||
      step === currentStep ||
      completedSteps.includes(getPreviousStep(step))
    ) {
      setCurrentStep(step);
    }
  };

  const getPreviousStep = (step: Step): Step => {
    switch (step) {
      case 'upload':
        return 'upload';
      case 'analyze':
        return 'upload';
      case 'review':
        return 'analyze';
      case 'implement':
        return 'review';
      default:
        return 'upload';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <WorkflowMenu />
      
      <div className="flex-1 flex flex-col">
        <WorkflowBanner
          currentStep={currentStep}
          title="Connect Data Sources"
          description="Connect your payroll data sources to begin automated analysis"
        />
        
        <div className="container mx-auto py-6 px-4">
          <StepProgress 
            currentStep={currentStep} 
            completedSteps={completedSteps} 
            onStepClick={handleStepClick}
            className="mb-8"
          />
          
          <Tabs 
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'cloud' | 'file-upload' | 'zapier')}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="cloud">
                  <FolderIcon className="w-4 h-4 mr-2" />
                  Cloud Sources
                </TabsTrigger>
                <TabsTrigger value="file-upload">
                  <ArrowUpIcon className="w-4 h-4 mr-2" />
                  File Upload
                </TabsTrigger>
                <TabsTrigger value="zapier">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                    <path d="m22 8-6 4 6 4V8Z"/>
                    <rect x="2" y="6" width="14" height="12" rx="2"/>
                    <path d="M6 12h.01"/>
                    <path d="M10 12h.01"/>
                    <path d="M14 12h.01"/>
                  </svg>
                  Zapier
                </TabsTrigger>
              </TabsList>
              
              {activeTab === 'cloud' && (
                <Button onClick={() => setIsConnectModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Connect Source
                </Button>
              )}
              
              {activeTab === 'file-upload' && (
                <Button onClick={() => document.getElementById('file-upload')?.click()}>
                  <ArrowUpIcon className="h-4 w-4 mr-2" />
                  Upload Files
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleUploadFiles}
                  />
                </Button>
              )}
            </div>
            
            <TabsContent value="cloud" className="space-y-4">
              {selectedFile ? (
                <FileViewerPanel 
                  file={selectedFile} 
                  onBack={() => setSelectedFile(null)}
                  onAnalyze={handleAnalyzeFile}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <DataSourcesPanel 
                      onSelectDataSource={handleSelectDataSource}
                      onConnectNew={() => setIsConnectModalOpen(true)}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    {selectedSource ? (
                      <Card>
                        <CardHeader className="pb-3 flex justify-between items-center">
                          <CardTitle className="text-lg">Files from {selectedSource.name}</CardTitle>
                          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                          </Button>
                        </CardHeader>
                        <CardContent>
                          {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                              <RefreshCw className="animate-spin h-8 w-8 text-gray-400" />
                            </div>
                          ) : files.length === 0 ? (
                            <div className="text-center py-12">
                              <FolderIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-1">No files found</h3>
                              <p className="text-gray-500">
                                There are no files in this source or you don't have permission to view them.
                              </p>
                            </div>
                          ) : (
                            <div className="overflow-hidden border rounded-md">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Size
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Last Modified
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {files.map((file) => (
                                    <tr key={file.id} className="hover:bg-gray-50">
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {file.name}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatFileSize(file.size)}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {file.lastModified.toLocaleDateString()}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          onClick={() => handleViewFile(file)}
                                        >
                                          View
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="bg-white border rounded-lg flex flex-col items-center justify-center py-12">
                        <FolderIcon className="h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No source selected</h3>
                        <p className="text-gray-500 mb-4">
                          Select a data source from the list or connect a new one.
                        </p>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsConnectModalOpen(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Connect Source
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="file-upload">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Upload Files</CardTitle>
                </CardHeader>
                <CardContent>
                  {isUploading ? (
                    <div className="flex justify-center items-center py-12">
                      <RefreshCw className="animate-spin h-8 w-8 text-gray-400" />
                    </div>
                  ) : files.length === 0 ? (
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleUploadFiles}
                      />
                      <ArrowUpIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Drop files here or click to upload</h3>
                      <p className="text-gray-500">
                        Upload CSV, Excel, or PDF files to begin analysis
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="overflow-hidden border rounded-md">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Size
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Uploaded
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {files.map((file) => (
                              <tr key={file.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {file.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatFileSize(file.size)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {file.lastModified.toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleViewFile(file)}
                                  >
                                    View
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Button 
                          variant="outline" 
                          onClick={() => document.getElementById('file-upload')?.click()}
                        >
                          <ArrowUpIcon className="h-4 w-4 mr-2" />
                          Upload More
                          <input
                            id="file-upload"
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleUploadFiles}
                          />
                        </Button>
                        
                        <Button onClick={() => handleStepClick('analyze')}>
                          Continue to Analysis
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="zapier">
              <ZapierIntegrationPanel onConnectZapier={handleConnectZapier} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <ConnectDataSourceModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnect={handleConnect}
      />
    </div>
  );
}