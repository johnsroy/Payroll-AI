import { useState, useEffect } from 'react';
import AgentTestPanel from '@/components/AgentTestPanel';
import { checkApiKeys } from '@/lib/agentTest';

export default function AgentTestPage() {
  const [apiKeyStatus, setApiKeyStatus] = useState<boolean | null>(null);

  // Check if API keys are present
  useEffect(() => {
    const hasKeys = checkApiKeys();
    setApiKeyStatus(hasKeys);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Multi-Agent AI System Test</h1>
      
      {apiKeyStatus === false && (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded">
          <p className="font-semibold text-yellow-800">API Key Required</p>
          <p className="text-sm text-yellow-700">
            This test requires the ANTHROPIC_API_KEY environment variable to be set.
            Please set this environment variable to use the multi-agent system.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6">
        <AgentTestPanel />
      </div>
    </div>
  );
}