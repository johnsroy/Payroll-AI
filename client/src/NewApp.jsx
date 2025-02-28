// Minimal React component with simple state management
import React, { useState } from 'react';

function NewApp() {
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState('No message sent yet');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setMessage(`You said: ${inputValue}`);
      setInputValue('');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#2563eb' }}>PayrollPro AI</h1>
      <p>Simple test application</p>
      
      <div style={{ 
        background: '#fff', 
        padding: '20px', 
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '20px'  
      }}>
        <h2>Basic Test</h2>
        <p>If you can see this message, the application is running correctly.</p>
      </div>
      
      <div style={{ 
        background: '#fff', 
        padding: '20px', 
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'  
      }}>
        <h2>Simple Form Test</h2>
        <p><strong>Status:</strong> {message}</p>
        
        <form onSubmit={handleSubmit} style={{ marginTop: '15px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              style={{ 
                flex: 1, 
                padding: '10px', 
                borderRadius: '4px',
                border: '1px solid #d1d5db'
              }}
            />
            <button 
              type="submit" 
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '10px 15px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewApp;