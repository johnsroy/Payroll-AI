import React, { useState } from 'react';

// Enhanced BasicApp with more UI elements but still minimal
const BasicApp = () => {
  const [message, setMessage] = useState<string>('');
  const [responses, setResponses] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Add the user message to responses
    setResponses(prev => [...prev, `You: ${message}`]);
    
    // Simulate an AI response
    setTimeout(() => {
      setResponses(prev => [...prev, `AI: I received your message about "${message}". As a payroll AI, I can help with that.`]);
    }, 500);
    
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">PayrollPro AI</h1>
        <p className="text-sm">AI-powered payroll solutions</p>
      </header>
      
      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Welcome to PayrollPro AI</h2>
          <p className="text-gray-700">
            Our intelligent platform simplifies payroll management with AI-powered tools.
          </p>
        </section>
        
        <section className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">AI Assistant</h2>
          
          <div className="border rounded-md p-3 mb-4 h-64 overflow-y-auto bg-gray-50">
            {responses.length > 0 ? (
              responses.map((response, index) => (
                <div key={index} className="mb-2">
                  <p className={`p-2 rounded-lg ${response.startsWith('AI:') ? 'bg-blue-100' : 'bg-gray-200'}`}>
                    {response}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic text-center mt-20">
                Ask the AI assistant a question about payroll
              </p>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your question here..."
              className="flex-1 p-2 border rounded-md"
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Send
            </button>
          </form>
        </section>
      </main>
      
      <footer className="bg-gray-800 text-white p-4 text-center text-sm">
        PayrollPro AI © 2025 - Intelligent Payroll Solutions
      </footer>
    </div>
  );
};

export default BasicApp;