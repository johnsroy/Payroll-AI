"use client";

import { CheckCircle } from "lucide-react";

interface BenefitItemProps {
  title: string;
  description: string;
  listItems: string[];
  imageSrc: string;
  imageAlt: string;
  reverse: boolean;
}

export default function BenefitItem({ 
  title, 
  description, 
  listItems, 
  imageSrc, 
  imageAlt, 
  reverse 
}: BenefitItemProps) {
  return (
    <div className="grid md:grid-cols-2 gap-8 items-center">
      <div className={`${reverse ? 'order-1' : 'order-2 md:order-1'}`}>
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-text-light mb-6">
          {description}
        </p>
        <ul className="space-y-3">
          {listItems.map((item, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mt-1 mr-2" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={`${reverse ? 'order-2' : 'order-1 md:order-2'}`}>
        <img 
          src={imageSrc} 
          alt={imageAlt} 
          className="rounded-lg shadow-md w-full" 
        />
      </div>
    </div>
  );
}
