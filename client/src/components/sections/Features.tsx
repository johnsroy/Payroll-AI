import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Calculator, Clock, CheckSquare, Shield, ChartBar, DollarSign, FileText, Users 
} from 'lucide-react';
import { AnimatedFeatureCard } from '../animations/AnimatedFeatureCard';
import { WavyBackground } from '../animations/WavyBackground';

export default function Features() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const features = [
    {
      icon: <Calculator className="w-6 h-6 text-blue-600" />,
      title: 'Automated Payroll',
      description: 'Process payroll in minutes with our AI-powered automation system that calculates taxes and deductions with precision.'
    },
    {
      icon: <Clock className="w-6 h-6 text-blue-600" />,
      title: 'Time Tracking',
      description: 'Track employee hours with our intuitive time tracking system. Supports multiple input methods including mobile and biometric.'
    },
    {
      icon: <CheckSquare className="w-6 h-6 text-blue-600" />,
      title: 'Compliance Management',
      description: 'Stay compliant with federal, state, and local regulations with our continuously updated compliance engine.'
    },
    {
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      title: 'Secure Data Protection',
      description: 'Enterprise-grade security ensures your sensitive payroll data is always protected with encryption and strict access controls.'
    },
    {
      icon: <ChartBar className="w-6 h-6 text-blue-600" />,
      title: 'Advanced Analytics',
      description: 'Gain insights into labor costs, overtime trends, and department budgets with customizable reports and dashboards.'
    },
    {
      icon: <DollarSign className="w-6 h-6 text-blue-600" />,
      title: 'Expense Management',
      description: 'Track, approve, and reimburse employee expenses with AI-powered categorization and fraud detection.'
    },
    {
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      title: 'Tax Filing',
      description: 'Automatically generate and file tax forms including W-2s, 1099s, and quarterly reports with electronic submission.'
    },
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: 'Employee Self-Service',
      description: 'Empower employees with access to paystubs, W-2s, time-off requests, and benefits information through our secure portal.'
    }
  ];

  const headerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <WavyBackground className="py-20" waveColor="#f0f9ff">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="text-center mb-16">
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={headerVariants}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Payroll
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform simplifies complex payroll tasks and provides insights that help you make better decisions.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <AnimatedFeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </WavyBackground>
  );
}