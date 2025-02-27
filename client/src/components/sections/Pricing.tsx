"use client";

import { useState } from "react";
import PricingCard from "@/components/ui/PricingCard";

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  
  const plans = [
    {
      name: "Basic",
      description: "For small businesses just getting started",
      monthlyPrice: 19,
      annualPrice: 15,
      features: [
        { name: "Payroll processing", included: true },
        { name: "Direct deposit", included: true },
        { name: "Basic tax filing", included: true },
        { name: "Employee self-service portal", included: true },
        { name: "Benefits administration", included: false },
        { name: "HR document management", included: false }
      ],
      ctaText: "Get Started",
      popular: false
    },
    {
      name: "Professional",
      description: "For growing businesses with more needs",
      monthlyPrice: 39,
      annualPrice: 31,
      features: [
        { name: "Everything in Basic", included: true },
        { name: "Full tax filing & compliance", included: true },
        { name: "Benefits administration", included: true },
        { name: "HR document management", included: true },
        { name: "Advanced reporting", included: true },
        { name: "Custom workflow automation", included: false }
      ],
      ctaText: "Get Started",
      popular: true
    },
    {
      name: "Enterprise",
      description: "For large organizations with complex needs",
      monthlyPrice: 69,
      annualPrice: 55,
      features: [
        { name: "Everything in Professional", included: true },
        { name: "Custom workflow automation", included: true },
        { name: "API integrations", included: true },
        { name: "Dedicated account manager", included: true },
        { name: "Priority support", included: true },
        { name: "Custom reporting", included: true }
      ],
      ctaText: "Contact Sales",
      popular: false
    }
  ];
  
  const togglePricing = () => {
    setIsAnnual(!isAnnual);
  };
  
  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-lg text-text-light mb-8">
            Choose the plan that works best for your business needs.
          </p>
          
          {/* Pricing Toggle */}
          <div className="flex items-center justify-center space-x-3">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-text-dark' : 'text-text-light'}`}>
              Monthly
            </span>
            <button 
              onClick={togglePricing}
              className={`pricing-toggle relative w-14 h-8 bg-gray-300 rounded-full p-1 transition duration-300 ease-in-out ${isAnnual ? 'active' : ''}`}
              aria-label="Toggle pricing"
            >
              <span className="sr-only">Toggle Pricing</span>
            </button>
            <span className="text-sm">
              Annually <span className="text-green-500 font-medium">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Tables */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <PricingCard 
              key={index}
              name={plan.name}
              description={plan.description}
              price={isAnnual ? plan.annualPrice : plan.monthlyPrice}
              isAnnual={isAnnual}
              features={plan.features}
              ctaText={plan.ctaText}
              popular={plan.popular}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
