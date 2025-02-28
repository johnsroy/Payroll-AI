import React from 'react';
import { Link } from 'wouter';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">PayrollPro AI</h3>
            <p className="text-gray-400 mb-4">
              Simplifying payroll management with powerful AI technology for businesses of all sizes.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Solutions</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/features#time-tracking">
                  <div className="text-gray-400 hover:text-white transition-colors duration-200">
                    Time & Attendance
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/features#payroll">
                  <div className="text-gray-400 hover:text-white transition-colors duration-200">
                    Payroll Processing
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/features#taxes">
                  <div className="text-gray-400 hover:text-white transition-colors duration-200">
                    Tax Compliance
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/features#benefits">
                  <div className="text-gray-400 hover:text-white transition-colors duration-200">
                    Benefits Administration
                  </div>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about">
                  <div className="text-gray-400 hover:text-white transition-colors duration-200">
                    About Us
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/careers">
                  <div className="text-gray-400 hover:text-white transition-colors duration-200">
                    Careers
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/blog">
                  <div className="text-gray-400 hover:text-white transition-colors duration-200">
                    Blog
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <div className="text-gray-400 hover:text-white transition-colors duration-200">
                    Contact
                  </div>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                <span className="text-gray-400">
                  123 Innovation Drive<br />
                  San Francisco, CA 94103
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-blue-400 mr-2" />
                <span className="text-gray-400">(555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-blue-400 mr-2" />
                <span className="text-gray-400">contact@payrollpro.ai</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} PayrollPro AI. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy">
                <div className="text-gray-400 hover:text-white transition-colors duration-200">
                  Privacy Policy
                </div>
              </Link>
              <Link href="/terms">
                <div className="text-gray-400 hover:text-white transition-colors duration-200">
                  Terms of Service
                </div>
              </Link>
              <Link href="/cookies">
                <div className="text-gray-400 hover:text-white transition-colors duration-200">
                  Cookie Policy
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}