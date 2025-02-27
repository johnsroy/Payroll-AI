"use client";

import { useState } from "react";
import MinimalHeader from "@/components/layout/MinimalHeader";
import { Input } from "@/components/ui/input";
import { CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";

type Step = 'account' | 'company' | 'plan' | 'confirm';

export default function GetStartedPage() {
  const [currentStep, setCurrentStep] = useState<Step>('account');
  const [progress, setProgress] = useState(25);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    companyName: '',
    industry: '',
    employeeCount: '',
    plan: 'professional' // Default plan
  });
  
  const updateFormData = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  const handleNextStep = () => {
    if (currentStep === 'account') {
      setCurrentStep('company');
      setProgress(50);
    } else if (currentStep === 'company') {
      setCurrentStep('plan');
      setProgress(75);
    } else if (currentStep === 'plan') {
      setCurrentStep('confirm');
      setProgress(100);
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep === 'company') {
      setCurrentStep('account');
      setProgress(25);
    } else if (currentStep === 'plan') {
      setCurrentStep('company');
      setProgress(50);
    } else if (currentStep === 'confirm') {
      setCurrentStep('plan');
      setProgress(75);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Process the registration
    console.log('Registration data:', formData);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <MinimalHeader />
      
      <main className="flex-grow py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
            <p className="mt-2 text-gray-600">
              Get started with PayrollPro in just a few steps
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-primary">
                    Step {currentStep === 'account' ? '1' : currentStep === 'company' ? '2' : currentStep === 'plan' ? '3' : '4'} of 4
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-primary">
                    {progress}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                <div 
                  style={{ width: `${progress}%` }} 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"
                ></div>
              </div>
            </div>
          </div>
          
          {/* Form Card */}
          <div className="bg-white shadow-md rounded-lg p-8">
            {/* Account Information Step */}
            {currentStep === 'account' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Account Information</h2>
                <form>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => updateFormData('firstName', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => updateFormData('lastName', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => updateFormData('password', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            {/* Company Information Step */}
            {currentStep === 'company' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Company Information</h2>
                <form>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name
                      </label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => updateFormData('companyName', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                        Industry
                      </label>
                      <select
                        id="industry"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        value={formData.industry}
                        onChange={(e) => updateFormData('industry', e.target.value)}
                        required
                      >
                        <option value="">Select an industry</option>
                        <option value="technology">Technology</option>
                        <option value="retail">Retail</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="finance">Finance</option>
                        <option value="education">Education</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="employeeCount" className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Employees
                      </label>
                      <select
                        id="employeeCount"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        value={formData.employeeCount}
                        onChange={(e) => updateFormData('employeeCount', e.target.value)}
                        required
                      >
                        <option value="">Select employee count</option>
                        <option value="1-10">1-10</option>
                        <option value="11-50">11-50</option>
                        <option value="51-200">51-200</option>
                        <option value="201-500">201-500</option>
                        <option value="500+">500+</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            {/* Plan Selection Step */}
            {currentStep === 'plan' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Select Your Plan</h2>
                <div className="space-y-4">
                  <div
                    className={`border rounded-lg p-4 cursor-pointer ${
                      formData.plan === 'starter' ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updateFormData('plan', 'starter')}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Starter</h3>
                        <p className="text-sm text-gray-500">Perfect for small businesses just getting started with payroll.</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-lg font-bold mr-1">$10</span>
                        <span className="text-sm text-gray-500">/month per employee</span>
                        {formData.plan === 'starter' && (
                          <CheckCircle className="ml-2 h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div
                    className={`border rounded-lg p-4 cursor-pointer ${
                      formData.plan === 'professional' ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updateFormData('plan', 'professional')}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center mb-1">
                          <h3 className="font-medium">Professional</h3>
                          <span className="ml-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">Recommended</span>
                        </div>
                        <p className="text-sm text-gray-500">For growing businesses that need more advanced features and support.</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-lg font-bold mr-1">$20</span>
                        <span className="text-sm text-gray-500">/month per employee</span>
                        {formData.plan === 'professional' && (
                          <CheckCircle className="ml-2 h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div
                    className={`border rounded-lg p-4 cursor-pointer ${
                      formData.plan === 'enterprise' ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updateFormData('plan', 'enterprise')}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Enterprise</h3>
                        <p className="text-sm text-gray-500">For larger organizations with complex payroll needs.</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-lg font-bold mr-1">$30</span>
                        <span className="text-sm text-gray-500">/month per employee</span>
                        {formData.plan === 'enterprise' && (
                          <CheckCircle className="ml-2 h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Confirmation Step */}
            {currentStep === 'confirm' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Confirm Your Details</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Account Information</h3>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Name</p>
                        <p className="mt-1">{formData.firstName} {formData.lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="mt-1">{formData.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Company Information</h3>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Company Name</p>
                        <p className="mt-1">{formData.companyName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Industry</p>
                        <p className="mt-1">{formData.industry}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Employee Count</p>
                        <p className="mt-1">{formData.employeeCount}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Selected Plan</h3>
                    <div className="mt-2">
                      <p className="mt-1">
                        {formData.plan === 'starter' ? 'Starter' : 
                         formData.plan === 'professional' ? 'Professional' : 'Enterprise'} - $
                        {formData.plan === 'starter' ? '10' : 
                         formData.plan === 'professional' ? '20' : '30'}/month per employee
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                        I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              {currentStep !== 'account' ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex items-center text-gray-700 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </button>
              ) : (
                <div></div>
              )}
              
              {currentStep !== 'confirm' ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md transition duration-200"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md transition duration-200"
                >
                  Complete Registration
                </button>
              )}
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