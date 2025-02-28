import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XIcon, 
  CloudIcon, 
  DatabaseIcon, 
  FolderIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ZapIcon
} from 'lucide-react';

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
  const [step, setStep] = useState<'select' | 'configure' | 'connecting' | 'complete'>('select');
  const [selectedType, setSelectedType] = useState<DataSourceType | null>(null);
  const [name, setName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleSelectType = (type: DataSourceType) => {
    setSelectedType(type);
    setName(
      type === 'google_drive' ? 'Google Drive' : 
      type === 'dropbox' ? 'Dropbox' : 
      type === 'onedrive' ? 'OneDrive' : 
      'Local Files'
    );
    setStep('configure');
  };

  const handleBack = () => {
    if (step === 'configure') {
      setStep('select');
    }
  };

  const handleConnect = async () => {
    if (!selectedType) return;
    
    setStep('connecting');
    setIsConnecting(true);
    
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false);
      setStep('complete');
      
      // Simulate a successful connection after 1.5 seconds
      setTimeout(() => {
        onConnect(selectedType, name);
        onClose();
        // Reset state for next time
        setStep('select');
        setSelectedType(null);
        setName('');
      }, 1500);
    }, 2000);
  };

  // Prevent interaction with the background while modal is open
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <motion.div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <motion.div 
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {step === 'select' && 'Connect Data Source'}
                        {step === 'configure' && `Configure ${selectedType === 'google_drive' ? 'Google Drive' : selectedType === 'dropbox' ? 'Dropbox' : selectedType === 'onedrive' ? 'OneDrive' : 'Local Files'}`}
                        {step === 'connecting' && 'Connecting...'}
                        {step === 'complete' && 'Connection Successful'}
                      </h3>
                      <button
                        type="button"
                        className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={onClose}
                      >
                        <span className="sr-only">Close</span>
                        <XIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="mt-4">
                      {step === 'select' && (
                        <div className="grid grid-cols-2 gap-4">
                          <DataSourceOption 
                            type="google_drive"
                            name="Google Drive"
                            icon={<CloudIcon className="h-8 w-8 text-blue-500" />}
                            onClick={() => handleSelectType('google_drive')}
                          />
                          <DataSourceOption 
                            type="dropbox"
                            name="Dropbox"
                            icon={<DatabaseIcon className="h-8 w-8 text-blue-600" />}
                            onClick={() => handleSelectType('dropbox')}
                          />
                          <DataSourceOption 
                            type="onedrive"
                            name="OneDrive"
                            icon={<CloudIcon className="h-8 w-8 text-blue-700" />}
                            onClick={() => handleSelectType('onedrive')}
                          />
                          <DataSourceOption 
                            type="local"
                            name="Local Files"
                            icon={<FolderIcon className="h-8 w-8 text-gray-600" />}
                            onClick={() => handleSelectType('local')}
                          />
                          <DataSourceOption 
                            type="zapier"
                            name="Zapier Integration"
                            icon={<ZapIcon className="h-8 w-8 text-yellow-500" />}
                            onClick={() => handleSelectType('zapier')}
                          />
                        </div>
                      )}

                      {step === 'configure' && (
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="connection-name" className="block text-sm font-medium text-gray-700">
                              Connection Name
                            </label>
                            <input
                              type="text"
                              name="connection-name"
                              id="connection-name"
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                            />
                          </div>
                          
                          <div className="bg-blue-50 p-4 rounded-md">
                            <p className="text-sm text-blue-700">
                              {selectedType === 'zapier' 
                                ? 'You\'ll create a connection between PayrollPro AI and your other apps through Zapier.' 
                                : `You'll be redirected to authenticate with ${selectedType === 'google_drive' ? 'Google Drive' : selectedType === 'dropbox' ? 'Dropbox' : selectedType === 'onedrive' ? 'OneDrive' : 'your file system'}.`}
                            </p>
                          </div>

                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              By connecting, you're allowing PayrollPro AI to access and import your payroll data files.
                              We'll never modify or delete your files without permission.
                            </p>
                          </div>
                        </div>
                      )}

                      {step === 'connecting' && (
                        <div className="flex flex-col items-center justify-center py-10">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full"
                          />
                          <p className="mt-4 text-gray-600">
                            {isConnecting ? 'Connecting to your account...' : 'Almost there...'}
                          </p>
                        </div>
                      )}

                      {step === 'complete' && (
                        <div className="flex flex-col items-center justify-center py-10">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="bg-green-100 rounded-full p-2"
                          >
                            <CheckCircleIcon className="h-14 w-14 text-green-500" />
                          </motion.div>
                          <h3 className="mt-4 text-lg font-medium text-gray-900">Successfully Connected!</h3>
                          <p className="mt-2 text-gray-600">
                            Your {selectedType === 'google_drive' ? 'Google Drive' : 
                                  selectedType === 'dropbox' ? 'Dropbox' : 
                                  selectedType === 'onedrive' ? 'OneDrive' : 
                                  selectedType === 'zapier' ? 'Zapier Integration' : 
                                  'Local Files'} account is now connected to PayrollPro AI.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {step === 'select' && (
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                )}

                {step === 'configure' && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={handleConnect}
                      disabled={!name}
                    >
                      <span>Connect</span>
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </motion.button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={handleBack}
                    >
                      Back
                    </button>
                  </>
                )}

                {step === 'complete' && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={onClose}
                  >
                    Done
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
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
    <motion.button
      whileHover={{ 
        y: -5,
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
      }}
      whileTap={{ scale: 0.95 }}
      className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={onClick}
    >
      <div className="bg-blue-50 rounded-full p-3 mb-3">
        {icon}
      </div>
      <span className="font-medium text-gray-900">{name}</span>
    </motion.button>
  );
}