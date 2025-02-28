import React from "react";
import { createRoot } from "react-dom/client";
import SimpleRoutingApp from "./SimpleRoutingApp";
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
    <SimpleRoutingApp />
  </React.StrictMode>
);