import React, { useState } from 'react';

type DataSourceType = 'google_drive' | 'dropbox' | 'onedrive' | 'zapier' | 'quickbooks' | 'file_upload';
type ConnectionStatus = 'connected' | 'disconnected' | 'pending' | 'error';

interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  status: ConnectionStatus;
  lastSynced?: Date;
  icon: React.ReactNode;
  description: string;
}

export default function CloudConnectionPanel() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<DataSourceType | null>(null);
  const [connected, setConnected] = useState<DataSource[]>([]);
  
  // Mock data sources
  const dataSources: DataSource[] = [
    {
      id: 'google-drive',
      name: 'Google Drive',
      type: 'google_drive',
      status: 'disconnected',
      icon: <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center font-bold">G</div>,
      description: 'Import spreadsheets from Google Drive',
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      type: 'dropbox',
      status: 'disconnected',
      icon: <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center font-bold">D</div>,
      description: 'Import files from Dropbox',
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      type: 'onedrive',
      status: 'disconnected',
      icon: <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center font-bold">O</div>,
      description: 'Import files from OneDrive',
    },
    {
      id: 'zapier',
      name: 'Zapier',
      type: 'zapier',
      status: 'disconnected',
      icon: <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center font-bold">Z</div>,
      description: 'Connect with 3000+ apps',
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      type: 'quickbooks',
      status: 'disconnected',
      icon: <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center font-bold">Q</div>,
      description: 'Sync accounting data',
    },
    {
      id: 'file-upload',
      name: 'File Upload',
      type: 'file_upload',
      status: 'disconnected',
      icon: <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center font-bold">F</div>,
      description: 'Upload files directly',
    },
  ];

  const handleConnect = (sourceType: DataSourceType) => {
    setSelectedSource(sourceType);
    setIsModalOpen(true);
  };

  const handleConfirmConnect = () => {
    if (selectedSource) {
      // Simulate successful connection
      const source = dataSources.find(s => s.type === selectedSource);
      if (source) {
        const connectedSource = {
          ...source,
          status: 'connected' as ConnectionStatus,
          lastSynced: new Date()
        };
        setConnected([...connected, connectedSource]);
      }
    }
    setIsModalOpen(false);
    setSelectedSource(null);
  };

  const handleDisconnect = (sourceId: string) => {
    setConnected(connected.filter(source => source.id !== sourceId));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-4">Connect Data Sources</h2>
        <p className="text-gray-600 mb-4">
          Connect your existing services to automatically import data for payroll processing.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dataSources
            .filter(source => !connected.some(conn => conn.id === source.id))
            .map(source => (
              <div key={source.id} className="border rounded-md p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  {source.icon}
                  <div className="ml-3">
                    <h3 className="font-medium">{source.name}</h3>
                    <p className="text-xs text-gray-500">{source.description}</p>
                  </div>
                </div>
                <button 
                  className="w-full py-2 px-3 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
                  onClick={() => handleConnect(source.type)}
                >
                  Connect
                </button>
              </div>
            ))}
        </div>
      </div>
      
      {connected.length > 0 && (
        <div className="border-t pt-6 mt-6">
          <h3 className="font-medium mb-4">Connected Services</h3>
          <div className="space-y-4">
            {connected.map(source => (
              <div key={source.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-md">
                <div className="flex items-center">
                  {source.icon}
                  <div className="ml-3">
                    <h4 className="font-medium">{source.name}</h4>
                    <p className="text-xs text-gray-500">
                      Last synced: {source.lastSynced?.toLocaleString() || 'Never'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Connected
                  </div>
                  <button 
                    className="text-sm text-gray-600 hover:text-red-600"
                    onClick={() => handleDisconnect(source.id)}
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Connection modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-3">
              Connect to {dataSources.find(s => s.type === selectedSource)?.name}
            </h3>
            <p className="text-gray-600 mb-4">
              You'll be redirected to authenticate and authorize access to your account.
            </p>
            
            <div className="flex flex-col space-y-3">
              <button 
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={handleConfirmConnect}
              >
                Authorize Connection
              </button>
              <button 
                className="w-full py-2 px-4 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}