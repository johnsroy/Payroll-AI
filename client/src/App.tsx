import React from 'react';
import { Route, Switch } from 'wouter';
import LandingPage from './pages/landing';
import LoginPage from './pages/auth/login';
import DashboardPage from './pages/dashboard';
import AIAssistantPage from './pages/ai-assistant';
import DataConnectionsPage from './pages/data-connections';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/auth/login" component={LoginPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/ai-assistant" component={AIAssistantPage} />
        <Route path="/data-connections" component={DataConnectionsPage} />
        <Route>
          {/* 404 Page */}
          <div className="min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
            <p className="text-gray-600 mb-6">The page you are looking for doesn't exist.</p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </Route>
      </Switch>
    </div>
  );
}

export default App;