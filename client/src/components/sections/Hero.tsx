"use client";

import { CheckCircle } from "lucide-react";

export default function Hero() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="max-w-lg">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-text-dark mb-6">
              Simplify your <span className="text-primary">payroll</span> management
            </h1>
            <p className="text-lg text-text-light mb-8">
              PayrollPro streamlines your payroll processes, handles tax compliance, and gives employees easy access to their information—all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <a 
                href="#" 
                className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-md text-center transition"
              >
                Start Free Trial
              </a>
              <a 
                href="#demo" 
                className="border border-primary text-primary hover:bg-primary hover:text-white px-6 py-3 rounded-md text-center transition"
              >
                See Demo
              </a>
            </div>
            <div className="mt-8 flex items-center text-text-light">
              <CheckCircle className="h-5 w-5 text-primary mr-2" />
              <span>No credit card required</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-primary rounded-3xl opacity-10 transform rotate-3"></div>
            <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden">
              <img 
                src="https://picsum.photos/id/3/600/400" 
                alt="PayrollPro Dashboard" 
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
