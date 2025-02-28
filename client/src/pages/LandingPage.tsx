import React from 'react';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import Benefits from '../components/sections/Benefits';
import HowItWorks from '../components/sections/HowItWorks';
import Testimonials from '../components/sections/Testimonials';
import Brands from '../components/sections/Brands';
import FAQ from '../components/sections/FAQ';
import CTA from '../components/sections/CTA';
import { BackgroundParticles } from '../components/animations/BackgroundParticles';
import { WavyBackground } from '../components/animations/WavyBackground';

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      <div className="relative">
        <div className="absolute inset-0 z-0">
          <BackgroundParticles />
        </div>
        <div className="relative z-10">
          <Hero />
        </div>
      </div>
      
      <Features />
      
      <WavyBackground className="py-20" waveColor="rgba(59, 130, 246, 0.1)">
        <Benefits />
      </WavyBackground>
      
      <HowItWorks />
      
      <div className="bg-slate-50 py-20">
        <Testimonials />
      </div>
      
      <Brands />
      
      <div className="relative">
        <WavyBackground className="py-20" waveColor="rgba(59, 130, 246, 0.08)">
          <FAQ />
        </WavyBackground>
      </div>
      
      <CTA />
    </div>
  );
}