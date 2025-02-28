import React, { useState } from 'react';

// Adding minimal functionality with a single input field
const SuperMinimal = () => {
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState('No message sent yet');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setMessage(`You said: ${inputValue}`);
      setInputValue('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">PayrollPro AI</h1>
        <p className="text-sm">Minimal Component Test</p>
      </header>
      
      <main className="p-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-3">Welcome to PayrollPro AI</h2>
        <p className="mb-6">This is a minimal test component with basic input functionality.</p>
        
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">Test Panel</h3>
          <p>If you can see this text and use the form below, the application is working correctly.</p>
          
          <div className="mt-4 p-3 bg-blue-100 rounded">
            <p className="mb-2"><strong>Status:</strong> {message}</p>
            
            <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded-md"
              />
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white p-4 text-center mt-10">
        <p>PayrollPro AI &copy; 2025</p>
      </footer>
    </div>
  );
};

export default SuperMinimal;