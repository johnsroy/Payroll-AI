// Minimal test application
import React from 'react';
import ReactDOM from 'react-dom/client';

// Create a very simple app to test loading
function MinimalApp() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>PayrollPro AI</h1>
      <p>Minimal test app is working!</p>
    </div>
  );
}

// Render the app
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <MinimalApp />
  </React.StrictMode>
);