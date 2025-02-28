import { BaseAgent, AgentConfig, AgentResponse } from './baseAgent';
import { generateCompletion } from './openai';

/**
 * Data source type definitions
 */
export type DataSourceType = 'google_drive' | 'dropbox' | 'onedrive' | 'local';

/**
 * Data source connection status
 */
export type ConnectionStatus = 'connected' | 'disconnected' | 'pending' | 'error';

/**
 * Data source definition
 */
export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  status: ConnectionStatus;
  lastSynced?: Date;
  metadata: Record<string, any>;
  user_id?: string;
  company_id?: string;
}

/**
 * File definition from data sources
 */
export interface RemoteFile {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: Date;
  path: string;
  sourceId: string;
  url?: string;
  thumbnailUrl?: string;
}

/**
 * Data Connection Agent specializes in connecting and managing
 * external data sources for payroll and financial data
 */
export class DataConnectionAgent extends BaseAgent {
  private dataSources: Map<string, DataSource> = new Map();
  private tokens: Map<string, string> = new Map();

  /**
   * Tool definitions for the Data Connection Agent
   */
  private connectionTools = [
    {
      name: "get_data_sources",
      description: "Get a list of connected data sources for the current user or company",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            description: "Optional filter by data source type (google_drive, dropbox, onedrive, local)",
          },
          status: {
            type: "string",
            description: "Optional filter by connection status (connected, disconnected, pending, error)",
          }
        },
        required: []
      }
    },
    {
      name: "connect_data_source",
      description: "Initiate a connection to a new data source",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            description: "The type of data source to connect to (google_drive, dropbox, onedrive, local)",
          },
          name: {
            type: "string",
            description: "A user-friendly name for this data source connection",
          }
        },
        required: ["type", "name"]
      }
    },
    {
      name: "disconnect_data_source",
      description: "Disconnect from a data source",
      parameters: {
        type: "object",
        properties: {
          source_id: {
            type: "string",
            description: "The ID of the data source to disconnect from",
          }
        },
        required: ["source_id"]
      }
    },
    {
      name: "list_files",
      description: "List files from a connected data source",
      parameters: {
        type: "object",
        properties: {
          source_id: {
            type: "string",
            description: "The ID of the data source to list files from",
          },
          path: {
            type: "string",
            description: "Optional path within the data source to list files from",
          },
          file_type: {
            type: "string",
            description: "Optional filter by file type (csv, xlsx, pdf, etc.)",
          }
        },
        required: ["source_id"]
      }
    },
    {
      name: "get_file_details",
      description: "Get detailed information about a specific file",
      parameters: {
        type: "object",
        properties: {
          source_id: {
            type: "string",
            description: "The ID of the data source the file belongs to",
          },
          file_id: {
            type: "string",
            description: "The ID of the file to get details for",
          }
        },
        required: ["source_id", "file_id"]
      }
    },
    {
      name: "import_file",
      description: "Import a file from a data source into the system",
      parameters: {
        type: "object",
        properties: {
          source_id: {
            type: "string",
            description: "The ID of the data source the file belongs to",
          },
          file_id: {
            type: "string",
            description: "The ID of the file to import",
          },
          import_type: {
            type: "string",
            description: "The type of import to perform (payroll, employee, invoice, etc.)",
          }
        },
        required: ["source_id", "file_id", "import_type"]
      }
    }
  ];

  /**
   * Initialize the Data Connection Agent
   */
  constructor(config: AgentConfig = { name: "Data Connection Agent" }) {
    super({
      ...config,
      name: config.name || "Data Connection Agent",
      systemPrompt: config.systemPrompt || 
        `You are the Data Connection Agent, specialized in helping users connect to external data sources 
        and manage their data files. You can help users connect to services like Google Drive, Dropbox, 
        and OneDrive, as well as manage local file uploads. Your goal is to make it easy for users to 
        import payroll and financial data from their preferred storage services.
        
        You have access to tools that can list connected data sources, initiate new connections, 
        disconnect from sources, list files, get file details, and import files into the system.
        
        Always provide clear instructions and explain the benefits of connecting data sources.
        When a user wants to connect a data source, explain the process and what they can do once connected.`,
      tools: config.tools || []
    });

    // Add connection tools
    this.tools.push(...this.connectionTools);

    // Initialize mock data sources for demonstration
    this.initializeMockDataSources();
  }

  /**
   * Process a query using the data connection agent
   */
  public async processQuery(query: string): Promise<AgentResponse> {
    try {
      // Add the user's query to the conversation
      this.addMessage('user', query);

      // Get relevant context for the query
      const context = await this.getRelevantContext(query);
      
      let userMessage = query;
      if (context) {
        userMessage = `${query}\n\nRelevant context:\n${context}`;
      }

      // Get AI response with potential tool calls
      const response = await this.getAIResponse(userMessage, this.tools);
      
      // Parse and execute any tool calls
      const toolCallResults = await this.parseAndExecuteToolCalls(response, query);
      
      // Format the final response
      let finalResponse = response;
      if (toolCallResults.length > 0) {
        // Create a more friendly response using the tool call results
        finalResponse = this.formatResponseWithToolResults(response, toolCallResults);
      }
      
      // Add the assistant's response to the conversation
      this.addMessage('assistant', finalResponse);
      
      // Calculate confidence score
      const confidence = this.calculateConfidence(finalResponse, query);
      
      return {
        response: finalResponse,
        confidence,
        metadata: { 
          toolCalls: toolCallResults
        }
      };
    } catch (error) {
      console.error('Error processing query in DataConnectionAgent:', error);
      return {
        response: "I'm sorry, I encountered an error while processing your request. Please try again or contact support if the issue persists.",
        confidence: 0.1,
        metadata: { error: String(error) }
      };
    }
  }

  /**
   * Parse the AI response for tool calls and execute them
   */
  private async parseAndExecuteToolCalls(responseText: string, query: string): Promise<any[]> {
    const toolCallResults = [];
    
    // Regular expressions to identify tool calls
    const getDataSourcesRegex = /get_data_sources\s*\(([^)]*)\)/g;
    const connectDataSourceRegex = /connect_data_source\s*\(\s*type\s*:\s*['"]([^'"]+)['"],\s*name\s*:\s*['"]([^'"]+)['"]\s*\)/g;
    const disconnectDataSourceRegex = /disconnect_data_source\s*\(\s*source_id\s*:\s*['"]([^'"]+)['"]\s*\)/g;
    const listFilesRegex = /list_files\s*\(\s*source_id\s*:\s*['"]([^'"]+)['"](?:,\s*path\s*:\s*['"]([^'"]+)['"])?(?:,\s*file_type\s*:\s*['"]([^'"]+)['"])?\s*\)/g;
    const getFileDetailsRegex = /get_file_details\s*\(\s*source_id\s*:\s*['"]([^'"]+)['"],\s*file_id\s*:\s*['"]([^'"]+)['"]\s*\)/g;
    const importFileRegex = /import_file\s*\(\s*source_id\s*:\s*['"]([^'"]+)['"],\s*file_id\s*:\s*['"]([^'"]+)['"],\s*import_type\s*:\s*['"]([^'"]+)['"]\s*\)/g;
    
    // Extract and execute get_data_sources calls
    let match;
    while ((match = getDataSourcesRegex.exec(responseText)) !== null) {
      const params = match[1].trim();
      const result = await this.getDataSources(this.parseParameters(params));
      toolCallResults.push({
        name: "get_data_sources",
        arguments: params,
        result
      });
    }
    
    // Extract and execute connect_data_source calls
    while ((match = connectDataSourceRegex.exec(responseText)) !== null) {
      const type = match[1];
      const name = match[2];
      const result = await this.connectDataSource({ type, name });
      toolCallResults.push({
        name: "connect_data_source",
        arguments: { type, name },
        result
      });
    }
    
    // Extract and execute disconnect_data_source calls
    while ((match = disconnectDataSourceRegex.exec(responseText)) !== null) {
      const sourceId = match[1];
      const result = await this.disconnectDataSource({ source_id: sourceId });
      toolCallResults.push({
        name: "disconnect_data_source",
        arguments: { source_id: sourceId },
        result
      });
    }
    
    // Extract and execute list_files calls
    while ((match = listFilesRegex.exec(responseText)) !== null) {
      const sourceId = match[1];
      const path = match[2] || "";
      const fileType = match[3] || "";
      const result = await this.listFiles({ source_id: sourceId, path, file_type: fileType });
      toolCallResults.push({
        name: "list_files",
        arguments: { source_id: sourceId, path, file_type: fileType },
        result
      });
    }
    
    // Extract and execute get_file_details calls
    while ((match = getFileDetailsRegex.exec(responseText)) !== null) {
      const sourceId = match[1];
      const fileId = match[2];
      const result = await this.getFileDetails({ source_id: sourceId, file_id: fileId });
      toolCallResults.push({
        name: "get_file_details",
        arguments: { source_id: sourceId, file_id: fileId },
        result
      });
    }
    
    // Extract and execute import_file calls
    while ((match = importFileRegex.exec(responseText)) !== null) {
      const sourceId = match[1];
      const fileId = match[2];
      const importType = match[3];
      const result = await this.importFile({ source_id: sourceId, file_id: fileId, import_type: importType });
      toolCallResults.push({
        name: "import_file",
        arguments: { source_id: sourceId, file_id: fileId, import_type: importType },
        result
      });
    }
    
    return toolCallResults;
  }

  /**
   * Helper method to parse parameters from string
   */
  private parseParameters(paramsString: string): Record<string, any> {
    if (!paramsString) return {};
    
    const params: Record<string, any> = {};
    const keyValuePairs = paramsString.split(',');
    
    for (const pair of keyValuePairs) {
      if (pair.includes(':')) {
        let [key, value] = pair.split(':').map(s => s.trim());
        
        // Remove quotes if present
        if (value.startsWith('"') || value.startsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        
        params[key] = value;
      }
    }
    
    return params;
  }

  /**
   * Initialize mock data sources for demonstration
   */
  private initializeMockDataSources(): void {
    // Add some mock data sources
    const googleDrive: DataSource = {
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
    };
    
    const dropbox: DataSource = {
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
    };
    
    const onedrive: DataSource = {
      id: "od-001",
      name: "OneDrive - Personal",
      type: "onedrive",
      status: "disconnected",
      metadata: {
        email: "personal@example.com"
      }
    };
    
    this.dataSources.set(googleDrive.id, googleDrive);
    this.dataSources.set(dropbox.id, dropbox);
    this.dataSources.set(onedrive.id, onedrive);
  }

  /**
   * Get list of data sources
   */
  private async getDataSources(params: any): Promise<DataSource[]> {
    const { type, status } = params;
    
    let sources = Array.from(this.dataSources.values());
    
    // Apply filters if specified
    if (type) {
      sources = sources.filter(source => source.type === type);
    }
    
    if (status) {
      sources = sources.filter(source => source.status === status);
    }
    
    return sources;
  }

  /**
   * Connect to a new data source
   */
  private async connectDataSource(params: any): Promise<any> {
    const { type, name } = params;
    
    if (!type || !name) {
      return { success: false, error: "Type and name are required" };
    }
    
    // Validate data source type
    if (!['google_drive', 'dropbox', 'onedrive', 'local'].includes(type)) {
      return { success: false, error: "Invalid data source type" };
    }
    
    // Generate a unique ID
    const id = `${type.substring(0, 2)}-${Date.now().toString().substring(7)}`;
    
    // Create a new data source
    const newSource: DataSource = {
      id,
      name,
      type: type as DataSourceType,
      status: "connected",
      lastSynced: new Date(),
      metadata: {
        email: "user@example.com",
        quotaUsed: "0 GB",
        quotaTotal: type === 'google_drive' ? '15 GB' : '5 GB'
      }
    };
    
    this.dataSources.set(id, newSource);
    
    return { 
      success: true, 
      message: `Connected to ${name} successfully`, 
      data_source: newSource 
    };
  }

  /**
   * Disconnect from a data source
   */
  private async disconnectDataSource(params: any): Promise<any> {
    const { source_id } = params;
    
    if (!source_id) {
      return { success: false, error: "Source ID is required" };
    }
    
    const source = this.dataSources.get(source_id);
    
    if (!source) {
      return { success: false, error: "Data source not found" };
    }
    
    // Update the source status
    source.status = "disconnected";
    this.dataSources.set(source_id, source);
    
    // Remove any stored tokens
    this.tokens.delete(source_id);
    
    return { 
      success: true, 
      message: `Disconnected from ${source.name} successfully` 
    };
  }

  /**
   * List files from a data source
   */
  private async listFiles(params: any): Promise<any> {
    const { source_id, path = "", file_type = "" } = params;
    
    if (!source_id) {
      return { success: false, error: "Source ID is required" };
    }
    
    const source = this.dataSources.get(source_id);
    
    if (!source) {
      return { success: false, error: "Data source not found" };
    }
    
    if (source.status !== "connected") {
      return { success: false, error: "Data source is not connected" };
    }
    
    // Mock file listing
    const files: RemoteFile[] = [
      {
        id: "file-001",
        name: "Payroll_2023_Q4.xlsx",
        type: "xlsx",
        size: 2456789,
        lastModified: new Date(Date.now() - 7 * 86400000), // 7 days ago
        path: path || "/",
        sourceId: source_id
      },
      {
        id: "file-002",
        name: "Employee_Data.csv",
        type: "csv",
        size: 987654,
        lastModified: new Date(Date.now() - 14 * 86400000), // 14 days ago
        path: path || "/",
        sourceId: source_id
      },
      {
        id: "file-003",
        name: "Tax_Reports_2023.pdf",
        type: "pdf",
        size: 3456789,
        lastModified: new Date(Date.now() - 30 * 86400000), // 30 days ago
        path: path || "/",
        sourceId: source_id
      }
    ];
    
    // Apply file type filter if specified
    let filteredFiles = files;
    if (file_type) {
      filteredFiles = files.filter(file => file.type === file_type);
    }
    
    return { 
      success: true, 
      files: filteredFiles,
      path,
      source_name: source.name
    };
  }

  /**
   * Get details of a specific file
   */
  private async getFileDetails(params: any): Promise<any> {
    const { source_id, file_id } = params;
    
    if (!source_id || !file_id) {
      return { success: false, error: "Source ID and file ID are required" };
    }
    
    const source = this.dataSources.get(source_id);
    
    if (!source) {
      return { success: false, error: "Data source not found" };
    }
    
    if (source.status !== "connected") {
      return { success: false, error: "Data source is not connected" };
    }
    
    // Mock file details
    const fileDetails = {
      id: file_id,
      name: file_id === "file-001" ? "Payroll_2023_Q4.xlsx" : 
            file_id === "file-002" ? "Employee_Data.csv" : "Tax_Reports_2023.pdf",
      type: file_id === "file-001" ? "xlsx" : 
            file_id === "file-002" ? "csv" : "pdf",
      size: file_id === "file-001" ? 2456789 : 
            file_id === "file-002" ? 987654 : 3456789,
      lastModified: new Date(Date.now() - (file_id === "file-001" ? 7 : 
                                          file_id === "file-002" ? 14 : 30) * 86400000),
      path: "/",
      sourceId: source_id,
      createdBy: "John Doe",
      viewLink: `https://example.com/view/${file_id}`,
      downloadLink: `https://example.com/download/${file_id}`,
      preview: file_id === "file-001" ? 
        "Contains payroll data for 75 employees, including salary, taxes, and benefits for Q4 2023" : 
        file_id === "file-002" ? 
        "Contains basic employee information including IDs, names, departments, and hire dates" :
        "Annual tax reports including W-2 forms and tax payment summaries"
    };
    
    return { 
      success: true, 
      file: fileDetails,
      source_name: source.name
    };
  }

  /**
   * Import a file from a data source
   */
  private async importFile(params: any): Promise<any> {
    const { source_id, file_id, import_type } = params;
    
    if (!source_id || !file_id || !import_type) {
      return { success: false, error: "Source ID, file ID, and import type are required" };
    }
    
    const source = this.dataSources.get(source_id);
    
    if (!source) {
      return { success: false, error: "Data source not found" };
    }
    
    if (source.status !== "connected") {
      return { success: false, error: "Data source is not connected" };
    }
    
    // Check if import type is valid
    const validImportTypes = ['payroll', 'employee', 'invoice', 'expense', 'tax'];
    if (!validImportTypes.includes(import_type)) {
      return { success: false, error: "Invalid import type" };
    }
    
    // Mock file details
    const fileDetails = {
      id: file_id,
      name: file_id === "file-001" ? "Payroll_2023_Q4.xlsx" : 
            file_id === "file-002" ? "Employee_Data.csv" : "Tax_Reports_2023.pdf",
      type: file_id === "file-001" ? "xlsx" : 
            file_id === "file-002" ? "csv" : "pdf",
    };
    
    // Mock import result
    const importResult = {
      id: `import-${Date.now()}`,
      file: fileDetails,
      import_type,
      status: "completed",
      timestamp: new Date(),
      summary: import_type === 'payroll' ? 
        "Successfully imported payroll data for 75 employees" : 
        import_type === 'employee' ? 
        "Successfully imported 125 employee records" :
        "Successfully imported tax document"
    };
    
    return { 
      success: true, 
      import: importResult,
      source_name: source.name
    };
  }

  /**
   * Format the response with tool call results
   */
  private formatResponseWithToolResults(originalResponse: string, toolResults: any[]): string {
    // If there are no tool results, return the original response
    if (toolResults.length === 0) {
      return originalResponse;
    }
    
    // Start building a more natural response
    let formattedResponse = "";
    
    // Check for get_data_sources results
    const dataSourcesResults = toolResults.filter(result => result.name === "get_data_sources");
    if (dataSourcesResults.length > 0) {
      const sources = dataSourcesResults[0].result;
      formattedResponse += `You have ${sources.length} connected data source${sources.length !== 1 ? 's' : ''}:\n\n`;
      
      sources.forEach((source: DataSource) => {
        formattedResponse += `- **${source.name}** (${source.type.replace('_', ' ')}): ${source.status}\n`;
        if (source.lastSynced) {
          formattedResponse += `  Last synced: ${source.lastSynced.toLocaleString()}\n`;
        }
        formattedResponse += '\n';
      });
    }
    
    // Check for connect_data_source results
    const connectResults = toolResults.filter(result => result.name === "connect_data_source");
    if (connectResults.length > 0) {
      const result = connectResults[0].result;
      if (result.success) {
        formattedResponse += `✅ ${result.message}\n\n`;
      } else {
        formattedResponse += `❌ Failed to connect: ${result.error}\n\n`;
      }
    }
    
    // Check for disconnect_data_source results
    const disconnectResults = toolResults.filter(result => result.name === "disconnect_data_source");
    if (disconnectResults.length > 0) {
      const result = disconnectResults[0].result;
      if (result.success) {
        formattedResponse += `✅ ${result.message}\n\n`;
      } else {
        formattedResponse += `❌ Failed to disconnect: ${result.error}\n\n`;
      }
    }
    
    // Check for list_files results
    const listFilesResults = toolResults.filter(result => result.name === "list_files");
    if (listFilesResults.length > 0) {
      const result = listFilesResults[0].result;
      if (result.success) {
        formattedResponse += `Here are the files from ${result.source_name}${result.path !== '/' ? ` in ${result.path}` : ''}:\n\n`;
        
        result.files.forEach((file: RemoteFile) => {
          formattedResponse += `- **${file.name}** (${file.type.toUpperCase()})\n`;
          formattedResponse += `  Size: ${this.formatFileSize(file.size)}, Last modified: ${file.lastModified.toLocaleDateString()}\n\n`;
        });
      } else {
        formattedResponse += `❌ Failed to list files: ${result.error}\n\n`;
      }
    }
    
    // Check for get_file_details results
    const fileDetailsResults = toolResults.filter(result => result.name === "get_file_details");
    if (fileDetailsResults.length > 0) {
      const result = fileDetailsResults[0].result;
      if (result.success) {
        formattedResponse += `Here are the details for the file from ${result.source_name}:\n\n`;
        formattedResponse += `- **Name**: ${result.file.name}\n`;
        formattedResponse += `- **Type**: ${result.file.type.toUpperCase()}\n`;
        formattedResponse += `- **Size**: ${this.formatFileSize(result.file.size)}\n`;
        formattedResponse += `- **Last Modified**: ${result.file.lastModified.toLocaleDateString()}\n`;
        formattedResponse += `- **Created By**: ${result.file.createdBy}\n`;
        
        if (result.file.preview) {
          formattedResponse += `- **Preview**: ${result.file.preview}\n\n`;
        }
      } else {
        formattedResponse += `❌ Failed to get file details: ${result.error}\n\n`;
      }
    }
    
    // Check for import_file results
    const importFileResults = toolResults.filter(result => result.name === "import_file");
    if (importFileResults.length > 0) {
      const result = importFileResults[0].result;
      if (result.success) {
        formattedResponse += `✅ Successfully imported **${result.import.file.name}** from ${result.source_name}.\n\n`;
        formattedResponse += `**Import Summary**: ${result.import.summary}\n\n`;
      } else {
        formattedResponse += `❌ Failed to import file: ${result.error}\n\n`;
      }
    }
    
    // If we have a formatted response, use it, otherwise fall back to the original
    if (formattedResponse) {
      return formattedResponse;
    } else {
      return originalResponse;
    }
  }

  /**
   * Format file size in human-readable format
   */
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else if (bytes < 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    } else {
      return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    }
  }

  /**
   * Get AI response for the query
   */
  private async getAIResponse(query: string, tools: any[]): Promise<string> {
    try {
      // Build a system prompt that explains the available tools
      let toolsPrompt = 'You have access to the following tools:\n\n';
      
      tools.forEach(tool => {
        toolsPrompt += `- ${tool.name}: ${tool.description}\n`;
      });
      
      // Add instructions for tool usage format
      toolsPrompt += '\nWhen you want to use a tool, use the exact syntax like this:';
      toolsPrompt += '\nFor get_data_sources: get_data_sources()';
      toolsPrompt += '\nFor connect_data_source: connect_data_source(type: "google_drive", name: "My Google Drive")';
      toolsPrompt += '\nFor disconnect_data_source: disconnect_data_source(source_id: "source-id")';
      toolsPrompt += '\nFor list_files: list_files(source_id: "source-id", path: "/folder", file_type: "xlsx")';
      toolsPrompt += '\nFor get_file_details: get_file_details(source_id: "source-id", file_id: "file-id")';
      toolsPrompt += '\nFor import_file: import_file(source_id: "source-id", file_id: "file-id", import_type: "payroll")';
      
      // Get AI response using OpenAI
      const systemPrompt = `
        You are the Data Connection Agent, specialized in helping users connect to external data sources 
        and manage their data files. Your goal is to make it easy for users to import payroll and financial 
        data from their preferred storage services.
        
        ${toolsPrompt}
        
        Always use these tools when appropriate. First understand what the user is asking for, then decide 
        which tool to use. For example, if they ask about connected sources, use get_data_sources(). 
        If they want to connect to Google Drive, use connect_data_source().
        
        Be helpful, clear, and concise in your responses.
      `;
      
      const response = await generateCompletion(query, {
        systemPrompt,
        temperature: 0.3,
        maxTokens: 1000
      });
      
      return response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback to simpler responses in case of API error
      if (query.toLowerCase().includes('list') || query.toLowerCase().includes('sources')) {
        return "Let me check your connected data sources using get_data_sources()";
      } else if (query.toLowerCase().includes('connect')) {
        return "I'll connect you to a new data source. To do this, I'll need to know what type of source. For example: connect_data_source(type: \"google_drive\", name: \"My Google Drive\")";
      } else if (query.toLowerCase().includes('files')) {
        return "I can list files from your connected sources using list_files(source_id: \"gd-001\")";
      } else {
        return "I'm the Data Connection Agent. I can help you connect to external data sources and manage files. What would you like to do?";
      }
    }
  }

  /**
   * Get relevant context for a data connection query from the knowledge base
   * This could integrate with a vector database or other knowledge storage in a production system
   */
  protected async getRelevantContext(query: string): Promise<string | null> {
    // For now, provide some static context based on the query content
    if (query.toLowerCase().includes('google drive')) {
      return `
        Google Drive integration information:
        - Supports file types: documents, spreadsheets, PDFs, images
        - Authentication: OAuth 2.0
        - API limits: 1,000 requests per day per user
        - Common use cases: Importing payroll spreadsheets, employee documents, tax forms
      `;
    } 
    
    if (query.toLowerCase().includes('dropbox')) {
      return `
        Dropbox integration information:
        - Supports file types: all file types
        - Authentication: OAuth 2.0
        - API limits: 100,000 requests per day per app
        - Common use cases: Importing financial documents, receipts, expense reports
      `;
    }
    
    if (query.toLowerCase().includes('onedrive') || query.toLowerCase().includes('one drive')) {
      return `
        OneDrive integration information:
        - Supports file types: Office documents, PDFs, images, etc.
        - Authentication: Microsoft OAuth
        - API limits: Varies based on license type
        - Common use cases: Importing employee reviews, company policies, financial documents
      `;
    }
    
    // If query mentions files or formats
    if (query.toLowerCase().includes('file') || 
        query.toLowerCase().includes('format') || 
        query.toLowerCase().includes('import')) {
      return `
        Supported file formats for payroll data:
        - Excel (.xlsx, .xls): Best for structured payroll data
        - CSV (.csv): Good for simple data tables
        - PDF (.pdf): Good for official documents, but requires extraction
        - JSON (.json): Useful for system-to-system integration
        
        Common import types:
        - payroll: For payroll registers and run data
        - employee: For employee demographic data
        - expense: For expense reports and receipts
        - tax: For tax forms and documentation
      `;
    }
    
    return null;
  }
}