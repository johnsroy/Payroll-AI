"use client";

export default function CTA() {
  return (
    <section className="py-16 md:py-24 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to simplify your payroll?</h2>
        <p className="text-lg text-blue-100 mb-8 max-w-3xl mx-auto">
          Join thousands of businesses that trust PayrollPro for their payroll needs. Try it free for 14 days, no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <a 
            href="#" 
            className="bg-white text-primary hover:bg-blue-50 px-8 py-3 rounded-md font-medium transition"
          >
            Start Free Trial
          </a>
          <a 
            href="#" 
            className="text-white border border-white hover:bg-primary-dark px-8 py-3 rounded-md font-medium transition"
          >
            Schedule Demo
          </a>
        </div>
      </div>
    </section>
  );
}
