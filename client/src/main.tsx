import { createRoot } from "react-dom/client";
import { useState } from "react";
import { Link, Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

// Initialize QueryClient
const queryClient = new QueryClient();

// Simple header component
function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-blue-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <span className="ml-2 text-xl font-bold text-gray-900">PayrollPro AI</span>
        </Link>

        <nav className="hidden md:flex space-x-8">
          <Link href="/features" className="text-gray-700 hover:text-blue-600 transition">
            Features
          </Link>
          <Link href="/pricing" className="text-gray-700 hover:text-blue-600 transition">
            Pricing
          </Link>
          <Link href="/blog" className="text-gray-700 hover:text-blue-600 transition">
            Blog
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-gray-700 hover:text-blue-600 transition">
            Login
          </Link>
          <Link href="/get-started" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

// Simple footer component
function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">PayrollPro AI</h3>
            <p className="text-gray-400 mb-4 max-w-md">
              Advanced AI-powered payroll management system that simplifies compliance,
              tax calculations, and expense categorization for businesses of all sizes.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Features</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Tax Calculator</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Compliance Tools</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Expense Management</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Contact</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-gray-400">
          © {new Date().getFullYear()} PayrollPro AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// Simple AIChat component
function SimpleChatBox() {
  const [message, setMessage] = useState("");
  
  return (
    <div className="border rounded-lg shadow-sm p-4 bg-white">
      <div className="flex items-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h3 className="font-medium">Payroll Assistant</h3>
      </div>
      
      <div className="bg-gray-100 rounded p-3 mb-4">
        <p className="text-sm">How can I help with your payroll management today?</p>
      </div>
      
      <div className="flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 border rounded-l p-2"
        />
        <button className="bg-blue-600 text-white px-4 rounded-r">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Home page component
function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Transform Your Payroll <span className="text-blue-600">With Intelligent AI</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Our AI-powered system handles tax calculations, compliance, and expense categorization, 
                giving you peace of mind and saving you hours every month.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup" className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center">
                  Get Started 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <a 
                  href="#demo" 
                  className="px-6 py-3 bg-blue-100 text-blue-600 font-medium rounded-lg hover:bg-blue-200 transition-colors inline-flex items-center justify-center"
                >
                  See it in action
                </a>
              </div>
            </div>
            <div className="lg:w-1/2">
              <SimpleChatBox />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-blue-600 font-semibold uppercase tracking-wide">Features</h2>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              Smart Payroll Management with Specialized AI Agents
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="bg-blue-600 text-white p-3 rounded-lg inline-block mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Tax Calculator</h3>
              <p className="text-gray-600">
                Handles all tax calculations with precision. Calculates federal, state, and local taxes automatically.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="bg-blue-600 text-white p-3 rounded-lg inline-block mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Compliance Advisor</h3>
              <p className="text-gray-600">
                Stays up-to-date with changing regulations and alerts you to upcoming deadlines.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="bg-blue-600 text-white p-3 rounded-lg inline-block mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Expense Categorizer</h3>
              <p className="text-gray-600">
                Automatically categorizes business expenses and identifies tax deduction opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Payroll Management?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that have simplified their payroll process with PayrollPro AI.
          </p>
          <Link href="/signup" className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center text-lg">
            Get Started Now 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}

// Features page component
function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Features</h1>
      <p>Detailed features page content would go here.</p>
    </div>
  );
}

// Pricing page component
function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Pricing</h1>
      <p>Pricing details would go here.</p>
    </div>
  );
}

// Blog page component
function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      <p>Blog posts would go here.</p>
    </div>
  );
}

// Not found page component
function NotFoundPage() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="mb-8">Page not found</p>
      <Link href="/" className="text-blue-600 hover:underline">
        Go back home
      </Link>
    </div>
  );
}

// Main application component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/features" component={FeaturesPage} />
            <Route path="/pricing" component={PricingPage} />
            <Route path="/blog" component={BlogPage} />
            <Route component={NotFoundPage} />
          </Switch>
        </main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}

// Render the application
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error("Root element not found");
}