import { useState, useRef, useEffect } from "react";
import { Send, Bot, Trash2, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface SimpleMockAIChatProps {
  className?: string;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

export function SimpleMockAIChat({ 
  className,
  expanded = false,
  onToggleExpand
}: SimpleMockAIChatProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{id: string; role: "user" | "assistant"; content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      // Add user message
      const newUserMessage = {
        id: Date.now().toString(),
        role: "user" as const,
        content: input.trim()
      };
      
      setMessages(prev => [...prev, newUserMessage]);
      setInput("");
      setIsLoading(true);
      
      // Simulate AI response after a delay
      setTimeout(() => {
        const newAssistantMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant" as const,
          content: `I'm a demo AI assistant. You asked: "${input.trim()}". In a real implementation, this would be processed by our specialized AI agents.`
        };
        
        setMessages(prev => [...prev, newAssistantMessage]);
        setIsLoading(false);
      }, 1500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <Card className={cn("flex flex-col overflow-hidden", 
      expanded ? "fixed inset-0 z-50 rounded-none" : "h-[500px] w-full max-w-md rounded-lg shadow-lg border-primary/10", 
      className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-primary/5">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-full">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div className="font-medium flex items-center">
            <span>Payroll Assistant Demo</span>
            <div className="flex h-2 w-2 ml-2 relative">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={clearChat} 
            title="Clear conversation"
            className="rounded-full h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {onToggleExpand && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onToggleExpand} 
              title={expanded ? "Minimize" : "Maximize"}
              className="rounded-full h-8 w-8"
            >
              {expanded ? <span>X</span> : <span className="text-xs font-bold">[]</span>}
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center p-8">
              <div className="bg-primary/10 h-16 w-16 mx-auto mb-4 rounded-full flex items-center justify-center">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-1">
                AI Payroll Assistant
              </h3>
              
              <p className="text-sm text-muted-foreground mb-6">
                Powered by advanced AI agents for tax, expense, and compliance expertise
              </p>
              
              <div className="grid gap-2">
                <h4 className="text-sm font-medium mb-1">Try asking about:</h4>
                <div className="grid gap-2">
                  <button 
                    className="text-sm justify-start h-auto py-2 px-3 whitespace-normal text-left w-full bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setInput("How do I calculate payroll taxes for a new employee?")}
                  >
                    How do I calculate payroll taxes for a new employee?
                  </button>
                  <button 
                    className="text-sm justify-start h-auto py-2 px-3 whitespace-normal text-left w-full bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setInput("What tax forms do I need to file this quarter?")}
                  >
                    What tax forms do I need to file this quarter?
                  </button>
                  <button 
                    className="text-sm justify-start h-auto py-2 px-3 whitespace-normal text-left w-full bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setInput("Help me categorize office supplies for tax deductions")}
                  >
                    Help me categorize office supplies for tax deductions
                  </button>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={cn("flex gap-2", message.role === "user" ? "justify-end" : "justify-start")}>
                {message.role !== "user" && (
                  <Avatar className="h-8 w-8 bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </Avatar>
                )}
                <div className={cn(
                  "rounded-lg p-3 max-w-[80%]",
                  message.role === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                )}>
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8 bg-primary">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </Avatar>
                )}
              </div>
            ))
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex flex-col items-center p-4 text-muted-foreground">
              <div className="relative">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium">AI thinking</span>
                <span className="ml-1 inline-flex">...</span>
              </div>
            </div>
          )}
          
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
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
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                {input.length} chars
              </div>
            )}
          </div>
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim()}
            className="rounded-full h-12 w-12 bg-primary shadow-md"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </Card>
  );
}