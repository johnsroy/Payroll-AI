"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Check, HelpCircle } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface Feature {
  name: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  description: string;
  price: number;
  features: Feature[];
  ctaText: string;
  popular: boolean;
}

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  
  // Pricing plans data
  const pricingPlans: PricingPlan[] = [
    {
      name: "Starter",
      description: "For small businesses just getting started with payroll.",
      price: isAnnual ? 10 : 12,
      features: [
        { name: "Up to 10 employees", included: true },
        { name: "Basic payroll processing", included: true },
        { name: "Direct deposit", included: true },
        { name: "Employee self-service portal", included: true },
        { name: "Tax filing", included: false },
        { name: "Benefits administration", included: false },
        { name: "Time tracking integration", included: false },
        { name: "HR support", included: false },
        { name: "Custom reporting", included: false },
        { name: "Dedicated account manager", included: false },
      ],
      ctaText: "Get Started",
      popular: false,
    },
    {
      name: "Professional",
      description: "For growing businesses that need more features and support.",
      price: isAnnual ? 20 : 25,
      features: [
        { name: "Unlimited employees", included: true },
        { name: "Advanced payroll processing", included: true },
        { name: "Direct deposit", included: true },
        { name: "Employee self-service portal", included: true },
        { name: "Tax filing", included: true },
        { name: "Benefits administration", included: true },
        { name: "Time tracking integration", included: true },
        { name: "HR support", included: false },
        { name: "Custom reporting", included: false },
        { name: "Dedicated account manager", included: false },
      ],
      ctaText: "Get Started",
      popular: true,
    },
    {
      name: "Enterprise",
      description: "For larger organizations with complex payroll needs.",
      price: isAnnual ? 30 : 35,
      features: [
        { name: "Unlimited employees", included: true },
        { name: "Advanced payroll processing", included: true },
        { name: "Direct deposit", included: true },
        { name: "Employee self-service portal", included: true },
        { name: "Tax filing", included: true },
        { name: "Benefits administration", included: true },
        { name: "Time tracking integration", included: true },
        { name: "HR support", included: true },
        { name: "Custom reporting", included: true },
        { name: "Dedicated account manager", included: true },
      ],
      ctaText: "Contact Sales",
      popular: false,
    },
  ];

  // FAQ data
  const faqs = [
    {
      question: "How does the per-employee pricing work?",
      answer: "Our pricing is simple and transparent. You pay a monthly fee for each active employee in your system. There are no hidden fees or long-term contracts. You can add or remove employees at any time, and your billing will be adjusted accordingly.",
    },
    {
      question: "Can I switch plans later?",
      answer: "Absolutely! You can upgrade or downgrade your plan at any time. When you upgrade, you'll get immediate access to all the features in your new plan. If you downgrade, the changes will take effect at the start of your next billing cycle.",
    },
    {
      question: "Is there a setup fee?",
      answer: "No, there are no setup fees for any of our plans. You only pay the monthly or annual subscription fee based on the plan you choose and the number of employees you have.",
    },
    {
      question: "Do you offer a free trial?",
      answer: "Yes, we offer a 14-day free trial for all our plans. No credit card is required to start your trial. You'll have full access to all features in your selected plan during the trial period.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) as well as ACH bank transfers for annual subscriptions.",
    },
    {
      question: "Is there a discount for non-profits?",
      answer: "Yes, we offer a 20% discount for verified non-profit organizations. Please contact our sales team with your non-profit documentation to apply for the discount.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-12 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-text-dark mb-4">Transparent Pricing for Every Business Size</h1>
              <p className="text-lg text-text-light max-w-3xl mx-auto mb-8">
                Choose the plan that fits your needs. All plans include core payroll features with no hidden fees.
              </p>
              
              {/* Pricing Toggle */}
              <div className="flex items-center justify-center mb-12">
                <span className={`mr-4 text-sm ${isAnnual ? 'text-text-dark font-medium' : 'text-text-light'}`}>
                  Annual
                  <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Save 20%</span>
                </span>
                <button 
                  onClick={() => setIsAnnual(!isAnnual)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isAnnual ? 'bg-gray-200' : 'bg-primary'}`}
                >
                  <span 
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAnnual ? 'translate-x-1' : 'translate-x-6'}`}
                  />
                </button>
                <span className={`ml-4 text-sm ${!isAnnual ? 'text-text-dark font-medium' : 'text-text-light'}`}>
                  Monthly
                </span>
              </div>
            </div>
          </div>
        </section>
        
        {/* Pricing Cards */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {pricingPlans.map((plan) => (
                <div 
                  key={plan.name}
                  className={`bg-white rounded-lg border overflow-hidden transition-all hover:shadow-md relative ${
                    plan.popular ? 'border-primary shadow-md' : 'border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-text-light text-sm mt-2 h-12">{plan.description}</p>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="ml-1 text-text-light">/ month per employee</span>
                    </div>
                    {isAnnual && (
                      <p className="text-xs text-green-600 mt-1">Billed annually (${plan.price * 12}/year per employee)</p>
                    )}
                    
                    <button 
                      className={`mt-6 w-full py-2 px-4 rounded-md transition duration-200 ${
                        plan.popular 
                          ? 'bg-primary hover:bg-primary-dark text-white' 
                          : 'bg-white border border-primary text-primary hover:bg-primary/5'
                      }`}
                    >
                      {plan.ctaText}
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
                    <h4 className="text-sm font-medium mb-4">Features include:</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          {feature.included ? (
                            <Check className="text-green-500 h-5 w-5 mr-2 flex-shrink-0" />
                          ) : (
                            <span className="h-5 w-5 mr-2 flex-shrink-0"></span>
                          )}
                          <span className={feature.included ? 'text-text-dark' : 'text-text-light'}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Feature Comparison Table - Hidden on mobile, visible on desktop */}
        <section className="py-12 bg-gray-50 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-text-dark mb-4">Compare Features</h2>
              <p className="text-text-light">
                A detailed comparison of what's included in each plan
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-4 px-6 text-left text-sm font-medium text-text-light">Feature</th>
                    {pricingPlans.map((plan) => (
                      <th key={plan.name} className="py-4 px-6 text-center text-sm font-medium text-text-dark">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pricingPlans[0].features.map((feature, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="py-4 px-6 text-sm text-text-dark">
                        <div className="flex items-center">
                          {feature.name}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="w-64">More information about {feature.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </td>
                      {pricingPlans.map((plan) => (
                        <td key={`${plan.name}-${index}`} className="py-4 px-6 text-center">
                          {plan.features[index].included ? (
                            <Check className="text-green-500 h-5 w-5 mx-auto" />
                          ) : (
                            <span className="text-gray-300">—</span>
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
        
        {/* FAQ Section */}
        <section className="py-12 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-text-dark mb-4">Frequently Asked Questions</h2>
              <p className="text-text-light">
                Have questions? We've got answers.
              </p>
            </div>
            
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-text-dark mb-2">{faq.question}</h3>
                  <p className="text-text-light">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-12 bg-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to simplify your payroll?</h2>
            <p className="text-white text-opacity-90 mb-8 max-w-3xl mx-auto">
              Join thousands of businesses that trust PayrollPro for their payroll needs.
              Start your 14-day free trial today.
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
        </section>
      </main>
      <Footer />
    </div>
  );
}