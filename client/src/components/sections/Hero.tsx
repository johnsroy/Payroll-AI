import React from 'react';
import { motion } from 'framer-motion';
import { GradientBackground } from '../animations/GradientBackground';
import { FloatingIllustration } from '../animations/FloatingIllustration';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function Hero() {
  return (
    <GradientBackground className="py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column - text content */}
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 mb-4">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Introducing AI-Powered Payroll
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6"
            >
              Effortless Payroll <span className="text-indigo-600 dark:text-indigo-400">Powered by AI</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-300 mb-8"
            >
              PayrollPro AI revolutionizes payroll processing with advanced multi-agent architecture
              for tax calculations, expense categorization, and compliance management.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-8"
            >
              <Button size="lg" className="group">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">No credit card required</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">Free 14-day trial</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">Cancel anytime</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right column - illustration */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
            >
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 flex items-center justify-center">
                  <div className="text-center text-gray-400 dark:text-gray-500">
                    <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>Dashboard Preview</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-4">
                  <FloatingIllustration 
                    src="/illustrations/robot.svg" 
                    alt="AI Assistant"
                    width={60}
                    height={60}
                    delay={0.3}
                  />
                </div>
                <div className="absolute bottom-0 left-0 p-4">
                  <FloatingIllustration 
                    src="/illustrations/calculator.svg" 
                    alt="Calculator"
                    width={50}
                    height={50}
                    delay={0.5}
                  />
                </div>
                <div className="absolute top-1/4 left-1/4">
                  <FloatingIllustration 
                    src="/illustrations/document.svg" 
                    alt="Document"
                    width={40}
                    height={40}
                    delay={0.7}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </GradientBackground>
  );
}