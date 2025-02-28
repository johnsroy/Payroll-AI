import React, { useState } from "react";
import { Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
  
  return (
    <Card className={`p-4 ${className || ""}`}>
      <div className="flex items-center gap-2 mb-4">
        <Bot className="h-6 w-6 text-blue-600" />
        <h3 className="font-medium">Payroll Assistant</h3>
        {onToggleExpand && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleExpand}
            className="ml-auto"
          >
            {expanded ? "Minimize" : "Expand"}
          </Button>
        )}
      </div>
      
      <div className="bg-gray-100 rounded p-3 mb-4">
        <p className="text-sm">Ask me anything about payroll management!</p>
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          className="flex-1 px-3 py-2 border rounded"
        />
        <Button>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}