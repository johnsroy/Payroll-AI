import React from 'react';
import { Route, Switch } from 'wouter';
import App from './App';
import DataConnectionPage from './pages/data-connection';
import AIAnalysisPage from './pages/ai-analysis';
import ReviewPage from './pages/review';
import ImplementationPage from './pages/implementation';

export default function AppRoot() {
  return (
    <Switch>
      <Route path="/" component={App} />
      <Route path="/data-connection" component={DataConnectionPage} />
      <Route path="/ai-analysis" component={AIAnalysisPage} />
      <Route path="/review" component={ReviewPage} />
      <Route path="/implementation" component={ImplementationPage} />
      <Route>
        {/* 404 page */}
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-700">404</h1>
            <p className="text-xl mb-6 text-gray-500">Page not found</p>
            <a href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md">
              Go to Home
            </a>
          </div>
        </div>
      </Route>
    </Switch>
  );
}