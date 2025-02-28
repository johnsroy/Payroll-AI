import React from 'react';

function SimpleFooter() {
  return (
    <footer style={{
      backgroundColor: '#0f172a',
      color: 'white',
      padding: '3rem 1rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          <div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              PayrollPro AI
            </h3>
            <p style={{
              color: '#94a3b8',
              maxWidth: '300px'
            }}>
              AI-powered payroll solutions with advanced integration capabilities and intelligent insights.
            </p>
          </div>
          
          <div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Product
            </h4>
            <ul style={{
              color: '#94a3b8',
              listStyle: 'none',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Features</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Pricing</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Integrations</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Enterprise</a></li>
            </ul>
          </div>
          
          <div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Resources
            </h4>
            <ul style={{
              color: '#94a3b8',
              listStyle: 'none',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Documentation</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Guides</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Support</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>API Reference</a></li>
            </ul>
          </div>
          
          <div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Company
            </h4>
            <ul style={{
              color: '#94a3b8',
              listStyle: 'none',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>About</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Blog</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Careers</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div style={{
          borderTop: '1px solid #334155',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            © 2025 PayrollPro AI. All rights reserved.
          </div>
          
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            color: '#94a3b8',
            fontSize: '0.875rem'
          }}>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SimpleFooter;