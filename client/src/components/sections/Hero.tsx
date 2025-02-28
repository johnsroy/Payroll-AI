import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { GradientBackground } from '../animations/GradientBackground';

export default function Hero() {
  const features = [
    'AI-powered payroll automation',
    'Tax compliance across all 50 states',
    'Real-time expense categorization',
    'Secure employee self-service'
  ];

  return (
    <GradientBackground className="min-h-[90vh] flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Smarter Payroll <br />
                <span className="text-blue-600">Powered by AI</span>
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p className="text-xl text-gray-600 mb-8">
                Revolutionize your payroll process with our AI-powered system that automates calculations, 
                ensures compliance, and provides valuable insights into your business finances.
              </p>
            </motion.div>
            
            <motion.div
              className="mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-center text-gray-700"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Link href="/signup">
                <div className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium text-center transition-colors duration-200 flex items-center justify-center">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </Link>
              <Link href="/demo">
                <div className="border border-gray-300 hover:border-gray-400 bg-white text-gray-800 px-6 py-3 rounded-lg font-medium text-center transition-colors duration-200">
                  Request Demo
                </div>
              </Link>
            </motion.div>
          </div>
          
          {/* Right column - Image/Illustration */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="bg-white p-4 rounded-2xl shadow-xl">
              <div className="aspect-w-4 aspect-h-3 bg-gray-100 rounded-lg overflow-hidden relative">
                {/* This is a placeholder for an actual image or illustration */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="text-blue-600 font-bold text-xl">PayrollPro AI Dashboard</div>
                </div>
              </div>
              
              {/* Dashboard stats */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Time Saved</div>
                  <div className="text-2xl font-bold text-blue-700">35%</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Accuracy</div>
                  <div className="text-2xl font-bold text-green-700">99.9%</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Cost Reduced</div>
                  <div className="text-2xl font-bold text-purple-700">42%</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Compliance</div>
                  <div className="text-2xl font-bold text-orange-700">100%</div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-blue-100 rounded-full z-[-1]"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-green-100 rounded-full z-[-1]"></div>
          </motion.div>
        </div>
      </div>
    </GradientBackground>
  );
}