"use client";

import BenefitItem from "@/components/ui/BenefitItem";

export default function Benefits() {
  const benefits = [
    {
      title: "Save Time with Automation",
      description: "Reduce manual processing time by up to 80% with our automated payroll system. Set up recurring payments, approve with a click, and let our system handle calculations and disbursements.",
      listItems: [
        "Automate recurring payrolls",
        "Eliminate manual calculations",
        "Free up your team for value-added work"
      ],
      imageSrc: "https://picsum.photos/id/48/600/400",
      imageAlt: "Time saving automation",
      reverse: false
    },
    {
      title: "Stay Compliant with Changing Regulations",
      description: "Our system automatically updates with changing tax laws and regulations, helping you avoid penalties and stay compliant at all times.",
      listItems: [
        "Automatic tax updates",
        "Accurate tax filing and payment",
        "Reduced audit risk"
      ],
      imageSrc: "https://picsum.photos/id/160/600/400",
      imageAlt: "Tax compliance solution",
      reverse: true
    },
    {
      title: "Empower Employees with Self-Service",
      description: "Give your team members access to their own payroll information, reducing HR inquiries and increasing employee satisfaction.",
      listItems: [
        "24/7 access to pay stubs and tax forms",
        "Self-manage personal information",
        "Reduce administrative overhead"
      ],
      imageSrc: "https://picsum.photos/id/20/600/400",
      imageAlt: "Employee self-service portal",
      reverse: false
    }
  ];
  
  return (
    <section className="py-16 md:py-24 bg-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why businesses choose PayrollPro</h2>
          <p className="text-lg text-text-light">
            Our platform streamlines your payroll operations, saving you time and reducing costly errors.
          </p>
        </div>

        {/* Benefit Items */}
        <div className="space-y-12 md:space-y-20">
          {benefits.map((benefit, index) => (
            <BenefitItem 
              key={index}
              title={benefit.title}
              description={benefit.description}
              listItems={benefit.listItems}
              imageSrc={benefit.imageSrc}
              imageAlt={benefit.imageAlt}
              reverse={benefit.reverse}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
