import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatBubbleProps {
  initialMessage: string;
  placeholder?: string;
  onSendMessage?: (message: string) => void;
  agentName?: string;
  agentAvatar?: React.ReactNode;
}

export function ChatBubble({
  initialMessage,
  placeholder = "Ask me anything about payroll...",
  onSendMessage,
  agentName = "PayBuddy",
  agentAvatar = "🤖"
}: ChatBubbleProps) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: initialMessage }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message to chat
    setChatHistory(prev => [...prev, { role: 'user', content: message }]);
    
    // Clear input
    setMessage("");
    
    // Show typing indicator
    setIsTyping(true);
    
    // If onSendMessage is provided, call it
    if (onSendMessage) {
      onSendMessage(message);
      
      // Simulate response for demo
      setTimeout(() => {
        setChatHistory(prev => [...prev, { 
          role: 'assistant', 
          content: "I'm just a demo right now, but in the full version I can help with tax calculations, compliance questions, and more!" 
        }]);
        setIsTyping(false);
      }, 1500);
    } else {
      // Default demo response
      setTimeout(() => {
        setChatHistory(prev => [...prev, { 
          role: 'assistant', 
          content: "I'm an AI assistant that specializes in payroll! I can answer questions about taxes, compliance, and expenses." 
        }]);
        setIsTyping(false);
      }, 1500);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 overflow-hidden">
      <div className="flex items-center mb-4">
        <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center mr-4">
          <span className="text-xl">{agentAvatar}</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{agentName}</h3>
          <p className="text-gray-600 dark:text-gray-400">Your AI payroll assistant</p>
        </div>
      </div>
      
      <div className="h-48 overflow-y-auto mb-4 bg-blue-50 dark:bg-gray-700 rounded-lg p-4">
        <AnimatePresence>
          {chatHistory.map((entry, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`mb-2 ${entry.role === 'user' ? 'text-right' : ''}`}
            >
              <div 
                className={`inline-block max-w-[85%] px-3 py-2 rounded-lg ${
                  entry.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-bl-none'
                }`}
              >
                {entry.content}
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-2"
            >
              <div className="inline-block px-3 py-2 rounded-lg bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-bl-none">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.6,
                    ease: "easeInOut",
                    times: [0, 0.5, 1],
                    repeatDelay: 0
                  }}
                  style={{ display: "inline-block" }}
                >
                  •
                </motion.div>
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.6,
                    ease: "easeInOut",
                    times: [0, 0.5, 1],
                    repeatDelay: 0,
                    delay: 0.15
                  }}
                  style={{ display: "inline-block", marginLeft: 3 }}
                >
                  •
                </motion.div>
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.6,
                    ease: "easeInOut",
                    times: [0, 0.5, 1],
                    repeatDelay: 0,
                    delay: 0.3
                  }}
                  style={{ display: "inline-block", marginLeft: 3 }}
                >
                  •
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="relative flex">
        <input 
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button 
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg disabled:opacity-50 transition-colors"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
}