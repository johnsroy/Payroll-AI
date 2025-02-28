import React from 'react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 bg-primary text-primary-foreground">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold">PayrollPro AI</span>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <a href="#features" className="hover:text-white/80 transition-colors">Features</a>
            <a href="#benefits" className="hover:text-white/80 transition-colors">Benefits</a>
            <a href="#pricing" className="hover:text-white/80 transition-colors">Pricing</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <button className="bg-white text-primary px-4 py-2 rounded-md hover:bg-white/90 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="py-16 px-6 bg-gradient-to-b from-primary/20 to-transparent">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2 space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  AI-Powered Payroll Management System
                </h1>
                <p className="text-lg text-muted-foreground">
                  Streamline your payroll operations with intelligent automation, compliance checking, 
                  and seamless cloud integration.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium">
                    Start Free Trial
                  </button>
                  <button className="bg-secondary text-secondary-foreground px-6 py-3 rounded-md font-medium">
                    Watch Demo
                  </button>
                </div>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <div className="w-full max-w-md aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                  Payroll Dashboard Preview
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Designed to simplify payroll management through intelligent automation and seamless integration
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: 'Multi-Agent Intelligence',
                  description: 'Our system utilizes specialized AI agents for tax calculations, compliance checking, and data analysis.'
                },
                {
                  title: 'Cloud Integration',
                  description: 'Connect to your existing cloud services with OAuth and upload data files with a simple drag-and-drop interface.'
                },
                {
                  title: 'Zapier Workflows',
                  description: 'Seamlessly integrate with 3000+ apps through our Zapier connector to automate your entire payroll ecosystem.'
                },
                {
                  title: 'Compliance Checking',
                  description: 'Stay compliant with automated tax regulation checks and updates for federal, state, and local jurisdictions.'
                },
                {
                  title: 'Data Analysis',
                  description: 'Get actionable insights from your payroll data with powerful analytics and visualization tools.'
                },
                {
                  title: 'Secure Infrastructure',
                  description: 'Enterprise-grade security ensures your sensitive payroll data remains protected at all times.'
                }
              ].map((feature, index) => (
                <div key={index} className="bg-card p-6 rounded-lg shadow-sm border border-border">
                  <h3 className="font-bold text-xl mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Simple Demo Section */}
        <section id="demo" className="py-16 px-6 bg-muted">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Try It Yourself</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Ask our AI assistant about any payroll-related question and get instant, accurate answers
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto bg-card p-6 rounded-lg shadow-sm border border-border">
              <div className="mb-4 p-4 bg-muted rounded-lg">
                <p className="text-muted-foreground">
                  Example responses will appear here...
                </p>
              </div>
              
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Ask about payroll, taxes, or compliance..."
                  className="flex-grow px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
                  Ask
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 bg-muted border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-6">PayrollPro AI</h2>
            <div className="flex justify-center space-x-6 mb-8">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            </div>
            <p className="text-muted-foreground">&copy; 2025 PayrollPro AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}