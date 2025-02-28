import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface TimelineStep {
  number: number;
  title: string;
  description: string;
}

export default function HowItWorks() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const steps: TimelineStep[] = [
    {
      number: 1,
      title: "Connect Your Data",
      description: "Integrate with your existing HR systems or import employee data directly."
    },
    {
      number: 2,
      title: "Configure AI Agents",
      description: "Set up tax rules, expense categories, and compliance requirements for your business."
    },
    {
      number: 3,
      title: "Run & Review",
      description: "Process payroll with AI assistance and review the results before finalizing."
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
            How It Works
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-gray-900 dark:text-white"
          >
            Get started in three easy steps
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300"
          >
            Our streamlined process gets you up and running quickly
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
              className="flex flex-col items-center text-center"
            >
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center z-10 relative">
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{step.number}</span>
                </div>
                
                {/* Connect steps with lines, except for the last step */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-indigo-200 dark:bg-indigo-800 -z-10 transform -translate-y-1/2" style={{ width: 'calc(100% - 3rem)' }} />
                )}
              </div>
              
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}