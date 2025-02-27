"use client";

import { Link } from "wouter";
import { Clock } from "lucide-react";

export default function MinimalHeader() {
  return (
    <header className="bg-white py-4 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Clock className="w-8 h-8 text-primary" />
            <span className="ml-2 text-xl font-bold text-primary-dark">PayrollPro</span>
          </Link>
        </div>
      </div>
    </header>
  );
}