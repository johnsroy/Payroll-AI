import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataSourceType } from '@/lib/dataConnectionAgent';
import { OAuthHandler } from './OAuthHandler';
import { FolderOpen, ArrowLeft, ArrowRight } from 'lucide-react';

/**
 * Connect Data Source Modal
 * 
 * This component shows a modal for connecting to different data sources,
 * including cloud storage providers and local files.
 */
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
  const [step, setStep] = useState<'select-type' | 'configure'>('select-type');
  const [selectedType, setSelectedType] = useState<DataSourceType | null>(null);
  const [dataSourceName, setDataSourceName] = useState('');
  
  const handleSelectType = (type: DataSourceType) => {
    setSelectedType(type);
    setDataSourceName(getDataSourcePlaceholder(type));
    setStep('configure');
  };
  
  const handleBack = () => {
    setStep('select-type');
    setSelectedType(null);
  };
  
  const handleConnect = () => {
    if (selectedType && dataSourceName.trim()) {
      onConnect(selectedType, dataSourceName.trim());
      onClose();
    }
  };
  
  const handleOAuthSuccess = (accessToken: string) => {
    console.log(`OAuth success with token: ${accessToken.substring(0, 5)}...`);
    if (selectedType && dataSourceName.trim()) {
      onConnect(selectedType, dataSourceName.trim());
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'select-type' 
              ? 'Connect Data Source' 
              : `Connect to ${selectedType === 'google_drive' 
                  ? 'Google Drive' 
                  : selectedType === 'dropbox' 
                    ? 'Dropbox' 
                    : selectedType === 'onedrive' 
                      ? 'OneDrive' 
                      : selectedType === 'zapier'
                        ? 'Zapier'
                        : 'Local Files'
                }`
            }
          </DialogTitle>
          <DialogDescription>
            {step === 'select-type' 
              ? 'Choose a data source to connect to your payroll system.' 
              : 'Configure the connection settings.'
            }
          </DialogDescription>
        </DialogHeader>
        
        {step === 'select-type' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <DataSourceOption 
              type="google_drive"
              name="Google Drive" 
              description="Access your Google Drive files"
              onClick={() => handleSelectType('google_drive')}
            />
            <DataSourceOption 
              type="dropbox"
              name="Dropbox" 
              description="Connect to your Dropbox account"
              onClick={() => handleSelectType('dropbox')}
            />
            <DataSourceOption 
              type="onedrive"
              name="OneDrive" 
              description="Access files from Microsoft OneDrive"
              onClick={() => handleSelectType('onedrive')}
            />
            <DataSourceOption 
              type="zapier"
              name="Zapier Integration" 
              description="Connect to 5,000+ apps via Zapier"
              onClick={() => handleSelectType('zapier')}
            />
            <DataSourceOption 
              type="local"
              name="Local Files" 
              description="Upload files from your computer"
              onClick={() => handleSelectType('local')}
            />
          </div>
        ) : (
          <div className="py-4">
            {selectedType !== 'local' ? (
              <OAuthHandler 
                dataSourceType={selectedType as DataSourceType}
                onSuccess={handleOAuthSuccess}
                onCancel={handleBack}
              />
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="data-source-name">Data Source Name</Label>
                    <Input 
                      id="data-source-name"
                      placeholder={getDataSourcePlaceholder(selectedType)}
                      value={dataSourceName}
                      onChange={(e) => setDataSourceName(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleConnect} disabled={!dataSourceName.trim()}>
                    Connect
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Data Source Option Component
 */
interface DataSourceOptionProps {
  type: DataSourceType;
  name: string;
  description: string;
  onClick: () => void;
}

function DataSourceOption({ type, name, description, onClick }: DataSourceOptionProps) {
  return (
    <button
      type="button"
      className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <div className="flex-shrink-0">
        <DataSourceIcon type={type} />
      </div>
      <div className="flex-1 text-left">
        <p className="font-medium">{name}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </button>
  );
}

/**
 * Data Source Icon Component
 */
function DataSourceIcon({ type }: { type: DataSourceType }) {
  switch (type) {
    case 'google_drive':
      return <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center text-white">G</div>;
    case 'dropbox':
      return <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white">D</div>;
    case 'onedrive':
      return <div className="w-6 h-6 bg-blue-700 rounded-md flex items-center justify-center text-white">O</div>;
    case 'zapier':
      return <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center text-white">Z</div>;
    case 'local':
      return <FolderOpen className="h-6 w-6 text-yellow-500" />;
    default:
      return <div className="w-6 h-6 bg-gray-400 rounded-md"></div>;
  }
}

/**
 * Get a placeholder name for the data source based on its type
 */
function getDataSourcePlaceholder(type: DataSourceType): string {
  switch (type) {
    case 'google_drive': return 'My Google Drive';
    case 'dropbox': return 'My Dropbox';
    case 'onedrive': return 'My OneDrive';
    case 'zapier': return 'Zapier Integration';
    case 'local': return 'My Local Files';
    default: return 'New Data Source';
  }
}