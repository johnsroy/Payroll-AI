import React from "react";
import { createRoot } from "react-dom/client";

// Define a minimal home component
function Home() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>PayrollPro AI Home</h1>
      <p style={{ marginBottom: "1rem" }}>Welcome to the PayrollPro AI platform.</p>
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
    <Home />
  </React.StrictMode>
);