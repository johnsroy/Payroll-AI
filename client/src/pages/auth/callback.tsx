import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { parseAccessTokenFromHash, verifyOAuthState } from '@/lib/oauthHelper';
import { CheckCircle, XCircle } from 'lucide-react';

/**
 * OAuth Callback Page
 * 
 * This page handles the redirect from OAuth providers and communicates
 * the result back to the parent window if opened as a popup.
 */
export default function OAuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const [error, setError] = useState('');
  const [, navigate] = useLocation();

  useEffect(() => {
    // Process OAuth callback
    const processOAuthCallback = () => {
      try {
        // Check if we have hash parameters (for implicit flow)
        if (window.location.hash) {
          const { accessToken, error, state } = parseAccessTokenFromHash();
          
          if (error) {
            setStatus('error');
            setError(`Authentication failed: ${error}`);
            return;
          }
          
          if (!accessToken) {
            setStatus('error');
            setError('No access token received from authentication provider');
            return;
          }
          
          // Verify state parameter to prevent CSRF attacks
          if (state && !verifyOAuthState(state)) {
            setStatus('error');
            setError('Invalid state parameter, possible CSRF attack');
            return;
          }
          
          // Get data source info from localStorage
          const authStateJSON = localStorage.getItem('payrollpro_auth_state');
          if (!authStateJSON) {
            setStatus('error');
            setError('No authentication state found');
            return;
          }
          
          const authState = JSON.parse(authStateJSON);
          
          // Store the token
          localStorage.setItem('payrollpro_oauth_token', accessToken);
          localStorage.setItem('payrollpro_oauth_service', authState.dataSourceType || '');
          
          // Remove the auth state
          localStorage.removeItem('payrollpro_auth_state');
          
          // Set success state
          setStatus('success');
          setMessage('Authentication successful! You can now close this window.');
          
          // If this is a popup, send message to parent window
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({
              type: 'oauth-success',
              accessToken,
              service: authState.dataSourceType,
              name: authState.dataSourceName
            }, window.location.origin);
            
            // Close the popup after a short delay
            setTimeout(() => {
              window.close();
            }, 2000);
          } else {
            // If not a popup, redirect back to data connection page
            setTimeout(() => {
              navigate('/data-connection');
            }, 3000);
          }
        } else {
          // Handle authorization code flow or error
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get('code');
          const error = urlParams.get('error');
          
          if (error) {
            setStatus('error');
            setError(`Authentication failed: ${error}`);
            return;
          }
          
          if (code) {
            // In a real implementation, we would exchange the code for a token here
            // For demo purposes, we'll simulate success
            setStatus('success');
            setMessage('Authentication code received successfully! Processing...');
            
            // Simulate token exchange
            setTimeout(() => {
              // If this is a popup, send message to parent window
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage({
                  type: 'oauth-success',
                  code,
                  service: localStorage.getItem('payrollpro_oauth_service') || ''
                }, window.location.origin);
                
                // Close the popup after a short delay
                window.close();
              } else {
                // If not a popup, redirect back to data connection page
                navigate('/data-connection');
              }
            }, 2000);
          } else {
            setStatus('error');
            setError('No authorization code or token received');
          }
        }
      } catch (err) {
        console.error('Error processing OAuth callback:', err);
        setStatus('error');
        const error = err as Error;
        setError(`Error processing authentication: ${error?.message || 'Unknown error'}`);
      }
    };
    
    // Process the callback after component mounts
    processOAuthCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {status === 'loading' && 'Authenticating...'}
            {status === 'success' && 'Authentication Successful'}
            {status === 'error' && 'Authentication Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we process your authentication...'}
            {status === 'success' && 'You have successfully connected your account.'}
            {status === 'error' && 'We encountered an error while processing your authentication.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center p-6">
            {status === 'loading' && (
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-slate-200 h-12 w-12"></div>
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-2 bg-slate-200 rounded"></div>
                  <div className="h-2 bg-slate-200 rounded"></div>
                </div>
              </div>
            )}
            {status === 'success' && (
              <div className="text-green-500 mb-4">
                <CheckCircle size={64} />
              </div>
            )}
            {status === 'error' && (
              <div className="text-red-500 mb-4">
                <XCircle size={64} />
              </div>
            )}
            <p className={`mt-4 ${status === 'error' ? 'text-red-500' : ''}`}>
              {status === 'error' ? error : message}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          {(status === 'success' || status === 'error') && (
            <Link href="/data-connection">
              <Button>Return to Data Connection</Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}