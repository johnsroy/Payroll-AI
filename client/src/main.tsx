import React from "react";
import { createRoot } from "react-dom/client";
import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

import SimpleApp from "./SimpleApp";
import DataConnectionPage from "./pages/data-connection";
import EmployeeImportPage from "./pages/employee-import";
import Home from "./pages/Home";
import Features from "./pages/features";
import Pricing from "./pages/pricing";
import NotFound from "./pages/not-found";
import AIAssistantPage from "./pages/ai-assistant";
import BlogPage from "./pages/blog";
import LandingPage from "./pages/LandingPage";
import TestApp from "./pages/test-app";
import BasicTest from "./pages/basic-test";

import "./index.css";

// Get the root element
const rootElement = document.getElementById("root");

// Check if the root element exists
if (!rootElement) {
  console.error("Root element not found");
  throw new Error("Root element not found");
}

// Create the root and render the app
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/landing" component={LandingPage} />
        <Route path="/features" component={Features} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/simple" component={SimpleApp} />
        <Route path="/data-connection" component={DataConnectionPage} />
        <Route path="/employee-import" component={EmployeeImportPage} />
        <Route path="/ai-assistant" component={AIAssistantPage} />
        <Route path="/test" component={TestApp} />
        <Route path="/basic-test" component={BasicTest} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </QueryClientProvider>
  </React.StrictMode>
);