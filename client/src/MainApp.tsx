import React from 'react';
import { Route, Switch } from 'wouter';

const Home = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">PayrollPro AI</h1>
    <p className="mt-2">Welcome to the PayrollPro AI platform.</p>
  </div>
);

const MainApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold text-blue-600">PayrollPro AI</h1>
        </div>
      </header>
      <main className="container mx-auto py-6">
        <Switch>
          <Route path="/" component={Home} />
          <Route>
            <div className="p-6">
              <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
            </div>
          </Route>
        </Switch>
      </main>
    </div>
  );
};

export default MainApp;