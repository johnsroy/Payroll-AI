"use client";

import { useState } from "react";
import MinimalHeader from "@/components/layout/MinimalHeader";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FaFacebook, FaGoogle, FaApple } from "react-icons/fa";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log({ email, password, rememberMe });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <MinimalHeader />
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden md:max-w-4xl md:flex">
          {/* Branding Section - Hidden on Mobile */}
          <div className="hidden md:block md:w-1/2 bg-primary p-12 text-white">
            <div className="h-full flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-6">Welcome Back</h2>
                <p className="text-lg text-white/90 mb-6">
                  Log in to access your PayrollPro dashboard and manage your payroll operations.
                </p>
              </div>
              
              <div className="bg-white/10 p-6 rounded-lg">
                <p className="italic text-white/90 mb-4">
                  "PayrollPro has streamlined our entire payroll process, saving us hours every week and ensuring compliance."
                </p>
                <div className="flex items-center">
                  <img 
                    src="https://picsum.photos/id/64/100/100" 
                    alt="Testimonial author" 
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-medium">Sarah Johnson</p>
                    <p className="text-sm text-white/80">HR Director, Acme Inc.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Login Form */}
          <div className="p-8 md:w-1/2">
            <div className="text-center md:text-left mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Log in to your account</h1>
              <p className="mt-2 text-gray-600">
                Enter your credentials to access your account
              </p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <a href="#" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="flex items-center">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md transition duration-200"
                >
                  Log In
                </button>
              </div>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-3 gap-3">
                <button className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <FaGoogle className="text-red-600" />
                </button>
                <button className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <FaFacebook className="text-blue-600" />
                </button>
                <button className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <FaApple />
                </button>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <a href="/get-started-button" className="text-primary font-medium hover:underline">
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="py-4 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} PayrollPro. All rights reserved.</p>
      </footer>
    </div>
  );
}