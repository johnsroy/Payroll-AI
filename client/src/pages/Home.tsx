import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { AnimatedChatWidget } from '@/components/ui/AnimatedChatWidget';
import { BackgroundParticles } from '@/components/animations/BackgroundParticles';
import { GradientBackground } from '@/components/animations/GradientBackground';
import { WavyBackground } from '@/components/animations/WavyBackground';
import { AnimatedFeatureCard } from '@/components/animations/AnimatedFeatureCard';
import { AnimatedTimeline } from '@/components/animations/AnimatedTimeline';
import { AnimatedFAQItem } from '@/components/animations/AnimatedFAQItem';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <GradientBackground>
        <section className="relative py-20 overflow-hidden">
          <BackgroundParticles />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center">
              <motion.div 
                className="lg:w-1/2 mb-10 lg:mb-0"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.h1 
                  className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  Transform Your Payroll <motion.span 
                    className="text-blue-600 inline-block"
                    animate={{ 
                      scale: [1, 1.05, 1],
                      color: ["#3b82f6", "#2563eb", "#3b82f6"]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >With Intelligent AI</motion.span>
                </motion.h1>
                <motion.p 
                  className="text-xl text-gray-600 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  Our AI-powered system handles tax calculations, compliance, and expense categorization, 
                  giving you peace of mind and saving you hours every month.
                </motion.p>
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <Link href="/signup">
                    <motion.a 
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Get Started 
                      <motion.svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 ml-2" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </motion.svg>
                    </motion.a>
                  </Link>
                  <motion.a 
                    href="#demo" 
                    className="px-6 py-3 bg-blue-100 text-blue-600 font-medium rounded-lg hover:bg-blue-200 transition-colors inline-flex items-center justify-center cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    See it in action
                  </motion.a>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="lg:w-1/2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <motion.div 
                  className="bg-white rounded-lg shadow-xl p-6 relative z-10"
                  whileHover={{ 
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                    y: -5,
                    transition: { duration: 0.3 }
                  }}
                >
                  <div className="flex items-center mb-4">
                    <motion.div 
                      className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center mr-4"
                      animate={{ 
                        rotate: [0, 10, 0, -10, 0],
                        scale: [1, 1.1, 1, 1.1, 1] 
                      }}
                      transition={{ 
                        duration: 5, 
                        repeat: Infinity,
                        delay: 1
                      }}
                    >
                      <span className="text-xl">🤖</span>
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">PayBuddy</h3>
                      <p className="text-gray-600">Your AI payroll assistant</p>
                    </div>
                  </div>
                  <motion.div 
                    className="bg-blue-50 rounded-lg p-4 mb-4"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <p className="text-gray-700">
                      Hello! I'm PayBuddy, your AI payroll assistant. I can help with tax calculations, compliance questions, and expense categorization. Try me out!
                    </p>
                  </motion.div>
                  <motion.p 
                    className="text-sm text-gray-500 italic text-center"
                    animate={{ 
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Click the chat bubble in the corner to interact with PayBuddy
                  </motion.p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
      </GradientBackground>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-blue-600 font-semibold uppercase tracking-wide">Features</h2>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              Smart Payroll Management with Specialized AI Agents
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedFeatureCard 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              }
              title="Tax Calculator"
              description="Handles all tax calculations with precision. Calculates federal, state, and local taxes automatically."
              index={0}
            />
            
            <AnimatedFeatureCard 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              title="Compliance Advisor"
              description="Stays up-to-date with changing regulations and alerts you to upcoming deadlines."
              index={1}
            />
            
            <AnimatedFeatureCard 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
              title="Expense Categorizer"
              description="Automatically categorizes business expenses and identifies tax deduction opportunities."
              index={2}
            />
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-blue-600 font-semibold uppercase tracking-wide">How It Works</h2>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              Powered by Advanced AI Agents
            </p>
          </motion.div>
          
          <AnimatedTimeline 
            items={[
              {
                number: 1,
                title: "Upload Data",
                description: "Connect your accounting software or upload your payroll data."
              },
              {
                number: 2,
                title: "AI Analysis",
                description: "Our specialized AI agents analyze and categorize your data."
              },
              {
                number: 3,
                title: "Get Insights",
                description: "Receive tailored recommendations and compliance alerts."
              },
              {
                number: 4,
                title: "Save Time",
                description: "Process payroll with confidence, saving hours every month."
              }
            ]} 
          />
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-blue-600 font-semibold uppercase tracking-wide">FAQ</h2>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              Frequently Asked Questions
            </p>
          </motion.div>
          
          <div className="max-w-3xl mx-auto">
            <AnimatedFAQItem 
              question="How does the AI tax calculation work?" 
              answer="Our AI tax calculation system uses machine learning models trained on the latest tax laws and regulations. It automatically applies the correct tax rates, deductions, and credits based on your specific situation and location."
            />
            <AnimatedFAQItem 
              question="Can PayrollPro AI handle multi-state payroll?" 
              answer="Yes! Our system is specifically designed to handle multi-state payroll complexities. It automatically applies the correct state tax rates and follows all state-specific regulations for each employee."
            />
            <AnimatedFAQItem 
              question="How does the compliance monitoring work?" 
              answer="Our AI continuously monitors federal, state, and local tax law changes. When changes occur that might affect your business, you receive immediate notifications with explanation and recommended actions."
            />
            <AnimatedFAQItem 
              question="Is my data secure with PayrollPro AI?" 
              answer="Absolutely. We use bank-level encryption for all data storage and transfers. Our systems undergo regular security audits and we maintain SOC 2 compliance. Your data privacy and security is our top priority."
            />
            <AnimatedFAQItem 
              question="How much time will I save using PayrollPro AI?" 
              answer="Most customers report saving 5-10 hours per month on payroll processing. The exact time saved depends on your company size and complexity, but our automated systems handle the complex calculations and compliance checks that typically take the most time."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white relative overflow-hidden">
        <WavyBackground waveColor="#ffffff" className="py-20">
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              Ready to Transform Your Payroll Management?
            </motion.h2>
            
            <motion.p 
              className="text-xl mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              Join thousands of businesses that are saving time and ensuring compliance with our AI-powered payroll system.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/signup">
                <motion.a
                  className="px-8 py-4 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Free Trial
                </motion.a>
              </Link>
              <Link href="/demo">
                <motion.a
                  className="px-8 py-4 bg-transparent border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-colors inline-flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Schedule Demo
                </motion.a>
              </Link>
            </motion.div>
            
            <motion.div
              className="mt-12 flex justify-center space-x-6 text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <a href="#" className="hover:underline">Terms & Conditions</a>
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Contact Us</a>
            </motion.div>
          </div>
        </WavyBackground>
      </section>
      
      {/* Animated Chat Widget */}
      <AnimatedChatWidget />
    </div>
  );
}