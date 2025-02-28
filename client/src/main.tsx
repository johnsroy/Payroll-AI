import { createRoot } from "react-dom/client";
import "./index.css";

// Create a very simple application to test if the basic rendering works
function SimpleApp() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        PayrollPro AI
      </h1>
      <p className="text-gray-600">
        Welcome to our AI-powered payroll management system.
      </p>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<SimpleApp />);
} else {
  console.error("Root element not found");
}