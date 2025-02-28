import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { 
  FileTextIcon, 
  FileSpreadsheetIcon, 
  FileIcon, 
  ChevronRightIcon, 
  BarChart2Icon, 
  BrainIcon
} from 'lucide-react';

import { BackgroundParticles } from '../../components/animations/BackgroundParticles';
import DataSourcesPanel from '../../components/data-connection/DataSourcesPanel';
import ConnectDataSourceModal from '../../components/data-connection/ConnectDataSourceModal';
import { DataSource, DataSourceType } from '../../lib/dataConnectionAgent';
import { StepProgress, Step } from '../../components/workflow/StepProgress';
import { WorkflowBanner } from '../../components/workflow/WorkflowBanner';
import { WorkflowMenu } from '../../components/layout/WorkflowMenu';

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
  // Get state from localStorage for workflow persistence
  const getInitialStep = (): Step => {
    const savedStep = localStorage.getItem('payrollWorkflowStep');
    return (savedStep as Step) || 'upload';
  };
  
  const getCompletedSteps = (): Step[] => {
    const savedSteps = localStorage.getItem('payrollWorkflowCompletedSteps');
    return savedSteps ? JSON.parse(savedSteps) : [];
  };
  
  const [location, setLocation] = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>(getInitialStep);
  const [completedSteps, setCompletedSteps] = useState<Step[]>(getCompletedSteps);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isFileViewOpen, setIsFileViewOpen] = useState(false);
  const [connectedSource, setConnectedSource] = useState<DataSource | null>(null);
  
  // Save workflow state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('payrollWorkflowStep', currentStep);
    localStorage.setItem('payrollWorkflowCompletedSteps', JSON.stringify(completedSteps));
  }, [currentStep, completedSteps]);
  
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: "file-001",
      name: "Payroll_2023_Q4.xlsx",
      type: "xlsx",
      size: 2456789,
      lastModified: new Date(Date.now() - 7 * 86400000), // 7 days ago
      path: "/",
      content: "Employee ID,Name,Department,Salary,Tax Withholding,Benefits\n1001,John Smith,Engineering,95000,28500,12350\n1002,Sarah Johnson,Marketing,85000,25500,11050\n1003,Michael Davis,Finance,105000,31500,13650\n1004,Emily Wilson,HR,78000,23400,10140\n1005,James Brown,Engineering,98000,29400,12740"
    },
    {
      id: "file-002",
      name: "Employee_Data.csv",
      type: "csv",
      size: 987654,
      lastModified: new Date(Date.now() - 14 * 86400000), // 14 days ago
      path: "/",
      content: "ID,Name,Position,Department,Location,Hire Date,Status\n1001,John Smith,Senior Developer,Engineering,New York,2019-05-15,Full-time\n1002,Sarah Johnson,Marketing Manager,Marketing,Chicago,2020-02-10,Full-time\n1003,Michael Davis,Financial Analyst,Finance,Boston,2018-11-01,Full-time\n1004,Emily Wilson,HR Specialist,HR,Denver,2021-03-22,Full-time\n1005,James Brown,Lead Engineer,Engineering,Seattle,2017-07-14,Full-time"
    },
    {
      id: "file-003",
      name: "Tax_Reports_2023.pdf",
      type: "pdf",
      size: 3456789,
      lastModified: new Date(Date.now() - 30 * 86400000), // 30 days ago
      path: "/",
      content: "[PDF Content - Tax Reports for 2023]"
    },
    {
      id: "file-004",
      name: "Expense_Report_Jan2024.xlsx",
      type: "xlsx",
      size: 1234567,
      lastModified: new Date(Date.now() - 5 * 86400000), // 5 days ago
      path: "/",
      content: "Date,Employee,Category,Amount,Description,Approved\n2024-01-05,John Smith,Travel,450.25,Flight to Chicago conference,Yes\n2024-01-12,Sarah Johnson,Meals,65.80,Client dinner,Yes\n2024-01-15,Michael Davis,Office Supplies,125.34,New monitor,Yes\n2024-01-22,Emily Wilson,Training,350.00,HR certification course,Yes\n2024-01-28,James Brown,Software,89.99,Monthly subscription,Yes"
    },
    {
      id: "file-005",
      name: "Benefits_Summary.pdf",
      type: "pdf",
      size: 2345678,
      lastModified: new Date(Date.now() - 20 * 86400000), // 20 days ago
      path: "/",
      content: "[PDF Content - Benefits Summary]"
    }
  ]);

  const handleSelectDataSource = (source: DataSource) => {
    setSelectedDataSource(source);
  };

  const handleConnectNew = () => {
    setIsModalOpen(true);
  };

  const handleConnect = (type: DataSourceType, name: string) => {
    // Handle source connection
    console.log(`Connected to ${name} (${type})`);
    
    // Create a new connected source
    const newSource: DataSource = {
      id: `connected-${Date.now()}`,
      name: name,
      type: type,
      status: 'connected',
      lastSynced: new Date(),
      metadata: {
        email: 'user@example.com',
        totalFiles: files.length
      }
    };
    
    // Set as the selected and connected source
    setSelectedDataSource(newSource);
    setConnectedSource(newSource);
    setCompletedSteps([...completedSteps, 'upload']);
    
    // Close the modal
    setIsModalOpen(false);
  };
  
  const handleViewFile = (file: FileItem) => {
    setSelectedFile(file);
    setIsFileViewOpen(true);
  };
  
  const handleImportFile = (file: FileItem) => {
    // Simulate importing the file
    console.log(`Importing file: ${file.name}`);
    
    // Mark upload step as completed
    if (!completedSteps.includes('upload')) {
      setCompletedSteps([...completedSteps, 'upload']);
    }
    
    // Move to the next step
    setCurrentStep('analyze');
    setIsAnalyzing(true);
    
    // Simulate analysis completion after delay
    setTimeout(() => {
      setIsAnalyzing(false);
      if (!completedSteps.includes('analyze')) {
        setCompletedSteps([...completedSteps, 'analyze']);
      }
    }, 3000);
  };
  
  const handleStepClick = (step: Step) => {
    if (completedSteps.includes(step) || 
        step === currentStep || 
        completedSteps.includes(getPreviousStep(step))) {
      setCurrentStep(step);
    }
  };
  
  const getPreviousStep = (step: Step): Step => {
    switch (step) {
      case 'upload': return 'upload';
      case 'analyze': return 'upload';
      case 'review': return 'analyze';
      case 'implement': return 'review';
    }
  };
  
  const handleContinueToReview = () => {
    // Mark analysis step as completed
    if (!completedSteps.includes('analyze')) {
      setCompletedSteps([...completedSteps, 'analyze']);
    }
    
    // Move to the review step
    setCurrentStep('review');
    setLocation('/workflow/review');
  };
  
  const getStepTitle = () => {
    switch(currentStep) {
      case 'upload': return 'Connect & Upload';
      case 'analyze': return 'AI Analysis';
      case 'review': return 'Review Recommendations';
      case 'implement': return 'Implementation';
    }
  };
  
  const getStepDescription = () => {
    switch(currentStep) {
      case 'upload': 
        return 'Connect to your data sources and upload relevant payroll files';
      case 'analyze': 
        return 'Our AI analyzes your data for optimization opportunities and compliance issues';
      case 'review': 
        return 'Review and approve AI-generated recommendations';
      case 'implement': 
        return 'Implement approved changes through integrations with your existing tools';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else if (bytes < 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    } else {
      return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheetIcon className="w-5 h-5 text-green-600" />;
      case 'pdf':
        return <FileTextIcon className="w-5 h-5 text-red-600" />;
      case 'csv':
        return <FileSpreadsheetIcon className="w-5 h-5 text-blue-600" />;
      default:
        return <FileIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Menu */}
      <WorkflowMenu />

      {/* Hero Header */}
      <div className="relative py-8 bg-blue-600 text-white overflow-hidden">
        <BackgroundParticles />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center justify-center text-center">
            <motion.h1 
              className="text-3xl font-bold"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Payroll Workflow: {getStepTitle()}
            </motion.h1>
            <motion.p 
              className="mt-2 text-blue-100 max-w-2xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {getStepDescription()}
            </motion.p>
          </div>
          
          <div className="mt-8">
            <StepProgress 
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={handleStepClick}
              className="mb-4"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Data Connection Step */}
        {currentStep === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <DataSourcesPanel 
                  onSelectDataSource={handleSelectDataSource}
                  onConnectNew={handleConnectNew}
                />
              </motion.div>
            </div>

            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {selectedDataSource 
                      ? `Files from ${selectedDataSource.name}`
                      : 'Select a data source to view files'}
                  </h2>
                  
                  {connectedSource && (
                    <span className="inline-flex items-center px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Connected
                    </span>
                  )}
                </div>

                {selectedDataSource ? (
                  <>
                    <div className="border-b border-gray-200 pb-2 mb-4">
                      <nav className="flex" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-1">
                          <li>
                            <div className="flex items-center">
                              <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                {selectedDataSource.name}
                              </a>
                            </div>
                          </li>
                          <li>
                            <div className="flex items-center">
                              <ChevronRightIcon className="flex-shrink-0 h-4 w-4 text-gray-400" />
                              <a href="#" className="ml-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                                Root
                              </a>
                            </div>
                          </li>
                        </ol>
                      </nav>
                    </div>

                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Size</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Modified</th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {files.map((file, index) => (
                            <motion.tr 
                              key={file.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
                            >
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                <div className="flex items-center">
                                  <span className="flex-shrink-0 mr-2">
                                    {getFileIcon(file.type)}
                                  </span>
                                  <div className="font-medium text-gray-900">{file.name}</div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {formatFileSize(file.size)}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {file.lastModified.toLocaleDateString()}
                              </td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                <button 
                                  className="text-blue-600 hover:text-blue-900 mr-4"
                                  onClick={() => handleImportFile(file)}
                                >
                                  Import
                                </button>
                                <button 
                                  className="text-blue-600 hover:text-blue-900"
                                  onClick={() => handleViewFile(file)}
                                >
                                  View
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {isFileViewOpen && selectedFile && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <div className="flex items-center">
                              <span className="mr-2">{getFileIcon(selectedFile.type)}</span>
                              <h3 className="text-lg font-semibold text-gray-900">{selectedFile.name}</h3>
                            </div>
                            <button 
                              className="text-gray-500 hover:text-gray-700"
                              onClick={() => setIsFileViewOpen(false)}
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                              </svg>
                            </button>
                          </div>
                          
                          <div className="p-6 overflow-auto flex-1">
                            {selectedFile.type === 'xlsx' || selectedFile.type === 'csv' ? (
                              <table className="min-w-full divide-y divide-gray-200 border">
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {selectedFile.content?.split('\n').map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                      {row.split(',').map((cell, cellIndex) => (
                                        <td 
                                          key={cellIndex} 
                                          className={`px-3 py-2 text-sm ${rowIndex === 0 ? 'font-medium bg-gray-50' : ''}`}
                                        >
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 p-4 rounded border border-gray-200">
                                {selectedFile.content || "No preview available"}
                              </pre>
                            )}
                          </div>
                          
                          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                            <button 
                              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300 transition-colors"
                              onClick={() => setIsFileViewOpen(false)}
                            >
                              Close
                            </button>
                            <button 
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                              onClick={() => {
                                handleImportFile(selectedFile);
                                setIsFileViewOpen(false);
                              }}
                            >
                              Import File
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-10">
                    <FileIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No files to display</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Select a data source to view and import files.
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}

        {/* Analysis Step */}
        {currentStep === 'analyze' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow p-8 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <BrainIcon className="h-16 w-16 text-blue-500 mb-4 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Analyzing Your Data
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Our multi-agent AI system is analyzing your payroll data to identify optimization opportunities, 
                compliance risks, and potential automations.
              </p>

              {isAnalyzing ? (
                <div className="max-w-2xl mx-auto">
                  <div className="flex flex-col items-center mb-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full mb-4"
                    />
                    <p className="text-gray-500">Analysis in progress...</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-2">Multi-Agent Analysis Process</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-medium">1</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">Tax Calculation Agent</p>
                            <span className="inline-flex items-center px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">Processing</span>
                          </div>
                          <p className="text-xs text-gray-500">Analyzing tax withholding and compliance</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-medium">2</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">Data Analysis Agent</p>
                            <span className="inline-flex items-center px-2.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">Queued</span>
                          </div>
                          <p className="text-xs text-gray-500">Pattern recognition and anomaly detection</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-medium">3</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">Compliance Agent</p>
                            <span className="inline-flex items-center px-2.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">Queued</span>
                          </div>
                          <p className="text-xs text-gray-500">Regulatory compliance verification</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-medium">4</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">Reasoning Agent</p>
                            <span className="inline-flex items-center px-2.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">Waiting</span>
                          </div>
                          <p className="text-xs text-gray-500">Final recommendations synthesis</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">Analysis complete</h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>Our AI agents have analyzed your data and generated recommendations for optimization.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    onClick={handleContinueToReview}
                  >
                    Continue to Review
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <ConnectDataSourceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConnect={handleConnect}
      />
    </div>
  );
}