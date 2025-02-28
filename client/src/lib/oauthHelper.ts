/**
 * OAuth Helper
 * 
 * This module provides utilities for OAuth authentication with various cloud services.
 */

/**
 * OAuth configuration
 */
export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
  responseType?: 'code' | 'token';
  state?: string;
  additionalParams?: Record<string, string>;
}

/**
 * Default OAuth configuration for PayrollPro AI
 */
export const DEFAULT_OAUTH_CONFIG: OAuthConfig = {
  clientId: 'payroll-pro-client-12345', // Demo client ID
  redirectUri: '/auth/callback', // Will be prefixed with origin when used
  scopes: [],
  responseType: 'token'
};

/**
 * Service-specific OAuth URLs
 */
export const OAUTH_URLS = {
  google_drive: 'https://accounts.google.com/o/oauth2/v2/auth',
  dropbox: 'https://www.dropbox.com/oauth2/authorize',
  onedrive: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  zapier: 'https://zapier.com/app/connections'
};

/**
 * Scopes for different services
 */
export const SERVICE_SCOPES = {
  google_drive: ['https://www.googleapis.com/auth/drive.readonly'],
  dropbox: [],
  onedrive: ['files.read'],
  zapier: []
};

/**
 * Generate an OAuth URL for a specific service
 */
export function generateOAuthUrl(
  service: 'google_drive' | 'dropbox' | 'onedrive' | 'zapier',
  config: Partial<OAuthConfig> = {}
): string {
  // Get the current origin for the redirect URI
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  
  // Use default config with overrides
  const fullConfig: OAuthConfig = {
    ...DEFAULT_OAUTH_CONFIG,
    scopes: SERVICE_SCOPES[service] || [],
    ...config
  };
  
  // Create full redirect URI with origin
  const redirectUri = origin + fullConfig.redirectUri;
  
  // Generate state parameter for security
  const state = fullConfig.state || Math.random().toString(36).substring(2);
  
  // Store auth state in localStorage if in browser context
  if (typeof window !== 'undefined') {
    localStorage.setItem('payrollpro_auth_state', JSON.stringify({
      service,
      state,
      timestamp: Date.now()
    }));
  }
  
  // Service-specific URL generation
  switch (service) {
    case 'google_drive':
      return `${OAUTH_URLS.google_drive}?` +
        `client_id=${fullConfig.clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=${fullConfig.responseType}&` +
        `scope=${encodeURIComponent(fullConfig.scopes.join(' '))}&` +
        `state=${encodeURIComponent(state)}&` +
        'access_type=offline&prompt=consent';
      
    case 'dropbox':
      return `${OAUTH_URLS.dropbox}?` +
        `client_id=${fullConfig.clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=${fullConfig.responseType}&` +
        `state=${encodeURIComponent(state)}`;
      
    case 'onedrive':
      return `${OAUTH_URLS.onedrive}?` +
        `client_id=${fullConfig.clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=${fullConfig.responseType}&` +
        `scope=${encodeURIComponent(fullConfig.scopes.join(' '))}&` +
        `state=${encodeURIComponent(state)}`;
      
    case 'zapier':
      return `${OAUTH_URLS.zapier}?` +
        'utm_source=payrollpro&' +
        'utm_medium=integration&' +
        'utm_campaign=payroll_integration';
      
    default:
      throw new Error(`Unsupported OAuth service: ${service}`);
  }
}

/**
 * Start the OAuth flow by opening a popup window
 */
export function startOAuthPopupFlow(
  service: 'google_drive' | 'dropbox' | 'onedrive' | 'zapier',
  config: Partial<OAuthConfig> = {}
): Window | null {
  const authUrl = generateOAuthUrl(service, config);
  
  // Save service info
  if (typeof window !== 'undefined') {
    localStorage.setItem('payrollpro_oauth_service', service);
    
    // Open popup window
    return window.open(
      authUrl,
      'oauth-popup',
      'width=600,height=700,menubar=no,toolbar=no,location=no,status=no'
    );
  }
  
  return null;
}

/**
 * Parse access token from the redirect URL hash fragment
 */
export function parseAccessTokenFromHash(): { 
  accessToken?: string;
  error?: string;
  state?: string;
} {
  if (typeof window === 'undefined') {
    return {
      accessToken: undefined,
      error: undefined,
      state: undefined
    };
  }
  
  const fragment = window.location.hash.substring(1);
  const params = new URLSearchParams(fragment);
  
  return {
    accessToken: params.get('access_token') || undefined,
    error: params.get('error') || undefined,
    state: params.get('state') || undefined
  };
}

/**
 * Verify the OAuth state parameter to prevent CSRF attacks
 */
export function verifyOAuthState(state: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const storedStateJson = localStorage.getItem('payrollpro_auth_state');
  if (!storedStateJson) return false;
  
  try {
    const storedState = JSON.parse(storedStateJson);
    return storedState.state === state;
  } catch (e) {
    return false;
  }
}

/**
 * Get service-specific parameters for an OAuth flow
 */
export function getServiceSpecificParams(service: string): Record<string, string> {
  switch (service) {
    case 'google_drive':
      return {
        access_type: 'offline',
        prompt: 'consent'
      };
    case 'dropbox':
      return {};
    case 'onedrive':
      return {};
    case 'zapier':
      return {
        utm_source: 'payrollpro',
        utm_medium: 'integration',
        utm_campaign: 'payroll_integration'
      };
    default:
      return {};
  }
}