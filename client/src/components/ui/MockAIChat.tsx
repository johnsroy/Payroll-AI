"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Trash2, Loader2, User, X, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MockAIChatProps {
  className?: string;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

export function MockAIChat({ 
  className,
  expanded = false,
  onToggleExpand
}: MockAIChatProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{id: string; role: 'user' | 'assistant'; content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      // Add user message
      const newUserMessage = {
        id: Date.now().toString(),
        role: 'user' as const,
        content: input.trim()
      };
      
      setMessages(prev => [...prev, newUserMessage]);
      setInput('');
      setIsLoading(true);
      
      // Simulate AI response after a delay
      setTimeout(() => {
        const newAssistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: `I'm a demo AI assistant. You asked: "${input.trim()}". In a real implementation, this would be processed by our specialized AI agents.`
        };
        
        setMessages(prev => [...prev, newAssistantMessage]);
        setIsLoading(false);
      }, 1500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: 0.15
      }}
    >
      <Card className={cn("flex flex-col overflow-hidden", 
        expanded ? "fixed inset-0 z-50 rounded-none" : "h-[500px] w-full max-w-md rounded-lg shadow-lg border-primary/10", 
        className)}>
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between px-4 py-3 border-b bg-primary/5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 15, 0] }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-primary/10 p-1.5 rounded-full"
            >
              <Bot className="h-5 w-5 text-primary" />
            </motion.div>
            <div className="font-medium flex items-center">
              <motion.span
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.2 }}
              >
                Payroll Assistant Demo
              </motion.span>
              <motion.div 
                className="flex h-2 w-2 ml-2 relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <motion.span 
                  className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
                />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </motion.div>
            </div>
          </div>
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={clearChat} 
                title="Clear conversation"
                className="rounded-full h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
            {onToggleExpand && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onToggleExpand} 
                  title={expanded ? "Minimize" : "Maximize"}
                  className="rounded-full h-8 w-8"
                >
                  {expanded ? <X className="h-4 w-4" /> : <span className="text-xs font-bold">□</span>}
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <motion.div 
                className="relative text-center p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent rounded-lg opacity-70"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.7 }}
                  transition={{ delay: 0.5, duration: 0.7 }}
                />
                
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring", 
                    delay: 0.7, 
                    stiffness: 300 
                  }}
                  className="bg-primary/10 h-16 w-16 mx-auto mb-4 rounded-full flex items-center justify-center shadow-md"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <Bot className="h-8 w-8 text-primary" />
                  </motion.div>
                </motion.div>
                
                <motion.h3
                  className="text-lg font-semibold text-foreground mb-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  AI Payroll Assistant
                </motion.h3>
                
                <motion.p 
                  className="text-sm text-muted-foreground mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                >
                  Powered by advanced AI agents for tax, expense, and compliance expertise
                </motion.p>
                
                <motion.div 
                  className="grid gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                >
                  <h4 className="text-sm font-medium mb-1">Try asking about:</h4>
                  <div className="grid gap-2">
                    {[
                      "How do I calculate payroll taxes for a new employee?",
                      "What tax forms do I need to file this quarter?",
                      "Help me categorize office supplies for tax deductions",
                      "Explain 401(k) matching requirements for small businesses"
                    ].map((suggestion, i) => (
                      <SuggestionButton key={i} onClick={() => setInput(suggestion)}>
                        {suggestion}
                      </SuggestionButton>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}
            
            {/* Loading indicator */}
            {isLoading && (
              <motion.div 
                className="flex flex-col items-center p-4 text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <motion.div 
                    className="absolute inset-0 rounded-full"
                    animate={{ 
                      boxShadow: ["0 0 0 0 rgba(var(--primary), 0.2)", "0 0 0 10px rgba(var(--primary), 0)"] 
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeOut" 
                    }}
                  />
                </div>
                <div className="flex items-center mt-2">
                  <motion.span 
                    className="text-sm font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ 
                      delay: 0.5,
                      duration: 0.5 
                    }}
                  >
                    AI thinking
                  </motion.span>
                  <motion.span
                    className="ml-1 inline-flex"
                    animate={{
                      opacity: [0, 1, 1, 1, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      times: [0, 0.2, 0.4, 0.6, 1],
                    }}
                  >
                    ...
                  </motion.span>
                </div>
              </motion.div>
            )}
            
            {/* Error message */}
            {error && (
              <motion.div 
                className="flex items-center gap-3 bg-destructive/10 p-4 rounded-lg"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 500,
                  damping: 30
                }}
              >
                <div className="bg-destructive/20 h-8 w-8 rounded-full flex items-center justify-center text-destructive">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <X className="h-4 w-4" />
                  </motion.div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-destructive mb-1">Error Occurred</h4>
                  <p className="text-destructive/80 text-sm">{error}</p>
                </div>
              </motion.div>
            )}
            
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input area */}
        <motion.form 
          onSubmit={handleSubmit} 
          className="border-t p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex gap-2 items-center">
            <motion.div 
              className="relative flex-1"
              whileHover={{ scale: 1.01 }}
              whileFocus={{ scale: 1.01 }}
            >
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about payroll..."
                className="min-h-[60px] resize-none pr-10 shadow-sm"
                disabled={isLoading}
              />
              {input.length > 0 && (
                <motion.div 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {input.length} chars
                </motion.div>
              )}
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading || !input.trim()}
                className="rounded-full h-12 w-12 bg-primary shadow-md"
              >
                <Send className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </motion.form>
      </Card>
    </motion.div>
  );
}

interface MessageBubbleProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
  };
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8, y: 20 }} 
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <Avatar className="h-8 w-8 bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </Avatar>
        </motion.div>
      )}
      <motion.div 
        className={cn(
          "rounded-lg p-3 max-w-[80%]",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted"
        )}
        whileHover={{ scale: 1.02 }}
      >
        <div className="whitespace-pre-wrap text-sm">
          {message.content}
        </div>
      </motion.div>
      {isUser && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <Avatar className="h-8 w-8 bg-primary">
            <User className="h-4 w-4 text-primary-foreground" />
          </Avatar>
        </motion.div>
      )}
    </motion.div>
  );
}

interface SuggestionButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

function SuggestionButton({ 
  children, 
  onClick 
}: SuggestionButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 30,
        delay: Math.random() * 0.3 // Random delay for staggered effect
      }}
    >
      <motion.button 
        className="text-sm justify-start h-auto py-2 px-3 whitespace-normal text-left w-full group bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground"
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
          <span>{children}</span>
        </div>
      </motion.button>
    </motion.div>
  );
}