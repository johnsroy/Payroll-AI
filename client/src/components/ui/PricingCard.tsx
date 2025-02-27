"use client";

import { Check, X } from "lucide-react";

interface Feature {
  name: string;
  included: boolean;
}

interface PricingCardProps {
  name: string;
  description: string;
  price: number;
  isAnnual: boolean;
  features: Feature[];
  ctaText: string;
  popular: boolean;
}

export default function PricingCard({ 
  name, 
  description, 
  price, 
  isAnnual, 
  features, 
  ctaText, 
  popular 
}: PricingCardProps) {
  return (
    <div className={`${popular 
      ? 'border-2 border-primary rounded-xl overflow-hidden shadow-lg relative' 
      : 'border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition duration-300'}`}
    >
      {popular && (
        <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
          Most Popular
        </div>
      )}
      <div className="p-8">
        <h3 className="text-xl font-bold mb-2">{name}</h3>
        <p className="text-text-light mb-6">{description}</p>
        <div className="flex items-baseline mb-6">
          <span className="text-4xl font-bold">${price}</span>
          <span className="text-text-light ml-2">/ {isAnnual ? 'year' : 'month'} per employee</span>
        </div>
        <div className="border-t border-gray-100 pt-6 pb-4">
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className={`flex items-start ${feature.included ? '' : 'text-gray-400'}`}>
                {feature.included ? (
                  <Check className="h-5 w-5 text-green-500 mt-1 mr-2" />
                ) : (
                  <X className="h-5 w-5 text-gray-400 mt-1 mr-2" />
                )}
                <span>{feature.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="px-8 pb-8">
        <a 
          href="#" 
          className={`block w-full py-3 px-4 ${
            popular 
              ? 'bg-primary text-white hover:bg-primary-dark' 
              : 'bg-white text-primary border border-primary hover:bg-primary hover:text-white'
          } rounded-lg text-center font-medium transition`}
        >
          {ctaText}
        </a>
      </div>
    </div>
  );
}
