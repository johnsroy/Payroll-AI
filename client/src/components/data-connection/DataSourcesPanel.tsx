import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  CalendarIcon, 
  CloudIcon, 
  DatabaseIcon, 
  UploadIcon,
  PlusIcon,
  RefreshCwIcon,
  XIcon,
  FolderIcon,
  FileIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from 'lucide-react';

import { DataSource, DataSourceType, ConnectionStatus } from '../../lib/dataConnectionAgent';
import { AnimatedFeatureCard } from '../animations/AnimatedFeatureCard';

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
  // This would normally come from the API
  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      id: "gd-001",
      name: "My Google Drive",
      type: "google_drive",
      status: "connected",
      lastSynced: new Date(Date.now() - 3600000), // 1 hour ago
      metadata: {
        email: "user@example.com",
        quotaUsed: "5.2 GB",
        quotaTotal: "15 GB"
      }
    },
    {
      id: "db-001",
      name: "Dropbox - Work",
      type: "dropbox",
      status: "connected",
      lastSynced: new Date(Date.now() - 86400000), // 1 day ago
      metadata: {
        email: "work@example.com",
        quotaUsed: "2.7 GB",
        quotaTotal: "5 GB"
      }
    },
    {
      id: "od-001",
      name: "OneDrive - Personal",
      type: "onedrive",
      status: "disconnected",
      metadata: {
        email: "personal@example.com"
      }
    }
  ]);

  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const handleSourceClick = (source: DataSource) => {
    setSelectedSource(source.id);
    if (onSelectDataSource) {
      onSelectDataSource(source);
    }
  };

  const handleDisconnect = (sourceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // This would normally call the API to disconnect the source
    setDataSources(prev => 
      prev.map(source => 
        source.id === sourceId 
          ? { ...source, status: 'disconnected' as ConnectionStatus } 
          : source
      )
    );
  };

  const getSourceIcon = (type: DataSourceType) => {
    switch (type) {
      case 'google_drive':
        return <CloudIcon className="h-6 w-6 text-blue-500" />;
      case 'dropbox':
        return <DatabaseIcon className="h-6 w-6 text-blue-600" />;
      case 'onedrive':
        return <CloudIcon className="h-6 w-6 text-blue-700" />;
      case 'local':
        return <FolderIcon className="h-6 w-6 text-gray-600" />;
      default:
        return <FileIcon className="h-6 w-6 text-gray-500" />;
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
      case 'disconnected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XIcon className="w-3 h-3 mr-1" />
            Disconnected
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <RefreshCwIcon className="w-3 h-3 mr-1 animate-spin" />
            Connecting...
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircleIcon className="w-3 h-3 mr-1" />
            Error
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Data Sources</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={onConnectNew}
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Connect New
        </motion.button>
      </div>

      {dataSources.length > 0 ? (
        <div className="space-y-4">
          {dataSources.map((source, index) => (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedSource === source.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
              }`}
              onClick={() => handleSourceClick(source)}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  {getSourceIcon(source.type)}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between">
                    <h3 className="text-lg font-medium text-gray-900">{source.name}</h3>
                    {getStatusBadge(source.status)}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {source.metadata.email}
                    {source.status === 'connected' && source.metadata.quotaUsed && (
                      <> • {source.metadata.quotaUsed} used of {source.metadata.quotaTotal}</>
                    )}
                  </p>
                  {source.lastSynced && (
                    <p className="mt-1 text-xs text-gray-400 flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      Last synced: {source.lastSynced.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  {source.status === 'connected' && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-gray-400 hover:text-red-500"
                      onClick={(e) => handleDisconnect(source.id, e)}
                    >
                      <XIcon className="h-5 w-5" />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <CloudIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No data sources</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by connecting to a data source.
          </p>
          <div className="mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={onConnectNew}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Connect Data Source
            </motion.button>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Connect additional sources</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AnimatedFeatureCard
            icon={<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Google_Drive_icon_%282020%29.svg/1024px-Google_Drive_icon_%282020%29.svg.png" className="w-6 h-6" alt="Google Drive" />}
            title="Google Drive"
            description="Connect your Google Drive to import payroll spreadsheets and documents."
            index={0}
          />

          <AnimatedFeatureCard
            icon={<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Dropbox_Icon.svg/1101px-Dropbox_Icon.svg.png" className="w-6 h-6" alt="Dropbox" />}
            title="Dropbox"
            description="Import data from your Dropbox account for seamless payroll management."
            index={1}
          />

          <AnimatedFeatureCard
            icon={<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Microsoft_Office_OneDrive_%282019%E2%80%93present%29.svg/1200px-Microsoft_Office_OneDrive_%282019%E2%80%93present%29.svg.png" className="w-6 h-6" alt="OneDrive" />}
            title="OneDrive"
            description="Connect to Microsoft OneDrive to access your financial documents."
            index={2}
          />
        </div>
      </div>
    </div>
  );
}