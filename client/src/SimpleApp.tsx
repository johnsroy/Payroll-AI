import React, { useState } from 'react';
import { FloatingIllustration } from './components/animations/FloatingIllustration';
import { AnimatedRobot } from './components/animations/AnimatedRobot';
import { ChatBubble } from './components/animations/ChatBubble';
import { AnimatedAgentCard, Agent } from './components/animations/AnimatedAgentCard';
import { WavyBackground } from './components/animations/WavyBackground';

function SimpleApp() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  
  // Available AI agents
  const agents: Agent[] = [
    {
      name: "Tax Calculator",
      role: "Finance Specialist",
      description: "Handles all tax calculations with precision, including federal, state, and local taxes.",
      icon: "💰",
      color: "bg-green-100 text-green-600"
    },
    {
      name: "Compliance Advisor",
      role: "Regulatory Expert",
      description: "Stays up-to-date with changing regulations and alerts you to upcoming deadlines.",
      icon: "🛡️",
      color: "bg-blue-100 text-blue-600"
    },
    {
      name: "Expense Categorizer",
      role: "Accounting Assistant",
      description: "Automatically categorizes business expenses and identifies tax deduction opportunities.",
      icon: "📊",
      color: "bg-purple-100 text-purple-600"
    },
    {
      name: "Data Analyst",
      role: "Insights Generator",
      description: "Analyzes your payroll data to provide actionable insights and optimization suggestions.",
      icon: "📈",
      color: "bg-yellow-100 text-yellow-600"
    }
  ];
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm dark:bg-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">PayrollPro AI</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">How It Works</a>
            <a href="#testimonials" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Testimonials</a>
            <a href="#faq" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">FAQ</a>
          </nav>
          <div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <WavyBackground className="py-20" waveColor="rgba(96, 165, 250, 0.15)">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Transform Your Payroll <span className="text-blue-600 dark:text-blue-400">With Intelligent AI</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Our AI-powered system handles tax calculations, compliance, and expense categorization, 
                giving you peace of mind and saving you hours every month.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center">
                  Get Started 
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 ml-2" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
                <button className="px-6 py-3 bg-blue-100 text-blue-600 font-medium rounded-lg hover:bg-blue-200 transition-colors inline-flex items-center justify-center">
                  See it in action
                </button>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="w-32 h-32 mx-auto md:mx-0">
                    <AnimatedRobot />
                  </div>
                  <div className="col-span-2">
                    <ChatBubble 
                      initialMessage="Hello! I'm PayBuddy, your AI payroll assistant. I can help with tax calculations, compliance questions, and expense categorization. Try me out!" 
                      agentName="PayBuddy"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </WavyBackground>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide">Features</h2>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              Smart Payroll Management with Specialized AI Agents
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 relative">
              <div className="flex justify-center mb-12">
                <FloatingIllustration 
                  src="/illustrations/calculator.svg" 
                  alt="Tax Calculator" 
                  width={100} 
                  height={100} 
                />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white text-center">Tax Calculator</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">Handles all tax calculations with precision. Calculates federal, state, and local taxes automatically.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 relative">
              <div className="flex justify-center mb-12">
                <FloatingIllustration 
                  src="/illustrations/shield.svg" 
                  alt="Compliance Advisor" 
                  width={100} 
                  height={100} 
                  delay={0.5}
                />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white text-center">Compliance Advisor</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">Stays up-to-date with changing regulations and alerts you to upcoming deadlines.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 relative">
              <div className="flex justify-center mb-12">
                <FloatingIllustration 
                  src="/illustrations/briefcase.svg" 
                  alt="Expense Categorizer" 
                  width={100} 
                  height={100} 
                  delay={1}
                />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white text-center">Expense Categorizer</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">Automatically categorizes business expenses and identifies tax deduction opportunities.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* AI Agents Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide">AI Agents</h2>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              Meet Your AI Assistants
            </p>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our specialized AI agents work together to handle every aspect of your payroll process, combining expertise in different domains.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto mb-10">
            {agents.map((agent, index) => (
              <AnimatedAgentCard 
                key={agent.name} 
                agent={agent}
                index={index}
                isSelected={selectedAgent === agent.name}
                onClick={() => setSelectedAgent(agent.name)}
              />
            ))}
          </div>
          
          {selectedAgent && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-4xl mx-auto">
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 
                ${agents.find(a => a.name === selectedAgent)?.color}`}>
                  <span className="text-xl">{agents.find(a => a.name === selectedAgent)?.icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedAgent}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {agents.find(a => a.name === selectedAgent)?.role}
                  </p>
                </div>
              </div>
              
              <ChatBubble 
                initialMessage={`I'm the ${selectedAgent}. ${agents.find(a => a.name === selectedAgent)?.description} How can I assist you today?`}
                agentName={selectedAgent}
                agentAvatar={agents.find(a => a.name === selectedAgent)?.icon}
                placeholder={`Ask the ${selectedAgent} something...`}
              />
            </div>
          )}
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute top-20 right-10 w-40 h-40 bg-blue-100 rounded-full opacity-20 dark:opacity-10"></div>
        <div className="absolute bottom-20 left-10 w-60 h-60 bg-blue-200 rounded-full opacity-20 dark:opacity-10"></div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-gray-800/50 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
              How It Works
            </span>
            
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-gray-900 dark:text-white">
              Get started in three easy steps
            </h2>
            
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Our streamlined process gets you up and running quickly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {[
              {
                number: 1,
                title: "Connect Your Data",
                description: "Integrate with your existing HR systems or import employee data directly.",
                illustration: "/illustrations/step1.svg"
              },
              {
                number: 2,
                title: "Configure AI Agents",
                description: "Set up tax rules, expense categories, and compliance requirements for your business.",
                illustration: "/illustrations/step2.svg"
              },
              {
                number: 3,
                title: "Run & Review",
                description: "Process payroll with AI assistance and review the results before finalizing.",
                illustration: "/illustrations/step3.svg"
              }
            ].map((step, index) => (
              <div key={step.number} className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  {/* Step Illustration */}
                  <div className="w-40 h-40 mb-4 mx-auto">
                    <FloatingIllustration 
                      src={step.illustration} 
                      alt={step.title} 
                      width={150} 
                      height={150} 
                      delay={index * 0.3}
                    />
                  </div>
                  
                  {/* Step Number */}
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center z-10 relative mx-auto my-4">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{step.number}</span>
                  </div>
                  
                  {/* Connect steps with lines, except for the last step */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-20 left-full w-full h-0.5 bg-blue-200 dark:bg-blue-800 -z-10 transform -translate-y-1/2" style={{ width: 'calc(100% - 3rem)' }} />
                  )}
                </div>
                
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100 rounded-full opacity-20 dark:opacity-10"></div>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-200 rounded-full opacity-20 dark:opacity-10"></div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide">Testimonials</h2>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              What Our Customers Say
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "PayrollPro AI has completely transformed how we handle payroll. The tax calculations are flawless and save us hours every month.",
                author: "Sarah Johnson",
                role: "HR Director, TechCorp Inc.",
                imageSrc: "https://randomuser.me/api/portraits/women/1.jpg"
              },
              {
                quote: "The compliance monitoring feature has saved us from potential penalties multiple times. It's like having a regulatory expert on staff 24/7.",
                author: "Michael Chen",
                role: "CFO, StartUp Ventures",
                imageSrc: "https://randomuser.me/api/portraits/men/2.jpg"
              },
              {
                quote: "I'm amazed how the AI categorizes our expenses with such accuracy. Tax time is no longer stressful - everything is organized perfectly.",
                author: "Emma Rodriguez",
                role: "Accountant, Global Services LLC",
                imageSrc: "https://randomuser.me/api/portraits/women/3.jpg"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <img src={testimonial.imageSrc} alt={testimonial.author} className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide">FAQ</h2>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              Frequently Asked Questions
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {[
              {
                question: "How does the AI tax calculation work?",
                answer: "Our AI tax calculation system uses machine learning models trained on the latest tax laws and regulations. It automatically applies the correct tax rates, deductions, and credits based on your specific situation and location."
              },
              {
                question: "Can PayrollPro AI handle multi-state payroll?",
                answer: "Yes! Our system is specifically designed to handle multi-state payroll complexities. It automatically applies the correct state tax rates and follows all state-specific regulations for each employee."
              },
              {
                question: "How does the compliance monitoring work?",
                answer: "Our AI continuously monitors federal, state, and local tax law changes. When changes occur that might affect your business, you receive immediate notifications with explanation and recommended actions."
              },
              {
                question: "Is my data secure with PayrollPro AI?",
                answer: "Absolutely. We use bank-level encryption for all data storage and transfers. Our systems undergo regular security audits and we maintain SOC 2 compliance. Your data privacy and security is our top priority."
              },
              {
                question: "How much time will I save using PayrollPro AI?",
                answer: "Most customers report saving 5-10 hours per month on payroll processing. The exact time saved depends on your company size and complexity, but our automated systems handle the complex calculations and compliance checks that typically take the most time."
              }
            ].map((faq, index) => (
              <div key={index} className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{faq.question}</h3>
                <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Payroll Management?
          </h2>
          
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that are saving time and ensuring compliance with our AI-powered payroll system.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center justify-center shadow-lg">
              Start Free Trial
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-colors inline-flex items-center justify-center">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">PayrollPro AI</h3>
              <p className="mb-4">Advanced AI-powered payroll processing for modern businesses.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
                <li><a href="#" className="hover:text-white">Updates</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Guides</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Legal</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p>&copy; 2025 PayrollPro AI. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white mr-4">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default SimpleApp;