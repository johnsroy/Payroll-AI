import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ChatBubbleProps {
  initialMessage: string;
  placeholder?: string;
  onSendMessage?: (message: string) => void;
  agentName?: string;
  agentAvatar?: React.ReactNode;
}

export function ChatBubble({
  initialMessage,
  placeholder = "Type a message...",
  onSendMessage,
  agentName = "AI Assistant",
  agentAvatar
}: ChatBubbleProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: initialMessage }
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const newMessages = [
      ...messages,
      { role: 'user', content: message }
    ];
    
    setMessages(newMessages);
    setMessage('');
    
    if (onSendMessage) {
      onSendMessage(message);
    } else {
      // Default mock response
      setTimeout(() => {
        setMessages([
          ...newMessages,
          { 
            role: 'assistant', 
            content: `I'm a demo version of ${agentName}. In the full version, I would provide a helpful response to "${message}".` 
          }
        ]);
      }, 1000);
    }
  };

  return (
    <div className="w-full rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="max-h-60 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-3/4 rounded-lg px-4 py-2 ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              }`}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 p-2 flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-transparent focus:outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button 
          onClick={handleSendMessage}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}