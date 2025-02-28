import React from "react";
import { createRoot } from "react-dom/client";
import { Route, Switch } from "wouter";

// Define a minimal home component
function Home() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>PayrollPro AI Home</h1>
      <p style={{ marginBottom: "1rem" }}>Welcome to the PayrollPro AI platform.</p>
      <a href="/about" style={{ color: "blue", textDecoration: "underline" }}>About</a>
    </div>
  );
}

// Define a simple about component
function About() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>About PayrollPro AI</h1>
      <p style={{ marginBottom: "1rem" }}>This is the about page for PayrollPro AI.</p>
      <a href="/" style={{ color: "blue", textDecoration: "underline" }}>Home</a>
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
    </Switch>
  </React.StrictMode>
);