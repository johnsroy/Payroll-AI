import React from 'react';
import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import BasicHome from '@/pages/BasicHome';
import FeaturesPage from './pages/features';
import PricingPage from './pages/pricing';
import BlogPage from './pages/blog';
import NotFound from './pages/not-found';

// Simplified App component - removed header and footer temporarily for testing
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          <Switch>
            <Route path="/" component={BasicHome} />
            <Route path="/features" component={FeaturesPage} />
            <Route path="/pricing" component={PricingPage} />
            <Route path="/blog" component={BlogPage} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;