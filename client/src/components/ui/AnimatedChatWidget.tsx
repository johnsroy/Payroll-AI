import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface AnimatedChatWidgetProps {
  initialMessage?: string;
  position?: 'bottom-right' | 'bottom-left';
  theme?: 'light' | 'dark';
  characterName?: string;
}

export function AnimatedChatWidget({
  initialMessage = "Hello! I am PayBuddy, your AI payroll assistant. How can I help you today?",
  position = 'bottom-right',
  theme = 'light',
  characterName = 'PayBuddy'
}: AnimatedChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add the initial assistant message when the component mounts
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          content: initialMessage,
          role: 'assistant',
          timestamp: new Date()
        }
      ]);
    }
  }, [initialMessage]);

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(inputValue),
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  // Simple mock AI response function
  const getAIResponse = (input: string): string => {
    const inputLower = input.toLowerCase();
    
    if (inputLower.includes('tax') || inputLower.includes('taxes')) {
      return "I can help you calculate tax withholdings based on your employee information. Would you like me to explain federal, state, or local tax requirements?";
    } else if (inputLower.includes('expense') || inputLower.includes('receipt')) {
      return "Our AI can automatically categorize your expenses and identify potential tax deductions. Just upload your receipts or connect your accounting software.";
    } else if (inputLower.includes('compliance') || inputLower.includes('regulation')) {
      return "I will keep you up-to-date with changing tax regulations and compliance requirements. Is there a specific state or regulation you would like to know about?";
    } else if (inputLower.includes('hi') || inputLower.includes('hello') || inputLower.includes('hey')) {
      return `Hello! I am ${characterName}, your AI payroll assistant. I can help with tax calculations, compliance questions, and expense categorization.`;
    } else {
      return "I can assist with payroll tasks like tax calculations, expense categorization, and compliance monitoring. What specific help do you need today?";
    }
  };

  const positionClass = position === 'bottom-right' 
    ? 'bottom-24 right-4 sm:right-8' 
    : 'bottom-24 left-4 sm:left-8';

  const themeClass = theme === 'dark' 
    ? 'bg-gray-800 text-white' 
    : 'bg-white text-gray-800';

  return (
    <>
      {/* Chat button */}
      <motion.button
        className={`fixed ${position === 'bottom-right' ? 'right-4 sm:right-8' : 'left-4 sm:left-8'} bottom-4 w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg z-50`}
        onClick={toggleChat}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`fixed ${positionClass} z-40 w-80 md:w-96 h-96 rounded-lg shadow-xl overflow-hidden ${themeClass} flex flex-col`}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 500 }}
          >
            {/* Chat header */}
            <div className="p-4 bg-blue-600 text-white flex items-center">
              <motion.div 
                className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center mr-3 text-sm font-bold"
                animate={{ 
                  rotate: [0, 10, 0, -10, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                🤖
              </motion.div>
              <div>
                <h3 className="font-bold">{characterName}</h3>
                <p className="text-xs opacity-80">AI Payroll Assistant</p>
              </div>
            </div>
            
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : theme === 'light' 
                          ? 'bg-gray-200 text-gray-800 rounded-bl-none'
                          : 'bg-gray-700 text-white rounded-bl-none'
                    }`}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div 
                    className={`rounded-lg p-3 ${
                      theme === 'light' 
                        ? 'bg-gray-200 text-gray-800 rounded-bl-none'
                        : 'bg-gray-700 text-white rounded-bl-none'
                    }`}
                  >
                    <div className="flex space-x-1">
                      <motion.div 
                        className="w-2 h-2 rounded-full bg-blue-600" 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div 
                        className="w-2 h-2 rounded-full bg-blue-600" 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div 
                        className="w-2 h-2 rounded-full bg-blue-600" 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Chat input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-gray-300 dark:border-gray-700">
              <div className="flex">
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  className={`flex-1 py-2 px-3 rounded-l-lg focus:outline-none ${
                    theme === 'dark' 
                      ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600'
                      : 'bg-gray-100 text-gray-800 placeholder-gray-500 border-gray-300'
                  }`}
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-4 rounded-r-lg hover:bg-blue-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AnimatedChatWidget;