"use client";

export default function Brands() {
  const companies = ["COMPANY A", "COMPANY B", "COMPANY C", "COMPANY D", "COMPANY E", "COMPANY F"];
  
  return (
    <section className="py-12 bg-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-text-light mb-8">Trusted by innovative companies</p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 justify-items-center items-center">
          {companies.map((company, index) => (
            <div 
              key={index} 
              className={`h-12 opacity-70 hover:opacity-100 transition ${index >= 4 ? 'hidden md:block' : ''}`}
            >
              <div className="h-full flex items-center font-bold text-gray-500">
                {company}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
