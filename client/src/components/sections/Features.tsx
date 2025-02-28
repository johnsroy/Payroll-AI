import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Calculator, 
  FileText, 
  Shield, 
  Briefcase, 
  LineChart, 
  UserPlus
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Features() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const features = [
    {
      icon: <Calculator className="h-10 w-10 text-indigo-600 dark:text-indigo-400 mb-5" />,
      title: "Tax Calculation",
      description: "Intelligent tax calculations for federal, state, and local jurisdictions with automatic updates for regulatory changes."
    },
    {
      icon: <FileText className="h-10 w-10 text-indigo-600 dark:text-indigo-400 mb-5" />,
      title: "Expense Categorization",
      description: "AI-powered expense categorization that learns from your business patterns and adapts to your unique needs."
    },
    {
      icon: <Shield className="h-10 w-10 text-indigo-600 dark:text-indigo-400 mb-5" />,
      title: "Compliance Monitoring",
      description: "Proactive monitoring of regulatory changes and compliance requirements across multiple jurisdictions."
    },
    {
      icon: <Briefcase className="h-10 w-10 text-indigo-600 dark:text-indigo-400 mb-5" />,
      title: "Multi-Entity Support",
      description: "Manage payroll for multiple business entities with different requirements from a single dashboard."
    },
    {
      icon: <LineChart className="h-10 w-10 text-indigo-600 dark:text-indigo-400 mb-5" />,
      title: "Data Analytics",
      description: "Powerful analytics and reporting tools that provide insights into labor costs, tax liabilities, and more."
    },
    {
      icon: <UserPlus className="h-10 w-10 text-indigo-600 dark:text-indigo-400 mb-5" />,
      title: "Employee Self-Service",
      description: "User-friendly portal for employees to access pay stubs, tax documents, and update personal information."
    }
  ];

  return (
    <section className="py-16 md:py-24" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase"
          >
            Features
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-gray-900 dark:text-white"
          >
            Payroll processing reimagined
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300"
          >
            Discover how our AI-powered features can transform your payroll operations
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-6">
                  {feature.icon}
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}