import React from 'react';

function SimpleNav() {
  return (
    <nav style={{
      backgroundColor: '#1e40af',
      color: 'white',
      padding: '1rem',
      marginBottom: '2rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
          PayrollPro AI
        </div>
        
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Home</a>
          <a href="#features" style={{ color: 'white', textDecoration: 'none' }}>Features</a>
          <a href="#demo" style={{ color: 'white', textDecoration: 'none' }}>Demo</a>
          <a href="#pricing" style={{ color: 'white', textDecoration: 'none' }}>Pricing</a>
        </div>
        
        <button style={{
          backgroundColor: 'white',
          color: '#1e40af',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '0.25rem',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          Get Started
        </button>
      </div>
    </nav>
  );
}

export default SimpleNav;