import React, { useState } from 'react';
import { useLocation } from 'wouter';

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  // Check if user is authenticated
  React.useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      setLocation('/auth/login');
    }
  }, [setLocation]);

  // Simulated user data
  const userData = {
    name: 'John Doe',
    company: 'Acme Inc.',
    plan: 'Business Pro',
  };

  // Mock data for dashboard metrics
  const metrics = [
    { id: 1, name: 'Employees', value: '126', change: '+3', changeType: 'increase' },
    { id: 2, name: 'Monthly Payroll', value: '$156,849', change: '+2.4%', changeType: 'increase' },
    { id: 3, name: 'Compliance Score', value: '98%', change: '+5%', changeType: 'increase' },
    { id: 4, name: 'Integrations', value: '6', change: '0', changeType: 'neutral' },
  ];

  // Navigation items
  const navItems = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'employees', name: 'Employees', icon: '👥' },
    { id: 'payroll', name: 'Payroll', icon: '💰' },
    { id: 'connections', name: 'Data Connections', icon: '🔄' },
    { id: 'compliance', name: 'Compliance', icon: '✅' },
    { id: 'ai-assistant', name: 'AI Assistant', icon: '🤖' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">PayrollPro AI</h1>
        </div>
        
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {userData.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium">{userData.name}</p>
              <p className="text-sm text-gray-500">{userData.company}</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map(item => (
              <li key={item.id}>
                <button
                  className={`w-full flex items-center space-x-3 p-2 rounded-md transition-colors ${
                    activeTab === item.id 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    if (item.id === 'ai-assistant') {
                      setLocation('/ai-assistant');
                    } else if (item.id === 'connections') {
                      setLocation('/data-connections');
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          </div>
        </header>
        
        <main className="p-6">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map(metric => (
              <div key={metric.id} className="bg-white rounded-lg shadow-sm p-6">
                <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                <p className="text-2xl font-bold mt-2">{metric.value}</p>
                <div className={`mt-2 text-sm ${
                  metric.changeType === 'increase' ? 'text-green-600' :
                  metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metric.change !== '0' && (
                    <span>{metric.changeType === 'increase' ? '↑' : '↓'} {metric.change}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Main content based on active tab */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-lg font-medium mb-4">Welcome back, {userData.name}</h2>
                <p className="text-gray-600 mb-4">
                  Your next payroll run is scheduled for <strong>July 15, 2025</strong>.
                </p>
                
                <div className="border rounded-md p-4 bg-blue-50 border-blue-200 mb-6">
                  <h3 className="font-medium text-blue-800 mb-2">AI Assistant Suggestions</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>Review compliance requirements for California employees</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>Set up Zapier integration with your accounting software</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>Optimize tax withholding for remote employees</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium mb-2">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <p className="text-gray-800">Payroll processed for 126 employees</p>
                      <p className="text-gray-500">June 30, 2025</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-800">New employee onboarded: Sarah Johnson</p>
                      <p className="text-gray-500">June 28, 2025</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-800">Tax filing submitted for Q2 2025</p>
                      <p className="text-gray-500">June 27, 2025</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'connections' && (
              <div>
                <h2 className="text-lg font-medium mb-4">Data Connections</h2>
                <p className="text-gray-600 mb-4">
                  Connect your existing services to automatically import data.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {/* Connection Cards */}
                  <div className="border rounded-md p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                        G
                      </div>
                      <div>
                        <h3 className="font-medium">Google Drive</h3>
                        <p className="text-xs text-gray-500">Import spreadsheets</p>
                      </div>
                    </div>
                    <button className="w-full py-2 px-3 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                      Connect
                    </button>
                  </div>
                  
                  <div className="border rounded-md p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                        Z
                      </div>
                      <div>
                        <h3 className="font-medium">Zapier</h3>
                        <p className="text-xs text-gray-500">Connect 3000+ apps</p>
                      </div>
                    </div>
                    <button className="w-full py-2 px-3 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                      Connect
                    </button>
                  </div>
                  
                  <div className="border rounded-md p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                        Q
                      </div>
                      <div>
                        <h3 className="font-medium">QuickBooks</h3>
                        <p className="text-xs text-gray-500">Sync accounting data</p>
                      </div>
                    </div>
                    <button className="w-full py-2 px-3 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                      Connect
                    </button>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium mb-2">Connected Services</h3>
                  <p className="text-sm text-gray-500">No services connected yet.</p>
                </div>
              </div>
            )}
            
            {activeTab === 'ai-assistant' && (
              <div>
                <h2 className="text-lg font-medium mb-4">AI Assistant</h2>
                <p className="text-gray-600 mb-4">
                  Ask questions about payroll, taxes, compliance, and more.
                </p>
                
                <div className="border rounded-md p-4 bg-gray-50 mb-6 h-64 overflow-y-auto">
                  {/* Conversation would go here */}
                  <div className="text-center text-gray-500 mt-16">
                    <p>Start a conversation with your AI assistant</p>
                    <p className="text-sm">Try asking about tax regulations or employee onboarding</p>
                  </div>
                </div>
                
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Ask a question..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700">
                    Send
                  </button>
                </div>
              </div>
            )}
            
            {/* Placeholder for other tabs */}
            {(activeTab !== 'overview' && activeTab !== 'connections' && activeTab !== 'ai-assistant') && (
              <div className="text-center py-10">
                <h2 className="text-lg font-medium mb-2">{navItems.find(item => item.id === activeTab)?.name}</h2>
                <p className="text-gray-600">This feature is coming soon.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}