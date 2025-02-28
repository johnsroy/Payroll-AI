import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { 
  FileTextIcon, 
  FileSpreadsheetIcon, 
  FileIcon, 
  ChevronRightIcon, 
  UploadIcon, 
  BrainIcon, 
  ClipboardCheckIcon,
  PlayIcon,
  Zap as ZapIcon
} from 'lucide-react';

import { BackgroundParticles } from '../components/animations/BackgroundParticles';
import { WavyBackground } from '../components/animations/WavyBackground';
import DataSourcesPanel from '../components/data-connection/DataSourcesPanel';
import ConnectDataSourceModal from '../components/data-connection/ConnectDataSourceModal';
import { DataSource, DataSourceType } from '../lib/dataConnectionAgent';
import { StepProgress, Step } from '../components/workflow/StepProgress';
import { AIRecommendations } from '../components/analysis/AIRecommendations';
import { WorkflowMenu } from '../components/layout/WorkflowMenu';
import { WorkflowBanner } from '../components/workflow/WorkflowBanner';
import { ZapierIntegrationPanel } from '../components/data-connection/ZapierIntegrationPanel';
import * as ZapierIntegration from '../lib/zapierIntegration';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: Date;
  path: string;
}

export default function DataConnectionPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [completedSteps, setCompletedSteps] = useState<Step[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [zapierApps, setZapierApps] = useState<ZapierIntegration.ZapierApp[]>([]);
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: "file-001",
      name: "Payroll_2023_Q4.xlsx",
      type: "xlsx",
      size: 2456789,
      lastModified: new Date(Date.now() - 7 * 86400000), // 7 days ago
      path: "/"
    },
    {
      id: "file-002",
      name: "Employee_Data.csv",
      type: "csv",
      size: 987654,
      lastModified: new Date(Date.now() - 14 * 86400000), // 14 days ago
      path: "/"
    },
    {
      id: "file-003",
      name: "Tax_Reports_2023.pdf",
      type: "pdf",
      size: 3456789,
      lastModified: new Date(Date.now() - 30 * 86400000), // 30 days ago
      path: "/"
    },
    {
      id: "file-004",
      name: "Expense_Report_Jan2024.xlsx",
      type: "xlsx",
      size: 1234567,
      lastModified: new Date(Date.now() - 5 * 86400000), // 5 days ago
      path: "/"
    },
    {
      id: "file-005",
      name: "Benefits_Summary.pdf",
      type: "pdf",
      size: 2345678,
      lastModified: new Date(Date.now() - 20 * 86400000), // 20 days ago
      path: "/"
    }
  ]);

  const handleSelectDataSource = (source: DataSource) => {
    setSelectedDataSource(source);
  };

  const handleConnectNew = () => {
    setIsModalOpen(true);
  };

  const handleConnect = (type: DataSourceType, name: string) => {
    console.log(`Connected to ${name} (${type})`);
    // This would normally call the API to connect to the data source
    setCompletedSteps([...completedSteps, 'upload']);
    setCurrentStep('analyze');
  };
  
  // Load Zapier apps when needed
  React.useEffect(() => {
    if (currentStep === 'implement') {
      const loadZapierApps = async () => {
        const apps = await ZapierIntegration.getPopularPayrollApps();
        setZapierApps(apps);
      };
      loadZapierApps();
    }
  }, [currentStep]);
  
  // Generate mock recommendations when analyzing
  React.useEffect(() => {
    if (currentStep === 'analyze' && !isAnalyzing && recommendations.length === 0) {
      const startAnalysis = async () => {
        setIsAnalyzing(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Generate mock recommendations
        setRecommendations([
          {
            id: 'rec-001',
            title: 'Optimize Tax Withholding Strategy',
            description: 'Based on the employee data, we detected potential for optimizing tax withholding strategies. Several employees appear to have excessive withholding that could be adjusted to provide better cash flow while maintaining compliance.',
            type: 'tax',
            priority: 'high',
            potentialSavings: 12500,
            implementationDifficulty: 'medium',
            status: 'pending',
          },
          {
            id: 'rec-002',
            title: 'Payroll Process Automation Opportunity',
            description: 'Your manual payroll processing is taking approximately 12 hours per pay period. By implementing automated payroll workflows and integrating with your existing systems, you could reduce processing time by up to 70%.',
            type: 'optimization',
            priority: 'medium',
            potentialSavings: 8750,
            implementationDifficulty: 'easy',
            status: 'pending',
          },
          {
            id: 'rec-003',
            title: 'State Tax Filing Compliance Risk',
            description: 'We detected that your company has employees in 3 states where you may not be properly registered for payroll taxes. This creates compliance risks that should be addressed immediately.',
            type: 'compliance',
            priority: 'high',
            complianceRisk: 'Potential penalty exposure of $25,000+',
            implementationDifficulty: 'complex',
            status: 'pending',
          },
        ]);
        
        setIsAnalyzing(false);
        setCompletedSteps([...completedSteps, 'analyze']);
        setCurrentStep('review');
      };
      
      startAnalysis();
    }
  }, [currentStep, isAnalyzing, recommendations, completedSteps]);
  
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
  
  const handleRecommendationStatusChange = (id: string, status: string) => {
    setRecommendations(
      recommendations.map(rec => 
        rec.id === id ? { ...rec, status } : rec
      )
    );
    
    if (status === 'implemented') {
      // If at least one recommendation is implemented, consider the implementation step done
      if (!completedSteps.includes('implement')) {
        setCompletedSteps([...completedSteps, 'implement']);
      }
    }
    
    // If all recommendations have been addressed (approved, rejected, or implemented)
    const allAddressed = recommendations
      .filter(rec => rec.id !== id)
      .every(rec => rec.status !== 'pending');
      
    if (allAddressed && status !== 'pending') {
      // If no recommendations are pending, consider the review step done
      if (!completedSteps.includes('review')) {
        setCompletedSteps([...completedSteps, 'review']);
      }
      
      // Move to implement step
      if (currentStep === 'review') {
        setCurrentStep('implement');
      }
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
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Menu */}
      <WorkflowMenu />

      {/* Hero Header */}
      <div className="relative py-10 bg-blue-600 text-white overflow-hidden">
        <BackgroundParticles />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 
                className="text-3xl font-bold"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                PayrollPro AI Workflow
              </motion.h1>
              <motion.p 
                className="mt-2 text-blue-100"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                A 4-step process to optimize your payroll operations with AI
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <button 
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                onClick={handleConnectNew}
              >
                Connect New Source
              </button>
            </motion.div>
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
        {/* Current step information banner */}
        <WorkflowBanner 
          currentStep={currentStep}
          title={getStepTitle()}
          description={getStepDescription()}
        />
        
        {/* Step 1: Upload/Connect - Show data sources and files */}
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
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  {selectedDataSource 
                    ? `Files from ${selectedDataSource.name}`
                    : 'Select a data source to view files'}
                </h2>

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
                                  onClick={() => {
                                    setCompletedSteps([...completedSteps, 'upload']);
                                    setCurrentStep('analyze');
                                  }}
                                >
                                  Import
                                </button>
                                <a href="#" className="text-blue-600 hover:text-blue-900">View</a>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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

        {/* Step 2: Analysis - Show analysis progress */}
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
                Our AI is analyzing your payroll data to identify optimization opportunities, compliance risks, and potential automations.
              </p>

              {isAnalyzing ? (
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full mb-4"
                  />
                  <p className="text-gray-500">Analysis in progress...</p>
                </div>
              ) : (
                <button
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    setCompletedSteps([...completedSteps, 'analyze']);
                    setCurrentStep('review');
                  }}
                >
                  Continue to Review
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 3: Review - Show recommendations */}
        {currentStep === 'review' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow p-8 max-w-5xl mx-auto"
          >
            <AIRecommendations 
              recommendations={recommendations} 
              onStatusChange={handleRecommendationStatusChange}
            />
            
            {recommendations.every(rec => rec.status !== 'pending') && (
              <div className="mt-8 text-center">
                <button
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    setCompletedSteps([...completedSteps, 'review']);
                    setCurrentStep('implement');
                  }}
                >
                  Continue to Implementation
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 4: Implement - Show Zapier integrations */}
        {currentStep === 'implement' && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white rounded-lg shadow overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Implementation Options</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Choose how you want to implement the approved recommendations
                    </p>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    <div className="space-y-4">
                      <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex-shrink-0 mr-3 p-2 bg-blue-100 rounded-full">
                          <ZapIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Zapier Integration</h4>
                          <p className="text-xs text-gray-500">Automate with 5,000+ apps</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center p-3 rounded-lg border border-gray-200">
                        <div className="flex-shrink-0 mr-3 p-2 bg-gray-100 rounded-full">
                          <FileIcon className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Export as Documents</h4>
                          <p className="text-xs text-gray-500">Download as PDF, CSV, or Excel</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center p-3 rounded-lg border border-gray-200">
                        <div className="flex-shrink-0 mr-3 p-2 bg-gray-100 rounded-full">
                          <PlayIcon className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">API Integration</h4>
                          <p className="text-xs text-gray-500">Connect via REST API</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <ZapierIntegrationPanel 
                    zapierApps={zapierApps}
                    templates={ZapierIntegration.PAYROLL_ZAP_TEMPLATES}
                    onConnectZapier={() => console.log('Connecting to Zapier...')}
                  />
                </motion.div>
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white rounded-lg shadow p-6 max-w-5xl mx-auto"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Implementation Summary</h3>
              <div className="space-y-4">
                {recommendations.filter(rec => rec.status === 'approved' || rec.status === 'implemented').map((rec, index) => (
                  <div key={rec.id} className="flex items-start border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{rec.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                      <div className="flex items-center mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rec.status === 'implemented' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {rec.status === 'implemented' ? 'Implemented' : 'Approved'}
                        </span>
                        {rec.potentialSavings && (
                          <span className="ml-2 text-xs text-gray-500">
                            Potential savings: ${rec.potentialSavings.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      {rec.status !== 'implemented' && (
                        <button
                          onClick={() => handleRecommendationStatusChange(rec.id, 'implemented')}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Implement
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <WavyBackground className="py-16 mt-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            className="text-2xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Simplify Your Payroll Data Management
          </motion.h2>
          <motion.p 
            className="text-white text-lg max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Connect your cloud storage accounts to automatically import payroll data,
            employee information, and financial documents.
          </motion.p>
          <motion.button
            className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleConnectNew}
          >
            Start Connecting Your Data
          </motion.button>
        </div>
      </WavyBackground>

      <ConnectDataSourceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConnect={handleConnect}
      />
    </div>
  );
}