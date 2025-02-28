import React from "react";
import { Link } from "wouter";
import { Clock, Mail, Phone, MapPin } from "lucide-react";
import { supportLinks, featuresDropdown, resourcesDropdown, companyDropdown } from "@/config/navigation";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and Company Information */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <Clock className="w-8 h-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold text-white">PayrollPro</span>
            </Link>
            <p className="text-gray-400 mb-4 max-w-md">
              Advanced AI-powered payroll management system that simplifies compliance,
              tax calculations, and expense categorization for businesses of all sizes.
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-blue-400 mr-2" />
                <span className="text-gray-300">123 AI Boulevard, Tech City, TC 98765</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-blue-400 mr-2" />
                <span className="text-gray-300">(555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-blue-400 mr-2" />
                <a href="mailto:info@payrollpro.ai" className="text-gray-300 hover:text-blue-400 transition">
                  info@payrollpro.ai
                </a>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2">
              {featuresDropdown.map((item, index) => (
                <li key={index}>
                  <Link href={item.href} className="text-gray-400 hover:text-blue-400 transition">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {resourcesDropdown.map((item, index) => (
                <li key={index}>
                  <Link href={item.href} className="text-gray-400 hover:text-blue-400 transition">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {companyDropdown.map((item, index) => (
                <li key={index}>
                  <Link href={item.href} className="text-gray-400 hover:text-blue-400 transition">
                    {item.name}
                  </Link>
                </li>
              ))}
              <li className="pt-4 mt-2 border-t border-gray-800">
                <h3 className="text-lg font-semibold mb-2">Support</h3>
              </li>
              {supportLinks.map((item, index) => (
                <li key={index}>
                  <Link href={item.href} className="text-gray-400 hover:text-blue-400 transition">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} PayrollPro AI. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-blue-400 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-blue-400 transition">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-blue-400 transition">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}