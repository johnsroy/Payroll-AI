"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { LayoutGrid, Zap, Shield, UserCheck } from "lucide-react";
import FeatureCard from "@/components/ui/FeatureCard";

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl font-bold text-primary mb-4">Powerful Payroll Features</h1>
              <p className="text-xl text-text-light max-w-3xl mx-auto">
                Discover all the tools and capabilities that make PayrollPro the best solution for your business.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<LayoutGrid className="h-8 w-8 text-primary" />}
                title="Automated Payroll Processing" 
                description="Set up recurring payments and automate your entire payroll process with just a few clicks."
                link="#" 
              />
              <FeatureCard 
                icon={<Zap className="h-8 w-8 text-primary" />}
                title="Tax Compliance" 
                description="Automatically calculate, file, and pay all federal, state, and local taxes accurately and on time."
                link="#" 
              />
              <FeatureCard 
                icon={<Shield className="h-8 w-8 text-primary" />}
                title="Secure Employee Portal" 
                description="Give your employees secure access to their pay stubs, tax forms, and benefits information."
                link="#" 
              />
              <FeatureCard 
                icon={<UserCheck className="h-8 w-8 text-primary" />}
                title="Benefits Administration" 
                description="Manage health insurance, retirement plans, and other benefits in one integrated platform."
                link="#" 
              />
              <FeatureCard 
                icon={<LayoutGrid className="h-8 w-8 text-primary" />}
                title="Time Tracking" 
                description="Integrate with time tracking systems or use our built-in tools to track hours worked."
                link="#" 
              />
              <FeatureCard 
                icon={<Zap className="h-8 w-8 text-primary" />}
                title="Reporting & Analytics" 
                description="Generate comprehensive reports on payroll, taxes, benefits, and more to gain valuable insights."
                link="#" 
              />
            </div>
            
            <div className="mt-16 text-center">
              <a 
                href="/pricing" 
                className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-md text-lg font-medium transition inline-block"
              >
                View Pricing Plans
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}