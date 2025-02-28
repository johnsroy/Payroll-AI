import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap as ZapIcon, 
  Check as CheckIcon, 
  ExternalLink as ExternalLinkIcon,
  LogIn as LogInIcon
} from 'lucide-react';
import * as ZapierIntegration from '../../lib/zapierIntegration';

interface ZapierIntegrationPanelProps {
  zapierApps: ZapierIntegration.ZapierApp[];
  templates: typeof ZapierIntegration.PAYROLL_ZAP_TEMPLATES;
  onConnectZapier: () => void;
}

export function ZapierIntegrationPanel({ 
  zapierApps, 
  templates,
  onConnectZapier
}: ZapierIntegrationPanelProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedApp, setSelectedApp] = useState<ZapierIntegration.ZapierApp | null>(null);
  
  const handleConnectZapier = () => {
    setIsConnected(true);
    onConnectZapier();
  };
  
  const handleSelectApp = (app: ZapierIntegration.ZapierApp) => {
    setSelectedApp(app);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
        <div className="flex items-center">
          <ZapIcon className="w-6 h-6 mr-2" />
          <h3 className="text-xl font-bold">Zapier Integration</h3>
        </div>
        <p className="mt-1 text-blue-100">
          Connect with 5,000+ apps to automate your payroll workflow
        </p>
      </div>
      
      {!isConnected ? (
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">
              Connect your PayrollPro AI account with Zapier to automate workflows between your payroll data and thousands of apps.
            </p>
            <button
              onClick={handleConnectZapier}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <LogInIcon className="w-4 h-4 mr-2" />
              Connect Zapier Account
            </button>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium text-gray-800 mb-3">What you can do with Zapier:</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">Automatically sync payroll data with accounting software</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">Send notifications when payroll is processed</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">Create calendar events for tax filing deadlines</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">Update employee records from HR systems</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <h4 className="font-medium text-gray-900">Connected to Zapier</h4>
                <p className="text-sm text-gray-500">Your account is linked successfully</p>
              </div>
            </div>
            <a 
              href="https://zapier.com/app/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              Go to Zapier Dashboard
              <ExternalLinkIcon className="w-4 h-4 ml-1" />
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {zapierApps.slice(0, 4).map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-md p-3 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors ${
                  selectedApp?.id === app.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => handleSelectApp(app)}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center mr-3">
                    {app.iconUrl ? (
                      <img src={app.iconUrl} alt={app.name} className="w-6 h-6 object-contain" />
                    ) : (
                      <ZapIcon className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">{app.name}</h5>
                    <p className="text-xs text-gray-500">{app.zapCount.toLocaleString()} zaps</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="rounded-md bg-gray-50 p-4 border border-gray-200">
            <h4 className="font-medium text-gray-800 mb-3">Recommended Templates</h4>
            <div className="space-y-3">
              {templates.slice(0, 3).map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (index * 0.1) }}
                  className="bg-white rounded border border-gray-200 p-3"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium text-gray-900">{template.name}</h5>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                    <button className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200 transition-colors">
                      Use
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}