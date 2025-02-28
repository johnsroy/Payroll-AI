import React, { useState } from 'react';

// A simple chat message type
type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
};

const MinimalChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Create a unique ID for the message
    const messageId = Date.now().toString();
    
    // Add user message
    const userMessage: Message = {
      id: messageId,
      content: input,
      role: 'user',
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Thank you for your payroll query about "${input}". As PayrollPro AI, I can help with that.`,
        role: 'assistant',
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">PayrollPro AI</h1>
        <p className="text-sm">Your intelligent payroll assistant</p>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">AI Assistant</h2>
          
          <div className="border rounded p-4 mb-4 h-80 overflow-y-auto bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-32">
                <p>Ask PayrollPro AI a question about payroll management</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`p-3 rounded-lg max-w-3xl ${
                      msg.role === 'user' 
                        ? 'bg-blue-100 ml-auto' 
                        : 'bg-gray-100'
                    }`}
                  >
                    <p>{msg.content}</p>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="bg-gray-100 p-3 rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2 mt-2"></div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about payroll processing, tax calculations, compliance..."
              className="flex-1 p-2 border rounded-md"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`px-4 py-2 rounded-md ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Send'}
            </button>
          </form>
        </div>
      </main>

      <footer className="bg-gray-800 text-white p-4 text-center mt-10">
        <p>PayrollPro AI &copy; 2025 - Advanced Payroll Solutions</p>
      </footer>
    </div>
  );
};

export default MinimalChat;