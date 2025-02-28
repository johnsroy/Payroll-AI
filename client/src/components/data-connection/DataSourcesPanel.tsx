import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CloudIcon, 
  FolderIcon, 
  PlusCircleIcon, 
  ZapIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from 'lucide-react';
import { DataSource, DataSourceType, ConnectionStatus } from '../../lib/dataConnectionAgent';

interface DataSourcesPanelProps {
  className?: string;
  onSelectDataSource?: (source: DataSource) => void;
  onConnectNew?: () => void;
}

export default function DataSourcesPanel({ 
  className = '',
  onSelectDataSource,
  onConnectNew
}: DataSourcesPanelProps) {
  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      id: "google-drive-001",
      name: "Google Drive",
      type: "google_drive",
      status: "connected",
      lastSynced: new Date(Date.now() - 2 * 86400000), // 2 days ago
      metadata: {
        email: "user@example.com",
        totalFiles: 47
      }
    },
    {
      id: "dropbox-001",
      name: "Dropbox",
      type: "dropbox",
      status: "pending",
      metadata: {
        authUrl: "https://dropbox.com/authorize"
      }
    },
    {
      id: "local-files-001",
      name: "Local Files",
      type: "local",
      status: "connected",
      lastSynced: new Date(Date.now() - 1 * 3600000), // 1 hour ago
      metadata: {
        totalFiles: 5
      }
    },
    {
      id: "onedrive-001",
      name: "OneDrive",
      type: "onedrive",
      status: "error",
      metadata: {
        errorMessage: "Authentication failed"
      }
    }
  ]);
  
  const handleSourceClick = (source: DataSource) => {
    if (onSelectDataSource && source.status === 'connected') {
      onSelectDataSource(source);
    }
  };
  
  const getSourceIcon = (type: DataSourceType) => {
    switch (type) {
      case 'google_drive':
        return <CloudIcon className="w-5 h-5 text-blue-600" />;
      case 'dropbox':
        return <CloudIcon className="w-5 h-5 text-blue-500" />;
      case 'onedrive':
        return <CloudIcon className="w-5 h-5 text-blue-700" />;
      case 'local':
        return <FolderIcon className="w-5 h-5 text-amber-600" />;
      case 'zapier':
        return <ZapIcon className="w-5 h-5 text-amber-500" />;
      default:
        return <CloudIcon className="w-5 h-5 text-gray-600" />;
    }
  };
  
  const getStatusBadge = (status: ConnectionStatus) => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Connected
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Error
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Disconnected
          </span>
        );
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Data Sources</h3>
        <p className="mt-1 text-sm text-gray-500">
          Connect to your data sources to import files
        </p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {dataSources.map((source, index) => (
          <motion.div
            key={source.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className={`p-4 hover:bg-gray-50 transition-colors ${
              source.status === 'connected' ? 'cursor-pointer' : 'cursor-default'
            }`}
            onClick={() => handleSourceClick(source)}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                {getSourceIcon(source.type)}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">{source.name}</h4>
                  {getStatusBadge(source.status)}
                </div>
                
                {source.status === 'connected' && source.lastSynced && (
                  <p className="mt-1 text-xs text-gray-500">
                    Last synced: {source.lastSynced.toLocaleDateString()} {source.lastSynced.toLocaleTimeString()}
                  </p>
                )}
                
                {source.status === 'error' && source.metadata?.errorMessage && (
                  <p className="mt-1 text-xs text-red-600">
                    {source.metadata.errorMessage}
                  </p>
                )}
                
                {source.status === 'connected' && source.metadata?.totalFiles && (
                  <p className="mt-1 text-xs text-gray-600">
                    {source.metadata.totalFiles} files available
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: dataSources.length * 0.1, duration: 0.3 }}
          className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={onConnectNew}
        >
          <div className="flex items-center justify-center text-center">
            <div className="flex items-center text-blue-600">
              <PlusCircleIcon className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Connect New Data Source</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}