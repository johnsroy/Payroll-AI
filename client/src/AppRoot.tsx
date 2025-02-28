import React from 'react';
import { Route, Switch, Link } from 'wouter';
import FullLandingPage from './pages/FullLandingPage';
import SimpleAgentPlayground from './pages/SimpleAgentPlayground';
import DataConnectionPage from './pages/data-connection';
import WorkflowHomePage from './pages/workflow-home';
import WorkflowDataConnectionPage from './pages/workflow/data-connection';
import WorkflowReviewPage from './pages/workflow/review';
import WorkflowImplementPage from './pages/workflow/implement';
import OAuthCallbackPage from './pages/auth/callback';

const AppRoot: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-6 bg-white shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/">
            <span className="font-bold text-xl text-blue-600 cursor-pointer">PayrollPro AI</span>
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link href="/">
              <span className="text-gray-600 hover:text-blue-600 cursor-pointer">Home</span>
            </Link>
            <Link href="/agents">
              <span className="text-gray-600 hover:text-blue-600 cursor-pointer">AI Playground</span>
            </Link>
            <Link href="/workflow-home">
              <span className="text-gray-600 hover:text-blue-600 cursor-pointer">Payroll Workflow</span>
            </Link>
            <Link href="/data-connection">
              <span className="text-gray-600 hover:text-blue-600 cursor-pointer">Data Connection</span>
            </Link>
            <a href="#features" className="text-gray-600 hover:text-blue-600">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-blue-600">Pricing</a>
          </nav>
          <div className="hidden md:block">
            <Link href="/workflow-home">
              <span className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer">
                Get Started
              </span>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        <Switch>
          {/* Main Application Routes */}
          <Route path="/agents" component={SimpleAgentPlayground} />
          <Route path="/data-connection" component={DataConnectionPage} />
          
          {/* Workflow Routes */}
          <Route path="/workflow-home" component={WorkflowHomePage} />
          <Route path="/workflow/data-connection" component={WorkflowDataConnectionPage} />
          <Route path="/workflow/review" component={WorkflowReviewPage} />
          <Route path="/workflow/implement" component={WorkflowImplementPage} />
          
          {/* Auth Routes */}
          <Route path="/auth/callback" component={OAuthCallbackPage} />
          
          {/* Landing Page */}
          <Route path="/" component={FullLandingPage} />
          <Route component={() => (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
              <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
              <Link href="/">
                <span className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 cursor-pointer">
                  Go back home
                </span>
              </Link>
            </div>
          )} />
        </Switch>
      </main>
      
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">PayrollPro AI</h3>
              <p className="text-gray-400">
                AI-powered payroll solutions for businesses of all sizes.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><Link href="/agents"><span className="hover:text-white cursor-pointer">AI Playground</span></Link></li>
                <li><Link href="/workflow-home"><span className="hover:text-white cursor-pointer">Payroll Workflow</span></Link></li>
                <li><Link href="/data-connection"><span className="hover:text-white cursor-pointer">Data Connection</span></Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">&copy; 2025 PayrollPro AI. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppRoot;