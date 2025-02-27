"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PricingCard from "@/components/ui/PricingCard";
import { Switch } from "@/components/ui/switch";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  const toggleBilling = () => {
    setIsAnnual(!isAnnual);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl font-bold text-primary mb-4">Simple, Transparent Pricing</h1>
              <p className="text-xl text-text-light max-w-3xl mx-auto">
                Choose the plan that works best for your business, with no hidden fees or long-term contracts.
              </p>
              
              <div className="flex items-center justify-center mt-8">
                <span className={`mr-3 text-sm ${!isAnnual ? 'font-medium text-primary' : 'text-text-light'}`}>
                  Monthly
                </span>
                <Switch 
                  checked={isAnnual} 
                  onCheckedChange={toggleBilling}
                  aria-label="Toggle billing frequency"
                />
                <span className={`ml-3 text-sm ${isAnnual ? 'font-medium text-primary' : 'text-text-light'}`}>
                  Annual <span className="text-xs text-green-500 font-medium">(Save 20%)</span>
                </span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <PricingCard 
                name="Starter" 
                description="Perfect for small businesses just getting started with payroll."
                price={isAnnual ? 8 : 10}
                isAnnual={isAnnual}
                features={[
                  { name: "Up to 10 employees", included: true },
                  { name: "Basic tax filing", included: true },
                  { name: "Direct deposit", included: true },
                  { name: "Employee self-service", included: true },
                  { name: "Benefits administration", included: false },
                  { name: "Time tracking", included: false },
                  { name: "Priority support", included: false },
                ]}
                ctaText="Get Started"
                popular={false}
              />
              <PricingCard 
                name="Professional" 
                description="For growing businesses that need more advanced features and support."
                price={isAnnual ? 16 : 20}
                isAnnual={isAnnual}
                features={[
                  { name: "Up to 50 employees", included: true },
                  { name: "Full tax filing & compliance", included: true },
                  { name: "Direct deposit", included: true },
                  { name: "Employee self-service", included: true },
                  { name: "Benefits administration", included: true },
                  { name: "Time tracking", included: true },
                  { name: "Priority support", included: false },
                ]}
                ctaText="Get Started"
                popular={true}
              />
              <PricingCard 
                name="Enterprise" 
                description="For larger organizations with complex payroll needs."
                price={isAnnual ? 24 : 30}
                isAnnual={isAnnual}
                features={[
                  { name: "Unlimited employees", included: true },
                  { name: "Full tax filing & compliance", included: true },
                  { name: "Direct deposit", included: true },
                  { name: "Employee self-service", included: true },
                  { name: "Benefits administration", included: true },
                  { name: "Time tracking", included: true },
                  { name: "Priority support", included: true },
                ]}
                ctaText="Contact Sales"
                popular={false}
              />
            </div>
            
            <div className="mt-16 bg-gray-50 p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-medium mb-2">Can I change plans later?</h3>
                  <p className="text-text-light">Yes, you can upgrade or downgrade your plan at any time with no penalties.</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Is there a setup fee?</h3>
                  <p className="text-text-light">No, there are no setup fees for any of our plans.</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Do you offer a free trial?</h3>
                  <p className="text-text-light">Yes, all plans come with a 14-day free trial so you can test the features.</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">What payment methods do you accept?</h3>
                  <p className="text-text-light">We accept all major credit cards and ACH bank transfers.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}