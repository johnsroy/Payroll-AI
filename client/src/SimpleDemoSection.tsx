import React, { useState } from 'react';

function SimpleDemoSection() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    // Simulate AI response after a short delay
    setTimeout(() => {
      const demoResponses = [
        "Based on current regulations, employees in California are entitled to overtime pay at 1.5x regular rate after 8 hours in a workday or 40 hours in a workweek.",
        "Looking at your payroll data, I recommend categorizing meal allowances as non-taxable benefits under IRS code section 119 when they're for the employer's convenience.",
        "After analyzing your payroll history, I've identified potential savings of $4,280 annually by optimizing your payment schedule and tax withholding strategies.",
        "Your current payroll setup has a 98% compliance rating. The main improvement area is documenting meal breaks for hourly employees to meet state requirements."
      ];
      
      // Select a random response from the list
      const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
      setResponse(randomResponse);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <section id="demo" style={{
      padding: '4rem 1rem',
      backgroundColor: 'white'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '1rem',
          color: '#0f172a'
        }}>
          Experience the AI Payroll Assistant
        </h2>
        
        <p style={{
          textAlign: 'center',
          color: '#64748b',
          marginBottom: '3rem',
          maxWidth: '700px',
          margin: '0 auto 3rem auto'
        }}>
          Try our intelligent payroll assistant and see how it can answer your payroll questions,
          analyze your data, and provide actionable insights.
        </p>
        
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          padding: '2rem',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
        }}>
          <form onSubmit={handleSubmit} style={{
            marginBottom: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              gap: '0.5rem'
            }}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question about payroll..."
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0',
                  fontSize: '1rem'
                }}
              />
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? 'Processing...' : 'Ask'}
              </button>
            </div>
          </form>
          
          {response && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '1.5rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '0.75rem'
              }}>
                <div style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  backgroundColor: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  marginRight: '0.75rem'
                }}>
                  AI
                </div>
                <div style={{ fontWeight: 'bold' }}>PayrollPro Assistant</div>
              </div>
              <p style={{ color: '#334155' }}>{response}</p>
            </div>
          )}
          
          <div style={{
            marginTop: '1.5rem',
            fontSize: '0.875rem',
            color: '#94a3b8',
            textAlign: 'center'
          }}>
            Try asking about tax regulations, payroll optimization, or compliance requirements.
          </div>
        </div>
      </div>
    </section>
  );
}

export default SimpleDemoSection;