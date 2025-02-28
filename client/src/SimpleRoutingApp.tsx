import React from 'react';
import { Route, Switch } from 'wouter';

// Simple Home component
const Home = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">PayrollPro AI</h1>
    <p className="mt-2">Welcome to the PayrollPro AI platform.</p>
  </div>
);

// Simple About component
const About = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">About PayrollPro AI</h1>
    <p className="mt-2">Our AI-powered payroll solution.</p>
  </div>
);

// Main app with routing
const SimpleRoutingApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold text-blue-600">PayrollPro AI</h1>
        </div>
      </header>
      <main className="container mx-auto py-6">
        <Switch>
          <Route path="/about" component={About} />
          <Route path="/" component={Home} />
        </Switch>
      </main>
    </div>
  );
};

export default SimpleRoutingApp;