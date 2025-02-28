import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { BackgroundParticles } from '../animations/BackgroundParticles';

export default function CTA() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section className="py-16 md:py-24 relative bg-indigo-50 dark:bg-indigo-950/30 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <BackgroundParticles />
      </div>
      
      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white"
          >
            Ready to transform your payroll process?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Join thousands of businesses that have already simplified their payroll operations with PayrollPro AI.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Button size="lg" className="group">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button size="lg" variant="outline">
              Book a Demo
            </Button>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 text-sm text-gray-500 dark:text-gray-400"
          >
            No credit card required. 14-day free trial.
          </motion.p>
        </div>
      </div>
    </section>
  );
}