import React from 'react';
import Hero from './components/sections/Hero';
import Features from './components/sections/Features';
import HowItWorks from './components/sections/HowItWorks';
import Testimonials from './components/sections/Testimonials';
import FAQ from './components/sections/FAQ';
import CTA from './components/sections/CTA';

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <CTA />
    </div>
  );
}

export default App;