import React from "react";
import { createRoot } from "react-dom/client";
import { Route, Switch } from "wouter";
import "./index.css";

// Define a minimal home component
function Home() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">PayrollPro AI Home</h1>
      <p className="mb-4">Welcome to the PayrollPro AI platform.</p>
      <div className="flex gap-4">
        <a href="/about" className="text-blue-600 hover:underline">About</a>
        <a href="/landing" className="text-blue-600 hover:underline">Landing Demo</a>
      </div>
    </div>
  );
}

// Define a simple about component
function About() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">About PayrollPro AI</h1>
      <p className="mb-4">This is the about page for PayrollPro AI.</p>
      <a href="/" className="text-blue-600 hover:underline">Home</a>
    </div>
  );
}

// Define a simplified landing page component
function LandingDemo() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center">PayrollPro AI</h1>
        <p className="text-center text-gray-600">Intelligent Payroll Solutions</p>
      </header>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg shadow-sm">
            <h3 className="font-bold mb-2">Intelligent Payroll Processing</h3>
            <p>Automate payroll with AI-powered accuracy and insights.</p>
          </div>
          <div className="p-4 border rounded-lg shadow-sm">
            <h3 className="font-bold mb-2">Tax Compliance</h3>
            <p>Stay compliant with automatic tax calculations and updates.</p>
          </div>
        </div>
      </section>
      
      <div className="text-center">
        <a href="/" className="text-blue-600 hover:underline">Back to Home</a>
      </div>
    </div>
  );
}

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
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/landing" component={LandingDemo} />
    </Switch>
  </React.StrictMode>
);