import React from "react";
import { createRoot } from "react-dom/client";
import AppRoot from "./AppRoot";
import "./index.css";
import { Toaster } from "@/components/ui/toaster";

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
    <AppRoot />
    <Toaster />
  </React.StrictMode>
);