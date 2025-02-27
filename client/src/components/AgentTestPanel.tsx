import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { testAgents } from '@/lib/agentTest';
import { Loader2, Check, X } from 'lucide-react';

export default function AgentTestPanel() {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [agentSelections, setAgentSelections] = useState({
    reasoning: true,
    research: true,
    dataAnalysis: true,
    tax: true,
    compliance: true,
    expense: true
  });

  const handleAgentSelectionChange = (agent: string, checked: boolean) => {
    setAgentSelections(prev => ({
      ...prev,
      [agent]: checked
    }));
  };

  const handleSubmit = async () => {
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const testResult = await testAgents(query);
      setResult(testResult);
    } catch (err) {
      console.error('Error testing agents:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatMetadata = (metadata: any) => {
    if (!metadata) return 'No metadata available';
    try {
      return JSON.stringify(metadata, null, 2);
    } catch (e) {
      return String(metadata);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Agent Testing Interface</h2>
      
      <div className="mb-6">
        <div className="mb-4">
          <Label htmlFor="query" className="mb-2 block">Test Query</Label>
          <Textarea
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your test query here..."
            className="min-h-[100px]"
          />
          <p className="text-sm text-gray-500 mt-1">
            Example: "What tax deductions can my small business claim for software expenses?"
          </p>
        </div>
        
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Select Agents to Include</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="reasoning" 
                checked={agentSelections.reasoning}
                onCheckedChange={(checked) => handleAgentSelectionChange('reasoning', checked as boolean)}
              />
              <Label htmlFor="reasoning">Reasoning</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="research" 
                checked={agentSelections.research}
                onCheckedChange={(checked) => handleAgentSelectionChange('research', checked as boolean)}
              />
              <Label htmlFor="research">Research</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="dataAnalysis" 
                checked={agentSelections.dataAnalysis}
                onCheckedChange={(checked) => handleAgentSelectionChange('dataAnalysis', checked as boolean)}
              />
              <Label htmlFor="dataAnalysis">Data Analysis</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="tax" 
                checked={agentSelections.tax}
                onCheckedChange={(checked) => handleAgentSelectionChange('tax', checked as boolean)}
              />
              <Label htmlFor="tax">Tax Calculation</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="compliance" 
                checked={agentSelections.compliance}
                onCheckedChange={(checked) => handleAgentSelectionChange('compliance', checked as boolean)}
              />
              <Label htmlFor="compliance">Compliance</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="expense" 
                checked={agentSelections.expense}
                onCheckedChange={(checked) => handleAgentSelectionChange('expense', checked as boolean)}
              />
              <Label htmlFor="expense">Expense Categorization</Label>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Test Agents'
          )}
        </Button>
      </div>
      
      {error && (
        <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-md flex items-start">
          <X className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Results</h3>
          
          <Tabs defaultValue="response">
            <TabsList className="mb-2">
              <TabsTrigger value="response">Response</TabsTrigger>
              <TabsTrigger value="contributions">Agent Contributions</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
            </TabsList>
            
            <TabsContent value="response" className="p-4 bg-gray-50 rounded-md">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-medium">Final Response</h4>
                <div className="text-sm text-gray-500">
                  Confidence: {(result.confidence * 100).toFixed(1)}%
                </div>
              </div>
              <p className="whitespace-pre-wrap">{result.response}</p>
            </TabsContent>
            
            <TabsContent value="contributions">
              {result.metadata?.agentContributions ? (
                <div className="space-y-3">
                  {result.metadata.agentContributions.map((contribution: any, index: number) => (
                    <Card key={index} className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{contribution.agentName}</h5>
                        <div className="text-sm text-gray-500">
                          Confidence: {(contribution.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{contribution.response}</p>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 p-4">No agent contributions available</p>
              )}
            </TabsContent>
            
            <TabsContent value="metadata" className="p-4 bg-gray-50 rounded-md">
              <pre className="text-xs overflow-auto">{formatMetadata(result.metadata)}</pre>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </Card>
  );
}