import React from "react";
import { createRoot } from "react-dom/client";

function BasicApp() {
  return (
    <div>
      <h1>Hello World</h1>
      <p>This is a simple test app</p>
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
    <BasicApp />
  </React.StrictMode>
);