import React from 'react';
import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import BasicHome from '@/pages/BasicHome';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Switch>
            <Route path="/" component={BasicHome} />
            {/* We'll add other routes back as we rebuild the pages */}
          </Switch>
        </main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}

export default App;