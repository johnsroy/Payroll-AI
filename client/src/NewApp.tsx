// Landing page with all sections
import React from 'react';
import SimpleNav from './SimpleNav.tsx';
import SimpleHero from './SimpleHero.tsx';
import SimpleFeaturesSection from './SimpleFeaturesSection.tsx';
import SimpleDemoSection from './SimpleDemoSection.tsx';
import SimpleFooter from './SimpleFooter.tsx';

function NewApp() {
  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <SimpleNav />
      
      <main>
        <SimpleHero />
        <SimpleFeaturesSection />
        <SimpleDemoSection />
      </main>
      
      <SimpleFooter />
    </div>
  );
}

export default NewApp;