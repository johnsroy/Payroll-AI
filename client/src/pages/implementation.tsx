import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { PlayCircleIcon, CheckCircleIcon, ZapIcon, LinkIcon, RefreshCcwIcon } from 'lucide-react';
import { BackgroundParticles } from '../components/animations/BackgroundParticles';
import { WorkflowMenu } from '../components/layout/WorkflowMenu';
import { WorkflowBanner } from '../components/workflow/WorkflowBanner';
import { ZapierIntegrationPanel } from '../components/data-connection/ZapierIntegrationPanel';
import * as ZapierIntegration from '../lib/zapierIntegration';

export default function ImplementationPage() {
  const [zapierApps, setZapierApps] = useState<ZapierIntegration.ZapierApp[]>([]);
  const [implementations, setImplementations] = useState([
    {
      id: 'impl-001',
      title: 'Tax Withholding Adjustment',
      description: 'Adjust tax withholding rates for identified employees',
      status: 'pending',
      type: 'tax',
      integrations: ['payroll-system', 'tax-filing-software'],
      estimatedTime: '2 hours',
      completionPercentage: 0
    },
    {
      id: 'impl-002',
      title: 'Payroll Process Automation',
      description: 'Implement automated payroll workflows for efficiency',
      status: 'in-progress',
      type: 'automation',
      integrations: ['zapier', 'payroll-system', 'hr-software'],
      estimatedTime: '4 hours',
      completionPercentage: 30
    },
    {
      id: 'impl-003',
      title: 'State Tax Registration',
      description: 'Register for payroll taxes in required states',
      status: 'pending',
      type: 'compliance',
      integrations: ['tax-filing-software', 'compliance-tracker'],
      estimatedTime: '8 hours',
      completionPercentage: 0
    }
  ]);

  // Load Zapier apps
  useEffect(() => {
    const loadZapierApps = async () => {
      const apps = await ZapierIntegration.getPopularPayrollApps();
      setZapierApps(apps);
    };
    loadZapierApps();
  }, []);

  // Update implementation status
  const handleImplementationStatusChange = (id: string, status: string) => {
    setImplementations(
      implementations.map(impl => 
        impl.id === id ? { ...impl, status } : impl
      )
    );
  };

  // Update implementation progress
  const handleUpdateProgress = (id: string, percentage: number) => {
    setImplementations(
      implementations.map(impl => 
        impl.id === id ? { ...impl, completionPercentage: percentage } : impl
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Menu */}
      <WorkflowMenu />

      {/* Hero Header */}
      <div className="relative py-10 bg-green-600 text-white overflow-hidden">
        <BackgroundParticles />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.h1 
              className="text-3xl font-bold"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Implementation
            </motion.h1>
            <motion.p 
              className="mt-2 text-green-100 text-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Implement approved changes through integrations with your existing tools
            </motion.p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Current step information banner */}
        <WorkflowBanner 
          currentStep="implement"
          title="Implementation"
          description="Implement approved changes through integrations with your existing tools"
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center mb-6">
                <PlayCircleIcon className="w-6 h-6 text-green-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Implementation Tasks</h2>
              </div>
              
              <div className="space-y-6">
                {implementations.map((implementation) => (
                  <div key={implementation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{implementation.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{implementation.description}</p>
                        
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-gray-500 mr-3">Estimated time: {implementation.estimatedTime}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            implementation.status === 'completed' ? 'bg-green-100 text-green-800' :
                            implementation.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {implementation.status.charAt(0).toUpperCase() + implementation.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">Integrations:</p>
                          <div className="flex flex-wrap gap-2">
                            {implementation.integrations.map((integration, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-1 bg-gray-100 text-xs text-gray-800 rounded-full">
                                <LinkIcon className="w-3 h-3 mr-1" />
                                {integration}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-lg font-semibold">
                            {implementation.completionPercentage}%
                          </span>
                        </div>
                        <button 
                          className="mt-2 text-green-600 hover:text-green-800 text-sm font-medium"
                          onClick={() => handleUpdateProgress(implementation.id, Math.min(100, implementation.completionPercentage + 10))}
                        >
                          Update
                        </button>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${implementation.completionPercentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-2">
                      <button 
                        className="px-3 py-1.5 bg-white border border-gray-300 text-sm text-gray-700 rounded-md hover:bg-gray-50"
                        onClick={() => handleImplementationStatusChange(implementation.id, 'pending')}
                      >
                        Reset
                      </button>
                      <button 
                        className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-sm text-blue-700 rounded-md hover:bg-blue-100"
                        onClick={() => handleImplementationStatusChange(implementation.id, 'in-progress')}
                      >
                        Start
                      </button>
                      <button 
                        className="px-3 py-1.5 bg-green-600 text-sm text-white rounded-md hover:bg-green-700"
                        onClick={() => {
                          handleImplementationStatusChange(implementation.id, 'completed');
                          handleUpdateProgress(implementation.id, 100);
                        }}
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ZapierIntegrationPanel 
                zapierApps={zapierApps}
                templates={ZapierIntegration.PAYROLL_ZAP_TEMPLATES}
                onConnectZapier={() => {
                  console.log('Connect to Zapier');
                }}
              />
              
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <div className="flex items-center mb-4">
                  <RefreshCcwIcon className="w-5 h-5 text-indigo-500 mr-2" />
                  <h3 className="font-semibold text-gray-800">Implementation Status</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="text-gray-600">Overall Progress</span>
                      <span className="font-medium">30%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="text-gray-600">Tasks Completed</span>
                      <span className="font-medium">0/3</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="text-gray-600">Integrations Active</span>
                      <span className="font-medium">2/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                  
                  <button className="w-full mt-4 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md font-medium border border-indigo-100 hover:bg-indigo-100 transition-colors flex items-center justify-center">
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Generate Implementation Report
                  </button>
                  
                  <div className="mt-6">
                    <Link href="/review" className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300 transition-colors flex items-center justify-center">
                      Back to Review
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}