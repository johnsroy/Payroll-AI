import React from 'react';
import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import BasicHome from '@/pages/BasicHome';

// Ultra-simplified App component - only including the BasicHome page for now
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          <BasicHome />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;