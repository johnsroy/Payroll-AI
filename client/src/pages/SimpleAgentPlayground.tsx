import React, { useState } from "react";
// Define AgentType locally to avoid import issues
type AgentType = 'tax' | 'expense' | 'compliance' | 'data' | 'research' | 'reasoning';

export default function SimpleAgentPlayground() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentType>("reasoning");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsLoading(true);
    setResponse("");
    
    try {
      // This is a placeholder for actual API call
      // In a real implementation, we would call the API using agentAPI.ts
      const mockResponse = `This is a simulated response to your query: "${query}" from the ${selectedAgent} agent. 
        In a real implementation, this would call our backend API and process the query using the selected AI agent.`;
      
      // Simulate API delay
      setTimeout(() => {
        setResponse(mockResponse);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error processing query:", error);
      setResponse("Sorry, there was an error processing your query. Please try again.");
      setIsLoading(false);
    }
  };
  
  const agents = [
    { type: "tax", name: "Tax Calculator" },
    { type: "expense", name: "Expense Categorizer" },
    { type: "compliance", name: "Compliance Advisor" },
    { type: "data", name: "Data Analyst" },
    { type: "research", name: "Research Specialist" },
    { type: "reasoning", name: "Reasoning Engine" }
  ] as const;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">PayrollPro AI Agent Playground</h1>
          <p className="text-gray-600">
            Explore our AI agents specialized in payroll management and compliance
          </p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select an Agent
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {agents.map(({ type, name }) => (
                <button
                  key={type}
                  className={`p-3 rounded-md border text-sm ${
                    selectedAgent === type
                      ? "bg-blue-100 border-blue-500 text-blue-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedAgent(type as AgentType)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
                Your Question
              </label>
              <textarea
                id="query"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your payroll, tax, or compliance question here..."
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  isLoading || !query.trim()
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isLoading ? "Processing..." : "Submit"}
              </button>
            </div>
          </form>
          
          {response && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Response:</h3>
              <div className="text-gray-700 whitespace-pre-line">
                {response}
              </div>
            </div>
          )}
          
          <div className="mt-8 border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-900 mb-3">Example Questions:</h3>
            <div className="grid gap-2">
              {[
                "Calculate federal income tax for an employee earning $75,000 in California",
                "What are the upcoming tax filing deadlines for a small business in New York?",
                "How should I categorize a $500 expense for a business lunch with clients?",
                "What are the latest changes to the W-4 form and how do they affect payroll?"
              ].map((example, i) => (
                <button
                  key={i}
                  className="text-left text-sm p-2 bg-gray-50 hover:bg-gray-100 rounded-md"
                  onClick={() => setQuery(example)}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}