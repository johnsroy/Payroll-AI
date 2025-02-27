"use client";

import TestimonialCard from "@/components/ui/TestimonialCard";

export default function Testimonials() {
  const testimonials = [
    {
      quote: "PayrollPro has saved our accounting team countless hours each month. The automation is seamless, and we've reduced payroll processing time by over 70%.",
      author: "Sarah Johnson",
      role: "CFO, Acme Inc.",
      imageSrc: "https://picsum.photos/id/1025/80/80"
    },
    {
      quote: "The employee self-service portal has been a game-changer. Our HR team no longer spends time answering basic payroll questions, and employees love having instant access to their information.",
      author: "Michael Chen",
      role: "HR Director, Tech Solutions",
      imageSrc: "https://picsum.photos/id/177/80/80"
    },
    {
      quote: "We switched to PayrollPro after a tax filing error with our previous provider. The peace of mind knowing our taxes are handled correctly is worth every penny.",
      author: "Jessica Martinez",
      role: "Business Owner, Coastal Designs",
      imageSrc: "https://picsum.photos/id/1062/80/80"
    }
  ];
  
  return (
    <section id="testimonials" className="py-16 md:py-24 bg-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by thousands of businesses</h2>
          <p className="text-lg text-text-light">
            See what our customers have to say about PayrollPro
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard 
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
              imageSrc={testimonial.imageSrc}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
