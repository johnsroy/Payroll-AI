"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { 
  Clock, 
  CreditCard, 
  FileText, 
  BarChart, 
  Users, 
  Shield, 
  Calendar, 
  Database,
  Smartphone,
  Book
} from "lucide-react";
import { Link } from "wouter";

export default function FeaturesPage() {
  // Define feature cards
  const features = [
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Time & Attendance",
      description: "Accurately track employee work hours with automated time tracking and approval workflows.",
      link: "/product-features#time-attendance"
    },
    {
      icon: <CreditCard className="h-8 w-8 text-primary" />,
      title: "Payroll Processing",
      description: "Process payroll in minutes with automated tax calculations and direct deposit options.",
      link: "/product-features#payroll-processing"
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Tax Compliance",
      description: "Stay compliant with automatic tax filing and reporting for federal, state, and local taxes.",
      link: "/product-features#tax-compliance"
    },
    {
      icon: <BarChart className="h-8 w-8 text-primary" />,
      title: "Reporting & Analytics",
      description: "Access insightful reports and analytics to make data-driven decisions for your business.",
      link: "/product-features#reporting"
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Employee Self-Service",
      description: "Empower employees with self-service access to pay stubs, tax documents, and benefits information.",
      link: "/product-features#employee-self-service"
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Security & Compliance",
      description: "Protect sensitive data with enterprise-grade security and compliance measures.",
      link: "/product-features#security"
    },
    {
      icon: <Calendar className="h-8 w-8 text-primary" />,
      title: "Leave Management",
      description: "Streamline PTO requests, approvals, and tracking with automated leave management.",
      link: "/product-features#leave-management"
    },
    {
      icon: <Database className="h-8 w-8 text-primary" />,
      title: "Benefits Administration",
      description: "Simplify benefits enrollment, management, and reporting in one integrated system.",
      link: "/product-features#benefits"
    },
    {
      icon: <Smartphone className="h-8 w-8 text-primary" />,
      title: "Mobile Access",
      description: "Access PayrollPro anytime, anywhere with our responsive mobile experience.",
      link: "/product-features#mobile"
    }
  ];

  // Define feature comparison data
  const comparisonFeatures = [
    "Automated Payroll Processing",
    "Direct Deposit",
    "Tax Filing & Compliance",
    "Employee Self-Service Portal",
    "Time & Attendance Tracking",
    "Mobile Access",
    "Benefits Administration",
    "Reporting & Analytics",
    "HR Document Management",
    "PTO Management",
    "Multiple Pay Rates",
    "Contractor Payments",
    "24/7 Customer Support",
    "Data Security & Encryption",
    "API Integration"
  ];

  const competitors = [
    {
      name: "PayrollPro",
      features: comparisonFeatures.map(() => true)
    },
    {
      name: "Competitor A",
      features: [
        true, true, true, true, true, true, false, true, false, true, false, true, false, true, false
      ]
    },
    {
      name: "Competitor B",
      features: [
        true, true, true, false, true, false, true, false, true, true, false, false, true, true, false
      ]
    }
  ];
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl font-bold text-text-dark mb-4">Powerful Features for Modern Payroll</h1>
              <p className="text-lg text-text-light max-w-3xl mx-auto">
                Discover how PayrollPro's comprehensive suite of features can streamline your payroll process and improve compliance.
              </p>
            </div>
            
            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-text-light mb-4">{feature.description}</p>
                  <Link 
                    href={feature.link}
                    className="text-primary font-medium hover:underline flex items-center"
                  >
                    Learn more
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Interactive Demo Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between md:space-x-12">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h2 className="text-3xl font-bold text-text-dark mb-4">See PayrollPro in Action</h2>
                <p className="text-text-light mb-6">
                  Watch our interactive demo to see how easy it is to process payroll, manage employees, and stay compliant with PayrollPro.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <span className="text-primary font-medium text-sm">1</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-text-dark">Setup your company profile</h3>
                      <p className="text-text-light">
                        Enter your company details, tax information, and payment preferences to get started.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <span className="text-primary font-medium text-sm">2</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-text-dark">Add your employees</h3>
                      <p className="text-text-light">
                        Import or manually add employee information, tax withholdings, and salary details.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <span className="text-primary font-medium text-sm">3</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-text-dark">Run your first payroll</h3>
                      <p className="text-text-light">
                        Review hours, approve time, and process payroll in just a few clicks.
                      </p>
                    </div>
                  </div>
                </div>
                <button className="mt-8 bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-md transition duration-200">
                  Watch Demo
                </button>
              </div>
              <div className="md:w-1/2 bg-gray-100 rounded-lg overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary/90 cursor-pointer hover:bg-primary transition-colors duration-200">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 0C4.477 0 0 4.477 0 10c0 5.523 4.477 10 10 10 5.523 0 10-4.477 10-10C20 4.477 15.523 0 10 0zm3.5 10.5l-6 4A.5.5 0 016 14V6a.5.5 0 01.788-.41l6 4a.5.5 0 010 .82z" />
                        </svg>
                      </div>
                      <p className="text-text-dark font-medium">Click to Play Demo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Feature Comparison Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-text-dark mb-4">How PayrollPro Compares</h2>
              <p className="text-text-light max-w-3xl mx-auto">
                See how our comprehensive feature set stacks up against the competition.
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full bg-white shadow-sm rounded-lg">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-4 px-6 text-left font-medium text-text-dark border-b border-gray-200">Features</th>
                    {competitors.map((competitor, index) => (
                      <th 
                        key={index} 
                        className={`py-4 px-6 text-center font-medium border-b border-gray-200 ${
                          index === 0 ? 'text-primary' : 'text-text-dark'
                        }`}
                      >
                        {competitor.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, featureIndex) => (
                    <tr key={featureIndex} className={featureIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-3 px-6 text-text-dark border-b border-gray-200">
                        {feature}
                      </td>
                      {competitors.map((competitor, competitorIndex) => (
                        <td 
                          key={`${featureIndex}-${competitorIndex}`} 
                          className="py-3 px-6 text-center border-b border-gray-200"
                        >
                          {competitor.features[featureIndex] ? (
                            <svg 
                              className={`mx-auto h-5 w-5 ${competitorIndex === 0 ? 'text-primary' : 'text-green-500'}`} 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg 
                              className="mx-auto h-5 w-5 text-gray-300" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        
        {/* Use Cases Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-text-dark mb-4">Perfect for Businesses of All Sizes</h2>
              <p className="text-text-light max-w-3xl mx-auto">
                See how different types of businesses use PayrollPro to streamline their payroll processes.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Small Business */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">Small Business</h3>
                  <p className="text-text-light mb-6">
                    Save time and reduce errors with automated payroll that's easy to set up and use.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Simple, straightforward interface</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Affordable per-employee pricing</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Tax filing and compliance</span>
                    </li>
                  </ul>
                  <a href="#" className="text-primary font-medium hover:underline flex items-center">
                    Learn more
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
              
              {/* Mid-Size Business */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">Mid-Size Business</h3>
                  <p className="text-text-light mb-6">
                    Scale your payroll process with advanced features and integrations.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Multiple pay rates and schedules</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Advanced reporting and analytics</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Benefits administration</span>
                    </li>
                  </ul>
                  <a href="#" className="text-primary font-medium hover:underline flex items-center">
                    Learn more
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
              
              {/* Enterprise */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">Enterprise</h3>
                  <p className="text-text-light mb-6">
                    Comprehensive solutions for complex payroll needs across multiple locations.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Multi-state tax compliance</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Dedicated account manager</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>API access and custom integrations</span>
                    </li>
                  </ul>
                  <a href="#" className="text-primary font-medium hover:underline flex items-center">
                    Learn more
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to experience PayrollPro?</h2>
              <p className="text-white text-opacity-90 mb-8">
                Join thousands of businesses that have simplified their payroll process with PayrollPro.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button className="bg-white text-primary font-medium py-3 px-6 rounded-md hover:bg-gray-100 transition duration-200">
                  Start Free Trial
                </button>
                <button className="bg-white bg-opacity-20 text-white font-medium py-3 px-6 rounded-md hover:bg-opacity-30 transition duration-200">
                  Schedule a Demo
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}