import React from 'react';
import { motion } from 'framer-motion';
import { ZapIcon, ArrowRightIcon, PlusCircleIcon } from 'lucide-react';
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
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <ZapIcon className="h-5 w-5 text-amber-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Zapier Integrations</h3>
        </div>
        <button
          className="inline-flex items-center px-3 py-1.5 border border-amber-300 text-sm leading-5 font-medium rounded-md text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
          onClick={onConnectZapier}
        >
          Connect Account
          <ArrowRightIcon className="ml-1.5 h-4 w-4" />
        </button>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <h4 className="text-base font-medium text-gray-900 mb-2">Popular Payroll Apps</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {zapierApps.slice(0, 4).map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-amber-200 hover:bg-amber-50 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                  {app.iconUrl ? (
                    <img src={app.iconUrl} alt={app.name} className="w-8 h-8" />
                  ) : (
                    <ZapIcon className="w-6 h-6 text-amber-500" />
                  )}
                </div>
                <div className="text-sm font-medium text-center">{app.name}</div>
                <div className="text-xs text-gray-500 mt-1">{app.zapCount} zaps</div>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-2">Recommended Templates</h4>
          <div className="space-y-3">
            {templates.slice(0, 3).map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
                className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-amber-200 hover:bg-amber-50 transition-colors cursor-pointer"
              >
                <div className="flex-shrink-0 mt-1">
                  <ZapIcon className="h-5 w-5 text-amber-500" />
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">{template.name}</div>
                  <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                  <div className="flex items-center mt-2 text-xs">
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                        <ZapIcon className="w-3 h-3 text-amber-500" />
                      </div>
                      <span className="ml-1 text-gray-700">{template.trigger.appName}</span>
                    </div>
                    <ArrowRightIcon className="h-3 w-3 mx-2 text-gray-400" />
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                        <ZapIcon className="w-3 h-3 text-amber-500" />
                      </div>
                      <span className="ml-1 text-gray-700">{template.action.appName}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="flex items-center justify-center p-4 border border-dashed border-gray-300 rounded-lg hover:border-amber-300 transition-colors cursor-pointer"
            >
              <PlusCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Browse more templates</span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}