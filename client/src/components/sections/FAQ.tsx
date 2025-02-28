import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { AnimatedFAQItem } from '../animations/AnimatedFAQItem';

export default function FAQ() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const faqs = [
    {
      question: "What is PayrollPro AI?",
      answer: "PayrollPro AI is an innovative payroll processing solution powered by a multi-agent AI system designed to streamline payroll operations. It combines tax calculation, expense categorization, and compliance monitoring capabilities with an intuitive user interface."
    },
    {
      question: "How does the multi-agent system work?",
      answer: "Our multi-agent architecture divides complex payroll tasks among specialized AI agents, each with its own expertise area. The Tax Agent handles tax calculations, the Expense Agent automates categorization, and the Compliance Agent monitors regulatory changes. These agents work together, coordinated by a central reasoning agent, to deliver comprehensive and accurate payroll processing."
    },
    {
      question: "Is PayrollPro AI suitable for small businesses?",
      answer: "Absolutely! PayrollPro AI is designed to scale with your business needs. Small businesses benefit from automation that reduces administrative overhead, while larger organizations appreciate the advanced compliance features and multi-state tax handling capabilities."
    },
    {
      question: "How accurate is the tax calculation?",
      answer: "Our Tax Agent maintains an up-to-date database of federal, state, and local tax regulations across all 50 states. The system continuously monitors regulatory changes and updates its calculations accordingly, ensuring accurate payroll tax calculations with over 99.9% accuracy."
    },
    {
      question: "Can PayrollPro AI integrate with my existing software?",
      answer: "Yes, PayrollPro AI offers integration capabilities with popular accounting software, time-tracking tools, and HR management systems through our API. We also offer pre-built integrations with major platforms like QuickBooks, Xero, ADP, and many others."
    },
    {
      question: "How is my data secured?",
      answer: "PayrollPro AI employs bank-level security protocols, including end-to-end encryption, multi-factor authentication, and regular security audits. We are SOC 2 Type II certified and fully compliant with GDPR and other relevant data protection regulations."
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800/50">
      <div className="container mx-auto px-4" ref={ref}>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase"
          >
            FAQ
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-gray-900 dark:text-white"
          >
            Frequently Asked Questions
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300"
          >
            Find answers to common questions about PayrollPro AI
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-3xl mx-auto divide-y divide-gray-200 dark:divide-gray-700"
        >
          {faqs.map((faq, index) => (
            <AnimatedFAQItem 
              key={index}
              question={faq.question}
              answer={faq.answer}
              initiallyOpen={index === 0}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}