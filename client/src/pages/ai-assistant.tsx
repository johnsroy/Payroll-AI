import { useState } from 'react';
import { AIChat } from '@/components/ui/AIChat';
import { useAI } from '@/lib/aiContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, Receipt, ClipboardCheck } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function AIAssistantPage() {
  const { activeAgentType, availableAgents } = useAI();
  const [chatExpanded, setChatExpanded] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              AI Payroll Assistant
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our AI-powered assistant helps you with tax calculations, expense categorization, and compliance monitoring.
            </p>
          </div>

          {!chatExpanded && (
            <>
              <div className="grid gap-6 md:grid-cols-3 mb-12">
                {availableAgents.map((agent) => (
                  <AgentCard 
                    key={agent.type}
                    type={agent.type}
                    name={agent.name}
                    description={agent.description}
                    capabilities={agent.capabilities}
                    isActive={activeAgentType === agent.type}
                  />
                ))}
              </div>
              
              <div className="mx-auto max-w-2xl">
                <Card>
                  <CardHeader>
                    <CardTitle>Start a conversation</CardTitle>
                    <CardDescription>
                      Ask your payroll questions and our AI assistant will help you find the answers.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AIChat 
                      autoFocus={true} 
                      expanded={chatExpanded} 
                      onToggleExpand={() => setChatExpanded(!chatExpanded)} 
                    />
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {chatExpanded && (
            <AIChat 
              expanded={true} 
              onToggleExpand={() => setChatExpanded(false)} 
            />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

function AgentCard({ 
  type, 
  name, 
  description, 
  capabilities = [], 
  isActive 
}: { 
  type: string; 
  name: string; 
  description: string; 
  capabilities: string[]; 
  isActive: boolean;
}) {
  // Choose icon based on agent type
  const getIcon = () => {
    switch (type) {
      case 'tax':
        return <Calculator className="h-10 w-10 text-primary" />;
      case 'expense':
        return <Receipt className="h-10 w-10 text-primary" />;
      case 'compliance':
        return <ClipboardCheck className="h-10 w-10 text-primary" />;
      default:
        return <Calculator className="h-10 w-10 text-primary" />; 
    }
  };

  return (
    <Card className={`hover:shadow-md transition-shadow overflow-hidden ${isActive ? 'border-primary' : ''}`}>
      <div className="p-6">
        <div className="flex items-center gap-4">
          {getIcon()}
          <h3 className="text-xl font-semibold">{name}</h3>
        </div>
        <p className="mt-2 text-muted-foreground">{description}</p>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Capabilities:</h4>
          <ul className="text-sm list-disc pl-5 space-y-1">
            {capabilities.slice(0, 3).map((capability, i) => (
              <li key={i}>{capability}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}