import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, FileIcon, CloudIcon, FolderIcon } from 'lucide-react';
import { DataSourceType } from '../../lib/dataConnectionAgent';

interface ConnectDataSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (type: DataSourceType, name: string) => void;
}

export default function ConnectDataSourceModal({ 
  isOpen, 
  onClose,
  onConnect
}: ConnectDataSourceModalProps) {
  const [selectedType, setSelectedType] = useState<DataSourceType | null>(null);
  const [sourceName, setSourceName] = useState('');
  
  const handleSelectType = (type: DataSourceType) => {
    setSelectedType(type);
    
    // Set default name based on selected type
    switch (type) {
      case 'google_drive':
        setSourceName('Google Drive');
        break;
      case 'dropbox':
        setSourceName('Dropbox');
        break;
      case 'onedrive':
        setSourceName('OneDrive');
        break;
      case 'local':
        setSourceName('Local Files');
        break;
      case 'zapier':
        setSourceName('Zapier');
        break;
      default:
        setSourceName('');
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedType && sourceName.trim()) {
      onConnect(selectedType, sourceName);
      
      // Reset form
      setSelectedType(null);
      setSourceName('');
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Connect Data Source</h3>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <AnimatePresence mode="wait">
            {!selectedType ? (
              <motion.div
                key="select-type"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="text-sm font-medium text-gray-700 mb-3">Select a data source type</h4>
                <div className="grid grid-cols-2 gap-4">
                  <DataSourceOption 
                    type="google_drive"
                    name="Google Drive"
                    icon={<CloudIcon className="w-6 h-6 text-blue-600" />}
                    onClick={() => handleSelectType('google_drive')}
                  />
                  <DataSourceOption 
                    type="dropbox"
                    name="Dropbox"
                    icon={<CloudIcon className="w-6 h-6 text-blue-500" />}
                    onClick={() => handleSelectType('dropbox')}
                  />
                  <DataSourceOption 
                    type="onedrive"
                    name="OneDrive"
                    icon={<CloudIcon className="w-6 h-6 text-blue-700" />}
                    onClick={() => handleSelectType('onedrive')}
                  />
                  <DataSourceOption 
                    type="local"
                    name="Local Files"
                    icon={<FolderIcon className="w-6 h-6 text-amber-600" />}
                    onClick={() => handleSelectType('local')}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="configure-source"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6">
                  <button
                    className="inline-flex items-center text-sm text-blue-600"
                    onClick={() => setSelectedType(null)}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to all sources
                  </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        {selectedType === 'google_drive' && <CloudIcon className="w-8 h-8 text-blue-600" />}
                        {selectedType === 'dropbox' && <CloudIcon className="w-8 h-8 text-blue-500" />}
                        {selectedType === 'onedrive' && <CloudIcon className="w-8 h-8 text-blue-700" />}
                        {selectedType === 'local' && <FolderIcon className="w-8 h-8 text-amber-600" />}
                      </div>
                    </div>
                    
                    <h3 className="text-center text-lg font-medium text-gray-900 mb-1">
                      Connect to {sourceName}
                    </h3>
                    <p className="text-center text-sm text-gray-500 mb-4">
                      Provide access to your data for analysis
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Connection Name
                    </label>
                    <input
                      type="text"
                      value={sourceName}
                      onChange={(e) => setSourceName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter a name for this connection"
                      required
                    />
                  </div>
                  
                  <div className="bg-blue-50 px-4 py-3 border border-blue-200 rounded-md mb-6">
                    <p className="text-sm text-blue-800">
                      {selectedType === 'local' 
                        ? 'You will be able to upload files directly from your device.'
                        : `You'll be redirected to ${sourceName} to authorize access to your files.`}
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Connect
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

interface DataSourceOptionProps {
  type: DataSourceType;
  name: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function DataSourceOption({ type, name, icon, onClick }: DataSourceOptionProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          {icon}
        </div>
        <h4 className="text-sm font-medium text-gray-900">{name}</h4>
      </div>
    </motion.div>
  );
}