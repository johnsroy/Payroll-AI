// Minimal React component with no dependencies or special imports
function NewApp() {
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#2563eb' }}>PayrollPro AI</h1>
      <p>Simple test application</p>
      <div style={{ 
        background: '#fff', 
        padding: '20px', 
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'  
      }}>
        <h2>Basic Test</h2>
        <p>If you can see this message, the application is running correctly.</p>
      </div>
    </div>
  );
}

export default NewApp;