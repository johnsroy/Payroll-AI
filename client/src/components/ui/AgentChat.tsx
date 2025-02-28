import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, X, Plus } from "lucide-react";
import { Button } from "./button";
import { Textarea } from "./textarea";
import { Card } from "./card";
import { Avatar } from "./avatar";
import { Badge } from "./badge";
import { AgentType, processMultiAgentQuery, getAvailableAgents, processAgentQuery } from "@/lib/agentAPI";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  agentType?: AgentType;
  agentName?: string;
  agentsConsulted?: { type: AgentType; name: string }[];
  timestamp: Date;
}

interface AgentChatProps {
  className?: string;
  initialPrompt?: string;
  showAgentDetails?: boolean;
  useMultiAgent?: boolean;
}

export function AgentChat({ 
  className,
  initialPrompt,
  showAgentDetails = true,
  useMultiAgent = true
}: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableAgents, setAvailableAgents] = useState<{type: AgentType; name: string}[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch available agents on component mount
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const agents = await getAvailableAgents();
        setAvailableAgents(agents.map(a => ({ type: a.type, name: a.name })));
      } catch (err) {
        console.error('Failed to load agents:', err);
        setError('Failed to load available agents');
      }
    };
    
    loadAgents();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle message submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);
    
    try {
      if (useMultiAgent) {
        // Use multi-agent query
        const response = await processMultiAgentQuery(inputValue);
        
        const agentsConsulted = response.agentContributions.map(agent => ({
          type: agent.agentType,
          name: agent.agentName
        }));
        
        const assistantMessage: Message = {
          id: response.id,
          content: response.response,
          role: 'assistant',
          agentName: 'PayrollPro AI',
          agentsConsulted,
          timestamp: new Date(response.timestamp)
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else if (selectedAgent) {
        // Use specific agent
        const response = await processAgentQuery(inputValue, selectedAgent);
        
        const assistantMessage: Message = {
          id: response.id,
          content: response.response,
          role: 'assistant',
          agentType: response.agentType,
          agentName: response.agentName,
          timestamp: new Date(response.timestamp)
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // No agent selected, use reasoning agent as default
        const response = await processAgentQuery(inputValue, 'reasoning');
        
        const assistantMessage: Message = {
          id: response.id,
          content: response.response,
          role: 'assistant',
          agentType: 'reasoning',
          agentName: response.agentName,
          timestamp: new Date(response.timestamp)
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error('Error processing query:', err);
      setError('Failed to process your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle textarea input (including Shift+Enter for new lines)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Adjust textarea height based on content
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className={cn("flex flex-col h-[600px] rounded-lg border", className)}>
      {/* Agent selection header */}
      {!useMultiAgent && (
        <div className="p-3 border-b flex items-center gap-2 overflow-x-auto">
          <span className="text-sm font-medium text-muted-foreground">Agent:</span>
          <div className="flex gap-1 flex-wrap">
            {availableAgents.map((agent) => (
              <Button
                key={agent.type}
                size="sm"
                variant={selectedAgent === agent.type ? "default" : "outline"}
                className="h-7 rounded-full text-xs"
                onClick={() => setSelectedAgent(agent.type)}
              >
                {agent.name}
              </Button>
            ))}
            {selectedAgent && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 rounded-full"
                onClick={() => setSelectedAgent(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">PayrollPro AI Assistant</h3>
            <p className="text-muted-foreground max-w-md">
              Ask me anything about payroll, taxes, expenses, compliance, or any financial data analysis.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 max-w-full",
                message.role === "user" && "justify-end"
              )}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 border">
                  <Bot className="h-4 w-4" />
                </Avatar>
              )}
              <div className={cn("flex flex-col max-w-[80%]")}>
                <Card
                  className={cn(
                    "p-3 whitespace-pre-wrap",
                    message.role === "user" ? "bg-primary text-primary-foreground" : ""
                  )}
                >
                  {message.role === "assistant" && message.agentName && (
                    <div className="mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        {message.agentName}
                      </span>
                    </div>
                  )}
                  {message.content}
                  
                  {/* Show agents consulted */}
                  {showAgentDetails && message.role === "assistant" && message.agentsConsulted && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      <span className="text-xs text-muted-foreground w-full">Agents consulted:</span>
                      {message.agentsConsulted.map((agent) => (
                        <Badge key={agent.type} variant="outline" className="text-xs">
                          {agent.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Card>
                <span className="text-xs text-muted-foreground mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {message.role === "user" && (
                <Avatar className="h-8 w-8 border">
                  <div className="text-xs font-medium">You</div>
                </Avatar>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {error && (
          <div className="bg-destructive/10 text-destructive text-center p-2 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about payroll, taxes, expenses, compliance..."
            className="min-h-[60px] flex-1 resize-none"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !inputValue.trim()}
            className="h-[60px] w-[60px] shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}