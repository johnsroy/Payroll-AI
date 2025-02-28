const Home = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">PayrollPro AI</h1>
    <p className="mt-2">Simple app to test for syntax errors</p>
  </div>
);

const MinimalAppWithoutImports = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold text-blue-600">PayrollPro AI</h1>
        </div>
      </header>
      <main className="container mx-auto py-6">
        <Home />
      </main>
    </div>
  );
};

export default MinimalAppWithoutImports;