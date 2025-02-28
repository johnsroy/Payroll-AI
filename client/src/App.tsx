import React from 'react';
import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import Home from '@/pages/Home';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Import pages
import FeaturesPage from './pages/features';
import PricingPage from './pages/pricing';
import BlogPage from './pages/blog';
import NotFound from './pages/not-found';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/features" component={FeaturesPage} />
            <Route path="/pricing" component={PricingPage} />
            <Route path="/blog" component={BlogPage} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}

export default App;