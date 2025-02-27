"use client";

import { useState } from "react";
import FAQItem from "@/components/ui/FAQItem";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const faqItems = [
    {
      question: "How does the payroll processing work?",
      answer: "Our payroll processing is fully automated. You simply review and approve payroll before each pay period, and our system handles the calculations, tax withholdings, and payments. Employees receive direct deposits on payday, and all relevant tax forms are automatically generated and filed."
    },
    {
      question: "Is PayrollPro suitable for my business size?",
      answer: "Yes! PayrollPro is designed to scale with your business. We serve clients ranging from small businesses with just a few employees to enterprises with thousands of team members. Our tiered pricing ensures you only pay for what you need, and you can upgrade as your business grows."
    },
    {
      question: "How secure is my company and employee data?",
      answer: "Security is our top priority. PayrollPro employs bank-level security measures including 256-bit encryption, multi-factor authentication, and regular security audits. We're SOC 2 certified and compliant with all relevant data protection regulations, ensuring your sensitive information is always protected."
    },
    {
      question: "Can PayrollPro integrate with my existing systems?",
      answer: "Absolutely. PayrollPro offers seamless integration with popular accounting software, time tracking tools, HR systems, and more. Our Professional and Enterprise plans include API access for custom integrations with your existing business systems. We can help determine the best integration strategy for your specific needs."
    },
    {
      question: "How long does it take to set up PayrollPro?",
      answer: "Most businesses are up and running with PayrollPro in less than a week. Our implementation team helps with the setup process, including importing employee data, configuring tax settings, and training your team. For larger organizations with complex needs, we offer dedicated implementation support to ensure a smooth transition."
    },
    {
      question: "What kind of customer support do you offer?",
      answer: "We provide email and phone support for all customers. Basic and Professional plans include standard support during business hours, while Enterprise customers enjoy priority support with dedicated account managers. Our comprehensive knowledge base and video tutorials are available 24/7 for all users."
    }
  ];
  
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  
  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-text-light">
            Got questions? We've got answers.
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <FAQItem 
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              toggleFAQ={() => toggleFAQ(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
