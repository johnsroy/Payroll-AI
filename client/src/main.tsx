// Create a direct entry point for Vite
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Switch, Route } from 'wouter';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/features';
import PricingPage from './pages/pricing';
import BlogPage from './pages/blog';
import LoginPage from './pages/login';
import AIAssistantPage from './pages/ai-assistant';
import DataConnectionPage from './pages/data-connection';
import NotFound from './pages/not-found';

// Initialize the query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Switch>
            <Route path="/" component={LandingPage} />
            <Route path="/features" component={FeaturesPage} />
            <Route path="/pricing" component={PricingPage} />
            <Route path="/blog" component={BlogPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/ai-assistant" component={AIAssistantPage} />
            <Route path="/data-connection" component={DataConnectionPage} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Footer />
      </div>
    </QueryClientProvider>
  </React.StrictMode>
);