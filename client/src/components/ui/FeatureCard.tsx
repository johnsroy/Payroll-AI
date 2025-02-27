"use client";

import { ChevronRight } from "lucide-react";
import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  link: string;
}

export default function FeatureCard({ icon, title, description, link }: FeatureCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="p-3 bg-blue-100 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-text-light mb-4">
        {description}
      </p>
      <a href={link} className="text-primary font-medium flex items-center hover:underline">
        Learn more
        <ChevronRight className="h-4 w-4 ml-1" />
      </a>
    </div>
  );
}
