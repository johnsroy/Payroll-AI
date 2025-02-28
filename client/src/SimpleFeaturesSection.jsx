import React from 'react';

function SimpleFeaturesSection() {
  const features = [
    {
      title: 'Multi-Agent AI Architecture',
      description: 'Specialized AI agents collaborate to deliver comprehensive payroll insights and solutions.'
    },
    {
      title: 'Cloud Data Integration',
      description: 'Connect seamlessly with popular cloud services for automated data processing and analysis.'
    },
    {
      title: 'Zapier Integration',
      description: 'Build no-code workflows that automate your payroll processes with 3000+ apps.'
    },
    {
      title: 'Regulatory Compliance',
      description: 'Stay current with tax laws and payroll regulations to avoid costly penalties.'
    }
  ];

  return (
    <section id="features" style={{ 
      padding: '4rem 0',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{ 
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        <h2 style={{ 
          fontSize: '2rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '3rem',
          color: '#0f172a'
        }}>
          Powerful Features for Modern Payroll
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {features.map((feature, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                color: '#1e40af'
              }}>
                {feature.title}
              </h3>
              <p style={{ color: '#64748b' }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SimpleFeaturesSection;