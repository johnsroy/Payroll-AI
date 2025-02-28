import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

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
  initialMessage = "Hi there! 👋 I'm your PayrollPro AI assistant. How can I help you today?",
  position = 'bottom-right',
  theme = 'light',
  characterName = 'PayBuddy'
}: AnimatedChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add initial message when component mounts
    if (initialMessage && messages.length === 0) {
      setMessages([
        {
          id: uuidv4(),
          content: initialMessage,
          role: 'assistant',
          timestamp: new Date()
        }
      ]);
    }
  }, [initialMessage]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: uuidv4(),
        content: getRandomResponse(inputValue),
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getRandomResponse = (query: string) => {
    const responses = [
      "I'd be happy to help you with that!",
      "Great question! Let me look into that for you.",
      "That's something I can definitely assist with.",
      "I understand what you're asking. Here's what you need to know...",
      "Thanks for your question. Let me explain how this works..."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const positionClasses = {
    'bottom-right': 'bottom-5 right-5',
    'bottom-left': 'bottom-5 left-5'
  };
  
  const themeClasses = {
    light: {
      widget: 'bg-white text-gray-800',
      header: 'bg-blue-600 text-white',
      button: 'bg-blue-600 text-white hover:bg-blue-700',
      userMessage: 'bg-blue-600 text-white',
      aiMessage: 'bg-gray-100 text-gray-800'
    },
    dark: {
      widget: 'bg-gray-800 text-white',
      header: 'bg-blue-800 text-white',
      button: 'bg-blue-700 text-white hover:bg-blue-800',
      userMessage: 'bg-blue-700 text-white',
      aiMessage: 'bg-gray-700 text-white'
    }
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Chat button */}
      <motion.button
        className={`rounded-full w-14 h-14 flex items-center justify-center shadow-lg ${themeClasses[theme].button}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </motion.button>

      {/* Chat widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`absolute bottom-16 ${position === 'bottom-right' ? 'right-0' : 'left-0'} w-80 sm:w-96 rounded-lg shadow-xl overflow-hidden ${themeClasses[theme].widget}`}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            {/* Chat header */}
            <div className={`p-4 ${themeClasses[theme].header} flex items-center`}>
              <motion.div 
                className="w-10 h-10 rounded-full bg-white p-1 mr-3 overflow-hidden"
                initial={{ rotate: -30 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                </svg>
              </motion.div>
              <div>
                <h3 className="font-semibold">{characterName}</h3>
                <p className="text-xs opacity-80">AI Assistant</p>
              </div>
            </div>

            {/* Chat messages */}
            <div className="h-80 overflow-y-auto p-4 flex flex-col space-y-3">
              {messages.map(message => (
                <motion.div
                  key={message.id}
                  className={`max-w-3/4 rounded-lg p-3 ${
                    message.role === 'user' 
                      ? `${themeClasses[theme].userMessage} self-end` 
                      : `${themeClasses[theme].aiMessage} self-start`
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {message.content}
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  className={`max-w-3/4 rounded-lg p-3 self-start ${themeClasses[theme].aiMessage}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex space-x-1">
                    <motion.div 
                      className="w-2 h-2 rounded-full bg-blue-600"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div 
                      className="w-2 h-2 rounded-full bg-blue-600"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                    />
                    <motion.div 
                      className="w-2 h-2 rounded-full bg-blue-600"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                    />
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Chat input */}
            <form onSubmit={handleSubmit} className="p-3 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <motion.button
                  type="submit"
                  className={`rounded-full p-2 ${themeClasses[theme].button}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={inputValue.trim() === ''}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}