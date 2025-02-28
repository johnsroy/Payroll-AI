import React from 'react';
import { Route, Switch } from 'wouter';
import MinimalLanding from './pages/MinimalLanding';
import SimpleAgentPlayground from './pages/SimpleAgentPlayground';

const AppRoot: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 bg-white shadow-sm">
        <div className="container mx-auto">
          <a href="/" className="font-bold text-xl">PayrollPro AI</a>
        </div>
      </header>
      
      <main className="flex-grow">
        <Switch>
          <Route path="/agents" component={SimpleAgentPlayground} />
          <Route path="/" component={MinimalLanding} />
          <Route component={() => <div className="p-8">404 - Not Found</div>} />
        </Switch>
      </main>
      
      <footer className="p-4 bg-gray-100 text-center text-sm text-gray-600">
        &copy; 2025 PayrollPro AI. All rights reserved.
      </footer>
    </div>
  );
};

export default AppRoot;