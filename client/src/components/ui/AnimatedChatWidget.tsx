import React, { useState, useEffect, useRef } from 'react';
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
  initialMessage = "Hi there! I'm PayBuddy, your friendly payroll assistant. How can I help you today?",
  position = 'bottom-right',
  theme = 'light',
  characterName = 'PayBuddy'
}: AnimatedChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: initialMessage,
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isBouncing, setIsBouncing] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Bounce animation every 15 seconds when closed
  useEffect(() => {
    if (!isOpen) {
      const bounceInterval = setInterval(() => {
        setIsBouncing(true);
        setTimeout(() => setIsBouncing(false), 1000);
      }, 15000);
      
      return () => clearInterval(bounceInterval);
    }
  }, [isOpen]);
  
  // Wave animation when first loaded
  useEffect(() => {
    setTimeout(() => {
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 2000);
    }, 1000);
  }, []);
  
  // Scroll to bottom when messages change
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
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Simulate assistant response after a short delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(inputValue),
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };
  
  // Simple response generation - this would be replaced with actual AI logic
  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return `Hi there! How can I help with your payroll questions today?`;
    } else if (input.includes('tax') || input.includes('taxes')) {
      return `Taxes can be complicated! Our payroll system handles all tax calculations automatically, including federal, state, and local taxes.`;
    } else if (input.includes('compliance') || input.includes('regulation')) {
      return `Our compliance agent stays up-to-date with changing regulations and will alert you to upcoming deadlines and requirements!`;
    } else if (input.includes('expense') || input.includes('categorize')) {
      return `Our expense categorization system automatically sorts your expenses and identifies tax deduction opportunities. Want to learn more?`;
    } else if (input.includes('price') || input.includes('cost') || input.includes('pricing')) {
      return `We offer flexible pricing plans starting at $29/month for small businesses. Would you like to see our detailed pricing page?`;
    } else if (input.includes('thank')) {
      return `You're welcome! I'm happy to help. Let me know if you have any other questions.`;
    } else {
      return `That's an interesting question about payroll! Our AI-powered system can help with tax calculations, compliance monitoring, and expense categorization. Would you like more details on any of these features?`;
    }
  };
  
  const positionClass = position === 'bottom-right' ? 'right-5' : 'left-5';
  const themeClass = theme === 'light' ? 'bg-white text-gray-800' : 'bg-gray-800 text-white';
  
  return (
    <>
      {/* Chat bubble button */}
      <motion.div 
        className={`fixed ${positionClass} bottom-5 z-50`}
        animate={{ 
          y: isBouncing ? -10 : 0,
          scale: isBouncing ? 1.05 : 1
        }}
        transition={{ type: 'spring', stiffness: 500 }}
      >
        <button
          onClick={toggleChat}
          className={`flex items-center justify-center p-4 rounded-full shadow-lg ${isOpen ? 'bg-red-500' : 'bg-blue-600'} text-white`}
          aria-label={isOpen ? "Close chat" : "Open chat"}
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <motion.div 
                className="absolute -top-2 -right-2 h-5 w-5 bg-green-500 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: isWaving ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.5, repeat: isWaving ? 3 : 0 }}
              />
            </div>
          )}
        </button>
      </motion.div>
      
      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed ${positionClass} bottom-24 z-50 w-80 md:w-96 rounded-lg shadow-xl overflow-hidden flex flex-col ${themeClass}`}
            style={{ maxHeight: 'calc(100vh - 150px)' }}
          >
            {/* Chat header */}
            <div className="p-4 bg-blue-600 text-white flex items-center">
              <div className="relative mr-3">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden">
                  <motion.div
                    className="text-xl"
                    animate={{ 
                      rotate: [0, 10, -10, 10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      repeatDelay: 5
                    }}
                  >
                    🤖
                  </motion.div>
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
              <div>
                <h3 className="font-medium">{characterName}</h3>
                <p className="text-xs text-blue-100">Your Payroll Assistant</p>
              </div>
            </div>
            
            {/* Messages container */}
            <div className="flex-1 p-4 overflow-y-auto" style={{ minHeight: '200px', maxHeight: '400px' }}>
              {messages.map(message => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                      <span>🤖</span>
                    </div>
                  )}
                  <div 
                    className={`px-4 py-2 rounded-lg max-w-[80%] ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-1 opacity-60">
                      {message.timestamp.getHours().toString().padStart(2, '0')}:
                      {message.timestamp.getMinutes().toString().padStart(2, '0')}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center ml-2 flex-shrink-0">
                      <span className="text-white text-xs">You</span>
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input form */}
            <form onSubmit={handleSubmit} className="border-t p-3 flex">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                type="submit"
                className="bg-blue-600 text-white rounded-r-lg px-4 py-2 hover:bg-blue-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}