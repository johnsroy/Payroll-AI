/**
 * Zapier Integration module for PayrollPro AI
 * 
 * This module provides utilities for connecting to Zapier and managing
 * integrations with other services through the Zapier API.
 */

/**
 * Zapier integration configuration
 */
export interface ZapierConfig {
  apiKey?: string;
  accountId?: string;
  redirectUri?: string;
}

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
  triggers: ZapTrigger[];
  actions: ZapAction[];
}

/**
 * Zap trigger definition
 */
export interface ZapTrigger {
  id: string;
  appId: string;
  appName: string;
  description: string;
  triggerEvent: string;
}

/**
 * Zap action definition
 */
export interface ZapAction {
  id: string;
  appId: string;
  appName: string;
  description: string;
  actionEvent: string;
}

/**
 * Execute a Zap functionality
 */
export interface ZapExecution {
  zapId: string;
  status: 'success' | 'error' | 'pending';
  timestamp: Date;
  inputData: Record<string, any>;
  outputData?: Record<string, any>;
  error?: string;
}

/**
 * Payroll-specific Zapier template definitions
 */
export const PAYROLL_ZAP_TEMPLATES = [
  {
    id: 'payroll-google-sheets',
    name: 'Payroll to Google Sheets',
    description: 'Automatically send payroll data to Google Sheets when processed',
    trigger: {
      appName: 'PayrollPro AI',
      triggerEvent: 'payroll_processed'
    },
    action: {
      appName: 'Google Sheets',
      actionEvent: 'create_spreadsheet_row'
    },
    popularityScore: 95
  },
  {
    id: 'payroll-slack-notification',
    name: 'Payroll Slack Notifications',
    description: 'Send notifications to Slack when payroll is approved or needs attention',
    trigger: {
      appName: 'PayrollPro AI',
      triggerEvent: 'payroll_status_changed'
    },
    action: {
      appName: 'Slack',
      actionEvent: 'send_channel_message'
    },
    popularityScore: 87
  },
  {
    id: 'new-employee-onboarding',
    name: 'New Employee Onboarding',
    description: 'Trigger an onboarding workflow when a new employee is added to payroll',
    trigger: {
      appName: 'PayrollPro AI',
      triggerEvent: 'employee_added'
    },
    action: {
      appName: 'Multiple Apps',
      actionEvent: 'multi_step_workflow'
    },
    popularityScore: 82
  },
  {
    id: 'quickbooks-sync',
    name: 'QuickBooks Integration',
    description: 'Sync payroll data with QuickBooks for accounting',
    trigger: {
      appName: 'PayrollPro AI',
      triggerEvent: 'payroll_finalized'
    },
    action: {
      appName: 'QuickBooks',
      actionEvent: 'create_journal_entry'
    },
    popularityScore: 91
  },
  {
    id: 'tax-filing-reminder',
    name: 'Tax Filing Reminders',
    description: 'Send email reminders for upcoming tax filing deadlines',
    trigger: {
      appName: 'PayrollPro AI',
      triggerEvent: 'tax_deadline_approaching'
    },
    action: {
      appName: 'Gmail',
      actionEvent: 'send_email'
    },
    popularityScore: 75
  },
];

/**
 * Get most popular Zapier application integrations for payroll
 */
export function getPopularPayrollApps(): ZapierApp[] {
  // This would typically come from an API call to Zapier
  // Mocked implementation for demo purposes
  return [
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      description: 'Connect your accounting software with your payroll data',
      iconUrl: 'https://cdn.zapier.com/storage/services/54f0bd6f9c31b757b9b0d7f1fbc20420.png',
      zapCount: 1245
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Send payroll notifications to your team channels',
      iconUrl: 'https://cdn.zapier.com/storage/services/da3ff465abd3a3e1b687c36e1cb16cce.png',
      zapCount: 982
    },
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      description: 'Export and analyze payroll data in spreadsheets',
      iconUrl: 'https://cdn.zapier.com/storage/services/62c82a8d3a2efff75068b1b5587d3a08.png',
      zapCount: 1678
    },
    {
      id: 'xero',
      name: 'Xero',
      description: 'Connect your Xero accounting with payroll',
      iconUrl: 'https://cdn.zapier.com/storage/services/1508df9b34c46e1998ffde9550ca7942.png',
      zapCount: 567
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Send automated payroll reports via email',
      iconUrl: 'https://cdn.zapier.com/storage/services/6cf3f5a461feadfba7abc93c4c395f33.png',
      zapCount: 845
    }
  ];
}

/**
 * Connect to Zapier API
 */
export async function connectToZapier(apiKey: string): Promise<boolean> {
  // This would typically validate the API key with Zapier
  // Mocked implementation for demo purposes
  try {
    console.log('Connecting to Zapier with API key:', apiKey);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  } catch (error) {
    console.error('Error connecting to Zapier:', error);
    return false;
  }
}

/**
 * Get user's Zaps
 */
export async function getUserZaps(): Promise<Zap[]> {
  // This would typically fetch from Zapier API
  // Mocked implementation for demo purposes
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return mock data
    return [
      {
        id: 'zap-123',
        title: 'Send Payroll Reports to Google Sheets',
        status: 'enabled',
        lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        triggers: [
          {
            id: 'trigger-1',
            appId: 'payrollpro',
            appName: 'PayrollPro AI',
            description: 'When a payroll report is generated',
            triggerEvent: 'payroll_report_generated'
          }
        ],
        actions: [
          {
            id: 'action-1',
            appId: 'google-sheets',
            appName: 'Google Sheets',
            description: 'Create a new row in "Payroll Reports" spreadsheet',
            actionEvent: 'create_spreadsheet_row'
          }
        ]
      },
      {
        id: 'zap-456',
        title: 'Tax Filing Deadline Notifications',
        status: 'enabled',
        lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        triggers: [
          {
            id: 'trigger-2',
            appId: 'payrollpro',
            appName: 'PayrollPro AI',
            description: 'When a tax filing deadline is approaching',
            triggerEvent: 'tax_deadline_approaching'
          }
        ],
        actions: [
          {
            id: 'action-2',
            appId: 'slack',
            appName: 'Slack',
            description: 'Send a message to #finance channel',
            actionEvent: 'send_channel_message'
          }
        ]
      }
    ];
  } catch (error) {
    console.error('Error fetching user Zaps:', error);
    return [];
  }
}

/**
 * Create a new Zap from a template
 */
export async function createZapFromTemplate(templateId: string, customConfig: any): Promise<Zap | null> {
  // This would typically create a Zap via Zapier API
  // Mocked implementation for demo purposes
  try {
    console.log(`Creating Zap from template ${templateId} with config:`, customConfig);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const template = PAYROLL_ZAP_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template not found');
    }
    
    // Return a mock Zap based on the template
    return {
      id: `zap-${Date.now().toString().slice(-6)}`,
      title: template.name,
      description: template.description,
      status: 'draft',
      lastModified: new Date(),
      triggers: [
        {
          id: `trigger-${Date.now().toString().slice(-4)}`,
          appId: template.trigger.appName.toLowerCase().replace(' ', '-'),
          appName: template.trigger.appName,
          description: `When ${template.trigger.triggerEvent.replace('_', ' ')}`,
          triggerEvent: template.trigger.triggerEvent
        }
      ],
      actions: [
        {
          id: `action-${Date.now().toString().slice(-4)}`,
          appId: template.action.appName.toLowerCase().replace(' ', '-'),
          appName: template.action.appName,
          description: `${template.action.actionEvent.replace('_', ' ')}`,
          actionEvent: template.action.actionEvent
        }
      ]
    };
  } catch (error) {
    console.error('Error creating Zap from template:', error);
    return null;
  }
}

/**
 * Execute a Zap with specific data
 */
export async function executeZap(zapId: string, inputData: Record<string, any>): Promise<ZapExecution> {
  // This would typically execute a Zap via Zapier API
  // Mocked implementation for demo purposes
  try {
    console.log(`Executing Zap ${zapId} with data:`, inputData);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return mock execution result
    return {
      zapId,
      status: 'success',
      timestamp: new Date(),
      inputData,
      outputData: {
        result: 'Zap executed successfully',
        details: 'Data was processed and actions were performed'
      }
    };
  } catch (error) {
    console.error('Error executing Zap:', error);
    return {
      zapId,
      status: 'error',
      timestamp: new Date(),
      inputData,
      error: String(error)
    };
  }
}