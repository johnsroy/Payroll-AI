import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { WavyBackground } from '../animations/WavyBackground';
import { 
  Card,
  CardContent
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { QuoteIcon } from 'lucide-react';

export default function Testimonials() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const testimonials = [
    {
      quote: "PayrollPro AI transformed our payroll operations. What used to take our team days now happens automatically with greater accuracy.",
      author: "Sarah Johnson",
      role: "CFO, Nexus Technologies",
      imageSrc: "/images/avatar-1.svg"
    },
    {
      quote: "The multi-agent system is incredibly powerful. It's like having a team of specialized payroll experts available 24/7.",
      author: "Michael Chen",
      role: "HR Director, Latitude Group",
      imageSrc: "/images/avatar-2.svg"
    },
    {
      quote: "The compliance monitoring saved us from several potential issues. It proactively alerted us to regulatory changes affecting our business.",
      author: "Priya Patel",
      role: "Operations Manager, Elevate Retail",
      imageSrc: "/images/avatar-3.svg"
    }
  ];

  return (
    <WavyBackground className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16" ref={ref}>
          <motion.span
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase"
          >
            Testimonials
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-gray-900 dark:text-white"
          >
            Trusted by businesses everywhere
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300"
          >
            See what our customers are saying about PayrollPro AI
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="mb-4 text-indigo-600 dark:text-indigo-400">
                    <QuoteIcon className="h-8 w-8 opacity-70" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={testimonial.imageSrc} alt={testimonial.author} />
                      <AvatarFallback>{testimonial.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{testimonial.author}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </WavyBackground>
  );
}