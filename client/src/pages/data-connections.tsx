import React, { useState } from 'react';
import { useLocation } from 'wouter';
import CloudConnectionPanel from '../components/data-connection/CloudConnectionPanel';

export default function DataConnectionsPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('cloud');

  // Check if user is authenticated
  React.useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      setLocation('/auth/login');
    }
  }, [setLocation]);

  const tabs = [
    { id: 'cloud', name: 'Cloud Services', description: 'Connect to external cloud services' },
    { id: 'file', name: 'File Upload', description: 'Upload files directly' },
    { id: 'zapier', name: 'Zapier', description: 'Connect with 3000+ apps' },
    { id: 'api', name: 'API', description: 'Connect programmatically' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Data Connections</h1>
              <p className="text-gray-600">Connect your data sources for seamless payroll processing</p>
            </div>
            <button 
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              onClick={() => setLocation('/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="border-b">
            <div className="flex">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Tab content */}
          <div className="p-6">
            {activeTab === 'cloud' && (
              <CloudConnectionPanel />
            )}
            
            {activeTab === 'file' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium mb-4">Upload Files</h2>
                  <p className="text-gray-600 mb-6">
                    Upload your payroll data files directly. We support CSV, Excel, and PDF formats.
                  </p>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <div className="mb-4">
                      <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-gray-600 mb-2">Drag and drop files here</p>
                    <p className="text-gray-500 text-sm mb-4">or</p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                      Browse Files
                    </button>
                    <p className="text-gray-500 text-xs mt-3">
                      Supported formats: CSV, XLSX, PDF (Max size: 10MB)
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-6 mt-6">
                  <h3 className="font-medium mb-4">Uploaded Files</h3>
                  <p className="text-gray-500 text-sm">No files uploaded yet.</p>
                </div>
              </div>
            )}
            
            {activeTab === 'zapier' && (
              <div>
                <h2 className="text-lg font-medium mb-4">Zapier Integration</h2>
                <p className="text-gray-600 mb-6">
                  Connect with 3000+ apps through Zapier to automate your workflow.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="font-medium text-blue-800 mb-3">What you can do with Zapier</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>Automatically import employee data from your HR system</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>Sync payroll data with your accounting software</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>Send notifications to Slack when payroll is processed</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>Create calendar events for important payroll dates</span>
                    </li>
                  </ul>
                </div>
                
                <div className="text-center">
                  <button className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors">
                    Connect with Zapier
                  </button>
                  <p className="text-gray-500 text-sm mt-3">
                    You'll be redirected to Zapier to set up the connection
                  </p>
                </div>
              </div>
            )}
            
            {activeTab === 'api' && (
              <div>
                <h2 className="text-lg font-medium mb-4">API Integration</h2>
                <p className="text-gray-600 mb-6">
                  Connect programmatically using our REST API.
                </p>
                
                <div className="border rounded-md overflow-hidden mb-6">
                  <div className="bg-gray-100 px-4 py-2 border-b">
                    <h3 className="font-medium">API Key</h3>
                  </div>
                  <div className="p-4 flex items-center">
                    <code className="bg-gray-100 px-3 py-1 rounded font-mono text-sm flex-1 mr-3">
                      ••••••••••••••••••••••••••••••
                    </code>
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      Reveal
                    </button>
                    <button className="ml-3 text-sm text-blue-600 hover:text-blue-800">
                      Regenerate
                    </button>
                  </div>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 border-b">
                    <h3 className="font-medium">Example Request</h3>
                  </div>
                  <div className="p-4">
                    <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                      {`curl -X GET "https://api.payrollproai.com/v1/employees" \\
-H "Authorization: Bearer YOUR_API_KEY" \\
-H "Content-Type: application/json"`}
                    </pre>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <a 
                    href="#" 
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    View API Documentation
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}