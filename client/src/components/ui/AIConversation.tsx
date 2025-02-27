import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, Brain, History, X, User, RotateCcw } from 'lucide-react';
import { Button } from './button';
import { Textarea } from './textarea';
import { Avatar } from './avatar';
import { Card } from './card';
import { Separator } from './separator';
import { Badge } from './badge';
import { AgentType } from '../../lib/agentOrchestrator';
import { useAI } from '../../lib/aiContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { ScrollArea } from './scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

interface AIConversationProps {
  showAgentSwitcher?: boolean;
  showReasoningView?: boolean;
  maxHeight?: string;
}

export default function AIConversation({ 
  showAgentSwitcher = true,
  showReasoningView = true,
  maxHeight = '70vh'
}: AIConversationProps) {
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    clearConversation, 
    availableAgents,
    reasoning
  } = useAI();
  
  const [messageText, setMessageText] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'reasoning'>('chat');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [messageText]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (messageText.trim() && !isLoading) {
      sendMessage(messageText);
      setMessageText('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'inherit';
      }
    }
  };
  
  // Handle textarea keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Card className="flex flex-col w-full bg-background">
      {/* Header with tabs */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Assistant</h3>
          
          {showAgentSwitcher && availableAgents.length > 0 && (
            <div className="ml-4">
              <AgentSwitcher agents={availableAgents} />
            </div>
          )}
        </div>
        
        {showReasoningView && (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'chat' | 'reasoning')} className="w-auto">
            <TabsList>
              <TabsTrigger value="chat" className="text-sm">
                Chat
              </TabsTrigger>
              <TabsTrigger value="reasoning" className="text-sm">
                Reasoning
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={clearConversation}
          title="Clear conversation"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Conversation Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' ? (
          <ScrollArea className="h-full" style={{ maxHeight }}>
            <div className="flex flex-col p-4 gap-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Bot className="h-12 w-12 mb-4 opacity-50" />
                  <p>No messages yet. Start a conversation!</p>
                  <div className="mt-8 grid grid-cols-2 gap-3">
                    <SuggestionButton 
                      text="Calculate payroll taxes for a $75,000 salary in California" 
                      onClick={(text) => {
                        setMessageText(text);
                        if (textareaRef.current) {
                          textareaRef.current.focus();
                        }
                      }}
                    />
                    <SuggestionButton 
                      text="What documentation do I need for employee expense reimbursements?" 
                      onClick={(text) => {
                        setMessageText(text);
                        if (textareaRef.current) {
                          textareaRef.current.focus();
                        }
                      }}
                    />
                    <SuggestionButton 
                      text="Compare federal vs. state requirements for new hire reporting" 
                      onClick={(text) => {
                        setMessageText(text);
                        if (textareaRef.current) {
                          textareaRef.current.focus();
                        }
                      }}
                    />
                    <SuggestionButton 
                      text="Analyze YTD overtime trends in our payroll data" 
                      onClick={(text) => {
                        setMessageText(text);
                        if (textareaRef.current) {
                          textareaRef.current.focus();
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className="h-full" style={{ maxHeight }}>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">Reasoning Process</h3>
              {reasoning && reasoning.length > 0 ? (
                <div className="space-y-4">
                  {reasoning.map((step, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-muted/40">
                      <div className="font-medium mb-1">{step.step}</div>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {typeof step.data === 'object' 
                          ? JSON.stringify(step.data, null, 2)
                          : step.data
                        }
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(step.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-6">
                  <p>No reasoning data available.</p>
                  <p className="text-sm mt-2">Send a message to see the AI's reasoning process.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
      
      {/* Input Area */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 min-h-10 resize-none"
            rows={1}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !messageText.trim()}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </Card>
  );
}

// Agent Switcher Component
function AgentSwitcher({ agents }: { agents: any[] }) {
  const { activeAgentType, setActiveAgent } = useAI();
  
  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={activeAgentType === null ? "default" : "outline"} 
              size="sm"
              className="h-8 text-xs"
              onClick={() => setActiveAgent(null)}
            >
              <Brain className="h-3 w-3 mr-1" />
              Multi-Agent
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Use all agents in coordination</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {agents.map((agent) => (
        <TooltipProvider key={agent.type}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={activeAgentType === agent.type ? "default" : "outline"} 
                size="sm"
                className="h-8 text-xs"
                onClick={() => setActiveAgent(agent.type)}
              >
                {getAgentIcon(agent.type)}
                {agent.name}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{agent.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
}

// Message Bubble Component
function MessageBubble({ message }: { message: any }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-2 max-w-[80%]`}>
        <Avatar className={`h-8 w-8 ${isUser ? 'bg-primary' : 'bg-muted'}`}>
          {isUser ? (
            <User className="h-4 w-4 text-primary-foreground" />
          ) : (
            <Bot className="h-4 w-4 text-muted-foreground" />
          )}
        </Avatar>
        
        <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
          {!isUser && message.agentsConsulted && message.agentsConsulted.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1">
              {message.agentsConsulted.map((agent: AgentType) => (
                <Badge key={agent} variant="outline" className="text-xs py-0">
                  {agent}
                </Badge>
              ))}
            </div>
          )}
          
          <div className={`rounded-lg p-3 ${
            isUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted'
          }`}>
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
          
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}

// Suggestion Button Component
function SuggestionButton({ text, onClick }: { text: string, onClick: (text: string) => void }) {
  return (
    <button
      className="rounded-lg border p-3 text-sm text-left hover:bg-muted transition-colors"
      onClick={() => onClick(text)}
    >
      {text}
    </button>
  );
}

// Helper function to get agent icon
function getAgentIcon(agentType: AgentType) {
  switch (agentType) {
    case 'tax':
      return <History className="h-3 w-3 mr-1" />;
    case 'expense':
      return <History className="h-3 w-3 mr-1" />;
    case 'compliance':
      return <History className="h-3 w-3 mr-1" />;
    default:
      return <Bot className="h-3 w-3 mr-1" />;
  }
}