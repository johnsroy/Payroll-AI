import React from 'react';

function SimpleHero() {
  return (
    <section style={{
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '4rem 1rem',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem'
        }}>
          Transform Your Payroll With Intelligent AI
        </h1>
        
        <p style={{
          fontSize: '1.25rem',
          marginBottom: '2rem',
          opacity: '0.9'
        }}>
          PayrollPro AI combines specialized AI agents, no-code integration, and powerful analytics
          to simplify your payroll management and maximize efficiency.
        </p>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          marginBottom: '3rem'
        }}>
          <button style={{
            backgroundColor: 'white',
            color: '#2563eb',
            fontWeight: 'bold',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.25rem',
            border: 'none',
            cursor: 'pointer'
          }}>
            Get Started Free
          </button>
          
          <button style={{
            backgroundColor: 'transparent',
            color: 'white',
            fontWeight: 'bold',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.25rem',
            border: '1px solid white',
            cursor: 'pointer'
          }}>
            Watch Demo
          </button>
        </div>
        
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '0.5rem',
          padding: '1rem',
          fontSize: '0.875rem'
        }}>
          <p>Trusted by 500+ companies across the globe for payroll management</p>
        </div>
      </div>
    </section>
  );
}

export default SimpleHero;