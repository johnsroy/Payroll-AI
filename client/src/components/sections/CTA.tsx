import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'wouter';
import { ArrowRight, CreditCard } from 'lucide-react';

export default function CTA() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const variants = {
    hidden: { opacity: 0, y: 30 },
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
    <section className="bg-blue-600 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          ref={ref}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={variants}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left side with content */}
            <div className="p-8 md:p-12 lg:p-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Ready to transform your <span className="text-blue-600">payroll process</span>?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join thousands of businesses that have simplified their payroll, reduced costs, and improved compliance with our AI-powered platform.
              </p>

              <ul className="space-y-4 mb-10">
                <motion.li 
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium">No credit card required</span> to start your 14-day free trial
                  </div>
                </motion.li>
                <motion.li 
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium">Free data migration</span> from your current payroll provider
                  </div>
                </motion.li>
                <motion.li 
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium">Dedicated support</span> throughout your onboarding process
                  </div>
                </motion.li>
              </ul>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <div className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium text-center transition-colors duration-200 flex items-center justify-center">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </Link>
                <Link href="/pricing">
                  <div className="border border-gray-300 hover:border-gray-400 bg-white text-gray-800 px-6 py-3 rounded-lg font-medium text-center transition-colors duration-200">
                    View Pricing Plans
                  </div>
                </Link>
              </div>
            </div>
            
            {/* Right side with image */}
            <div className="hidden lg:block bg-blue-50 p-8 flex items-center justify-center relative">
              {/* Decorative elements */}
              <div className="absolute top-12 right-12 w-20 h-20 bg-blue-100 rounded-full opacity-60"></div>
              <div className="absolute bottom-12 left-12 w-16 h-16 bg-blue-200 rounded-full opacity-60"></div>
              
              {/* Illustration or image placeholder */}
              <div className="relative z-10 bg-white p-6 rounded-xl shadow-lg max-w-md">
                <div className="flex items-center mb-6">
                  <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold">Special Offer</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Sign up today and receive:
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-gray-700">
                    <div className="bg-green-100 rounded-full p-1 mr-2">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    20% off your first 3 months
                  </li>
                  <li className="flex items-center text-gray-700">
                    <div className="bg-green-100 rounded-full p-1 mr-2">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    Free HR compliance consultation
                  </li>
                  <li className="flex items-center text-gray-700">
                    <div className="bg-green-100 rounded-full p-1 mr-2">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    Priority onboarding support
                  </li>
                </ul>
                <div className="text-center py-3 bg-blue-50 rounded-lg text-blue-800 font-semibold">
                  Use code: <span className="text-blue-600">AILAUNCH2025</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}