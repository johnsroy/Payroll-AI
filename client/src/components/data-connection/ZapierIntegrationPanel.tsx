import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, ExternalLink, Zap } from 'lucide-react';

/**
 * ZapierIntegration namespace to avoid naming conflicts
 */
namespace ZapierIntegration {
  /**
   * Zapier application definition
   */
  export interface ZapierApp {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    zapCount: number; // Number of Zaps created with this app
  }

  /**
   * A specific Zap (Zapier workflow)
   */
  export interface Zap {
    id: string;
    title: string;
    description?: string;
    status: 'enabled' | 'disabled' | 'draft';
    lastModified: Date;
  }

  /**
   * Zap template definition
   */
  export interface ZapTemplate {
    id: string;
    title: string;
    description: string;
    services: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    category: 'payroll' | 'accounting' | 'hr' | 'taxes' | 'onboarding';
    url: string;
  }
}

/**
 * Predefined Zapier templates for payroll
 */
const PAYROLL_ZAP_TEMPLATES: ZapierIntegration.ZapTemplate[] = [
  {
    id: 'template-1',
    title: 'Create QuickBooks timesheets from Timecamp entries',
    description: 'Automatically create QuickBooks timesheets when time entries are recorded in Timecamp',
    services: ['QuickBooks', 'Timecamp'],
    difficulty: 'beginner',
    category: 'payroll',
    url: 'https://zapier.com/apps/quickbooks-online/integrations/timecamp'
  },
  {
    id: 'template-2',
    title: 'Create Stripe invoices from new Toggl time entries',
    description: 'Bill clients automatically by creating Stripe invoices from your Toggl time tracking',
    services: ['Stripe', 'Toggl'],
    difficulty: 'intermediate',
    category: 'payroll',
    url: 'https://zapier.com/apps/stripe/integrations/toggl'
  },
  {
    id: 'template-3',
    title: 'Add new employees to payroll system from Google Forms responses',
    description: 'When a new Google Forms submission is received, add the employee to your payroll system',
    services: ['Google Forms', 'Gusto'],
    difficulty: 'beginner',
    category: 'onboarding',
    url: 'https://zapier.com/apps/google-forms/integrations/gusto'
  },
  {
    id: 'template-4',
    title: 'Send Slack reminders when timesheets are due',
    description: 'Automatically send reminders in Slack when employee timesheets are due',
    services: ['Slack', 'Calendar'],
    difficulty: 'beginner',
    category: 'payroll',
    url: 'https://zapier.com/apps/slack/integrations/google-calendar'
  },
  {
    id: 'template-5',
    title: 'Export payroll reports to Google Sheets',
    description: 'Automatically export payroll reports to Google Sheets for easy analysis',
    services: ['Google Sheets', 'ADP'],
    difficulty: 'intermediate',
    category: 'accounting',
    url: 'https://zapier.com/apps/google-sheets/integrations/adp'
  }
];

/**
 * Popular Zapier apps for payroll integration
 */
const POPULAR_PAYROLL_APPS: ZapierIntegration.ZapierApp[] = [
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Accounting software for small businesses',
    iconUrl: 'https://cdn.zapier.com/storage/developer/b62e1bbc6cb428055c6d35814a1c5ca0.128x128.png',
    zapCount: 5000
  },
  {
    id: 'gusto',
    name: 'Gusto',
    description: 'Payroll, benefits & HR for modern companies',
    iconUrl: 'https://cdn.zapier.com/storage/developer/ffc70e88db1abb736a7b843f5e7f3938.128x128.png',
    zapCount: 3000
  },
  {
    id: 'adp',
    name: 'ADP',
    description: 'Payroll, HR, and tax services',
    iconUrl: 'https://cdn.zapier.com/storage/developer/512d8ebf5d0ab697795e32e323bcccb9.128x128.png',
    zapCount: 2500
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing platform',
    iconUrl: 'https://cdn.zapier.com/storage/developer/bb67755165878423e5ac0cce84fbc5f5_2.128x128.png',
    zapCount: 10000
  },
  {
    id: 'xero',
    name: 'Xero',
    description: 'Online accounting software for small businesses',
    iconUrl: 'https://cdn.zapier.com/storage/developer/e1621c977a961b8c69a2530cc9f358fb.128x128.png',
    zapCount: 4000
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    description: 'Create and edit spreadsheets',
    iconUrl: 'https://cdn.zapier.com/storage/developer/6d497a42eac82dd5a708e905c5d14e93.128x128.png',
    zapCount: 15000
  }
];

/**
 * Zapier Integration Panel Component
 */
interface ZapierIntegrationPanelProps {
  className?: string;
  onConnectZapier?: () => void;
  zapierApps?: ZapierIntegration.ZapierApp[];
  templates?: ZapierIntegration.ZapTemplate[];
}

export function ZapierIntegrationPanel({ 
  className,
  onConnectZapier,
  zapierApps = POPULAR_PAYROLL_APPS,
  templates = PAYROLL_ZAP_TEMPLATES
}: ZapierIntegrationPanelProps) {
  const [activeTab, setActiveTab] = useState('templates');
  const [apiKey, setApiKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      if (onConnectZapier) {
        onConnectZapier();
      }
    }, 1500);
  };

  return (
    <div className={className}>
      <Tabs defaultValue="templates" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Zap Templates</TabsTrigger>
          <TabsTrigger value="apps">Popular Apps</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Payroll Zap Templates</h3>
            <Button variant="outline" size="sm" onClick={() => window.open('https://zapier.com/apps/categories/payroll', '_blank')}>
              Browse More
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-base">{template.title}</CardTitle>
                    <Badge variant={
                      template.difficulty === 'beginner' ? 'default' :
                      template.difficulty === 'intermediate' ? 'secondary' : 'outline'
                    }>
                      {template.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-wrap gap-2">
                    {template.services.map(service => (
                      <Badge key={service} variant="outline">{service}</Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => window.open(template.url, '_blank')}>
                    Use This Zap
                    <Zap className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="apps" className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Popular Payroll Apps</h3>
            <Button variant="outline" size="sm" onClick={() => window.open('https://zapier.com/apps', '_blank')}>
              View All Apps
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
            {zapierApps.map((app) => (
              <Card key={app.id} className="flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded overflow-hidden">
                      <img 
                        src={app.iconUrl} 
                        alt={app.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                        }}
                      />
                    </div>
                    <CardTitle className="text-sm">{app.name}</CardTitle>
                  </div>
                  <CardDescription className="text-xs line-clamp-2">
                    {app.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => window.open(`https://zapier.com/apps/${app.id.toLowerCase()}/integrations`, '_blank')}
                  >
                    Browse Zaps
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Zapier Connection Settings</CardTitle>
              <CardDescription>
                Connect your Zapier account to integrate with 5,000+ apps and automate your payroll workflow.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isConnected ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-key">Zapier API Key (Optional)</Label>
                    <Input
                      id="api-key"
                      placeholder="Your Zapier API Key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                    <p className="text-sm text-gray-500">
                      The API key is only required for automated Zap creation. You can still browse and use Zaps without it.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded-md">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-green-600" />
                      </span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Connected to Zapier</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>Your PayrollPro AI platform is now connected to Zapier. You can create and use Zaps with your payroll data.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            
            {!isConnected && (
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => window.open('https://zapier.com/app/dashboard', '_blank')}>
                  Open Zapier Dashboard
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
                <Button onClick={handleConnect} disabled={isConnecting}>
                  {isConnecting ? (
                    <>
                      <span className="animate-spin mr-2">⚙️</span>
                      Connecting...
                    </>
                  ) : (
                    <>
                      Connect with Zapier
                      <Zap className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}