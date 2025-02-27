"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Trash2, Loader2, User, X } from 'lucide-react';
import { useAI } from '@/lib/aiContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AIMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  agentType?: string;
  agentName?: string;
}

export function AIChat({ 
  className,
  autoFocus = false,
  expanded = false,
  onToggleExpand
}: { 
  className?: string;
  autoFocus?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
}) {
  const { 
    messages, 
    isLoading, 
    error, 
    activeAgentName, 
    sendMessage, 
    clearConversation 
  } = useAI();
  
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when component mounts if autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    await sendMessage(input);
    setInput('');
    
    // Focus the input after sending
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Card className={cn("flex flex-col overflow-hidden", 
      expanded ? "fixed inset-0 z-50 rounded-none" : "h-[500px] w-full max-w-md rounded-lg shadow-lg", 
      className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <div className="font-medium">
            {activeAgentName || 'Payroll Assistant'}
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={clearConversation} title="Clear conversation">
            <Trash2 className="h-4 w-4" />
          </Button>
          {onToggleExpand && (
            <Button variant="ghost" size="icon" onClick={onToggleExpand} title={expanded ? "Minimize" : "Maximize"}>
              {expanded ? <X className="h-4 w-4" /> : <span className="text-xs font-bold">□</span>}
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              <Bot className="h-10 w-10 mx-auto mb-2 text-primary/40" />
              <p className="text-sm">How can I help you with payroll today?</p>
              <div className="mt-4 grid gap-2">
                <SuggestionButton onClick={(text) => setInput(text)}>
                  How do I calculate payroll taxes?
                </SuggestionButton>
                <SuggestionButton onClick={(text) => setInput(text)}>
                  What forms do I need to file this quarter?
                </SuggestionButton>
                <SuggestionButton onClick={(text) => setInput(text)}>
                  Help me categorize an office supply expense
                </SuggestionButton>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processing...</span>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="text-destructive text-sm bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}
          
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about payroll..."
            className="min-h-[60px] flex-1 resize-none"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}

function MessageBubble({ message }: { message: AIMessage }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="h-8 w-8 bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </Avatar>
      )}
      <div className={cn(
        "rounded-lg p-3 max-w-[80%]",
        isUser 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted"
      )}>
        <div className="space-y-2">
          {message.agentName && !isUser && (
            <Badge variant="outline" className="text-xs bg-background/50">
              {message.agentName}
            </Badge>
          )}
          <div className="whitespace-pre-wrap text-sm">
            {message.content}
          </div>
        </div>
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 bg-primary">
          <User className="h-4 w-4 text-primary-foreground" />
        </Avatar>
      )}
    </div>
  );
}

function SuggestionButton({ 
  children, 
  onClick 
}: { 
  children: React.ReactNode;
  onClick: (text: string) => void;
}) {
  return (
    <Button 
      variant="outline" 
      className="text-sm justify-start h-auto py-2 px-3 whitespace-normal text-left" 
      onClick={() => onClick(children?.toString() || '')}
    >
      {children}
    </Button>
  );
}