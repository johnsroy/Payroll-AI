// The most minimal component possible - pure HTML, no React hooks
const SuperMinimal = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">PayrollPro AI</h1>
        <p className="text-sm">Minimal Component Test</p>
      </header>
      
      <main className="p-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-3">Welcome to PayrollPro AI</h2>
        <p className="mb-6">This is a minimal test component to verify the application is working.</p>
        
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">Test Panel</h3>
          <p>If you can see this text, the minimal application is rendering correctly.</p>
          
          <div className="mt-4 p-3 bg-blue-100 rounded">
            <p><strong>Status:</strong> Basic application test</p>
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