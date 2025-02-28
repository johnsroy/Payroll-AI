import { createRoot } from "react-dom/client";
import SimpleApp from "./SimpleApp";
// Leaving out CSS import to see if it causes issues

// Create a very simple element to display for debugging
const rootElement = document.getElementById("root");
if (rootElement) {
  rootElement.innerHTML = "<h1>Basic HTML Test</h1>";
}

// Skip React rendering to isolate issues
/*
const root = createRoot(rootElement);
root.render(<SimpleApp />);
*/