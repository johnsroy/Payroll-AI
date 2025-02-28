import { useEffect, useState } from 'react';
import { startOAuthPopupFlow } from '@/lib/oauthHelper';
import { Button } from '@/components/ui/button';
import { DataSourceType } from '@/lib/dataConnectionAgent';
import { AlertCircle } from 'lucide-react';

/**
 * OAuthHandler Component
 * 
 * This component handles the OAuth flow for connecting to various cloud services.
 * It opens a popup window for the OAuth flow and listens for the callback message.
 */
export function OAuthHandler({ 
  dataSourceType, 
  onSuccess, 
  onCancel 
}: { 
  dataSourceType: DataSourceType; 
  onSuccess: (accessToken: string) => void; 
  onCancel: () => void; 
}) {
  const [status, setStatus] = useState<'idle' | 'authorizing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [popup, setPopup] = useState<Window | null>(null);

  // Start the OAuth flow
  const startOAuthFlow = () => {
    setStatus('authorizing');
    setError(null);
    
    try {
      // Open the OAuth popup
      const newPopup = startOAuthPopupFlow(dataSourceType as any);
      
      if (!newPopup) {
        setStatus('error');
        setError('Unable to open popup window. Please check your popup blocker settings.');
        return;
      }
      
      setPopup(newPopup);
      
      // Check if popup was closed
      const checkPopupInterval = setInterval(() => {
        if (newPopup.closed) {
          clearInterval(checkPopupInterval);
          setStatus('idle');
        }
      }, 500);
    } catch (err) {
      setStatus('error');
      const error = err as Error;
      setError(`Failed to start authorization: ${error?.message || 'Unknown error'}`);
    }
  };

  // Listen for messages from the popup window
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      // Validate the origin
      if (event.origin !== window.location.origin) return;
      
      // Check for OAuth success message
      if (event.data && event.data.type === 'oauth-success') {
        setStatus('success');
        
        // Close the popup if it's still open
        if (popup && !popup.closed) {
          popup.close();
        }
        
        // Call the success callback with the access token
        onSuccess(event.data.accessToken || '');
      }
    };
    
    // Add message event listener
    window.addEventListener('message', handleOAuthMessage);
    
    // Clean up
    return () => {
      window.removeEventListener('message', handleOAuthMessage);
    };
  }, [popup, onSuccess]);
  
  // Get service-friendly name for display
  const getServiceName = (type: DataSourceType): string => {
    switch (type) {
      case 'google_drive': return 'Google Drive';
      case 'dropbox': return 'Dropbox';
      case 'onedrive': return 'OneDrive';
      case 'zapier': return 'Zapier';
      case 'local': return 'Local Files';
      default: return 'Cloud Service';
    }
  };

  return (
    <div className="p-4 text-center">
      {status === 'idle' && (
        <div>
          <p className="mb-4">Connect to {getServiceName(dataSourceType)} to access your files and data.</p>
          <div className="flex justify-center space-x-4 mt-4">
            <Button onClick={startOAuthFlow} className="bg-blue-600 hover:bg-blue-700">
              Connect {getServiceName(dataSourceType)}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      {status === 'authorizing' && (
        <div>
          <p className="mb-4">
            Authorizing {getServiceName(dataSourceType)}...
            <br />
            Please complete the authorization in the popup window.
          </p>
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mt-4"></div>
          <Button variant="outline" onClick={onCancel} className="mt-6">
            Cancel
          </Button>
        </div>
      )}
      
      {status === 'error' && (
        <div className="text-red-500">
          <div className="flex justify-center mb-2">
            <AlertCircle size={24} />
          </div>
          <p className="mb-4">{error || 'Authorization failed.'}</p>
          <div className="flex justify-center space-x-4 mt-4">
            <Button onClick={startOAuthFlow}>
              Try Again
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}