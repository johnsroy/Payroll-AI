"use client";

import FeatureCard from "@/components/ui/FeatureCard";
import { 
  DollarSign, 
  CheckCircle, 
  User, 
  BarChart, 
  FileText, 
  CreditCard 
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <DollarSign className="h-6 w-6 text-primary" />,
      title: "Automated Payroll Processing",
      description: "Set up once and let our system handle the rest. Automatically calculate wages, deductions, and taxes for your entire team.",
      link: "#"
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
      title: "Tax Compliance",
      description: "Stay compliant with automatic tax calculations, filings, and payments at the federal, state, and local levels.",
      link: "#"
    },
    {
      icon: <User className="h-6 w-6 text-primary" />,
      title: "Employee Self-Service",
      description: "Give your team access to their pay stubs, tax forms, and personal information through a secure online portal.",
      link: "#"
    },
    {
      icon: <BarChart className="h-6 w-6 text-primary" />,
      title: "Comprehensive Reporting",
      description: "Generate detailed reports on payroll expenses, taxes, labor costs, and more to gain valuable business insights.",
      link: "#"
    },
    {
      icon: <FileText className="h-6 w-6 text-primary" />,
      title: "HR Document Management",
      description: "Store, organize, and securely share important employee documents and forms with proper access controls.",
      link: "#"
    },
    {
      icon: <CreditCard className="h-6 w-6 text-primary" />,
      title: "Direct Deposit & Payments",
      description: "Deposit employee payments directly to their accounts or generate checks with our flexible payment options.",
      link: "#"
    }
  ];
  
  return (
    <section id="features" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to manage payroll</h2>
          <p className="text-lg text-text-light">
            Our comprehensive platform handles all aspects of payroll, from paychecks to tax filings.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              link={feature.link}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
