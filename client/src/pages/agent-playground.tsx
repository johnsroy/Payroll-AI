import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AgentChat } from "@/components/ui/AgentChat";
import { AgentType, getAvailableAgents } from "@/lib/agentAPI";

export default function AgentPlaygroundPage() {
  const [useMultiAgent, setUseMultiAgent] = useState(true);
  const [showAgentDetails, setShowAgentDetails] = useState(true);

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            PayrollPro AI Agent Playground
          </h1>
          <p className="text-muted-foreground">
            Explore the capabilities of our specialized AI agents for payroll management
          </p>
        </div>

        <Tabs defaultValue="chat" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="agents">Agent Capabilities</TabsTrigger>
              <TabsTrigger value="examples">Example Queries</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="multi-agent"
                  checked={useMultiAgent}
                  onCheckedChange={setUseMultiAgent}
                />
                <Label htmlFor="multi-agent">Multi-agent mode</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="agent-details"
                  checked={showAgentDetails}
                  onCheckedChange={setShowAgentDetails}
                />
                <Label htmlFor="agent-details">Show agent details</Label>
              </div>
            </div>
          </div>

          <TabsContent value="chat" className="mt-0">
            <AgentChat
              className="w-full border-none shadow-lg"
              useMultiAgent={useMultiAgent}
              showAgentDetails={showAgentDetails}
            />
          </TabsContent>

          <TabsContent value="agents" className="mt-0">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AgentCard
                type="tax"
                title="Tax Calculator"
                description="Specializes in calculating payroll taxes, tax withholdings, and providing information about tax laws and regulations."
                capabilities={[
                  "Federal and state income tax calculations",
                  "FICA tax calculations (Social Security & Medicare)",
                  "Tax withholding optimization",
                  "Tax code explanations and updates"
                ]}
              />
              
              <AgentCard
                type="expense"
                title="Expense Categorizer"
                description="Categorizes business expenses and identifies potential tax deductions for better financial management."
                capabilities={[
                  "Expense categorization by type",
                  "Tax deduction identification",
                  "Documentation requirements guidance",
                  "Expense policy compliance checks"
                ]}
              />
              
              <AgentCard
                type="compliance"
                title="Compliance Advisor"
                description="Monitors regulatory compliance requirements and deadlines for payroll and tax filings."
                capabilities={[
                  "Payroll compliance requirement tracking",
                  "Filing deadline reminders",
                  "Regulatory change monitoring",
                  "Compliance risk assessment"
                ]}
              />
              
              <AgentCard
                type="data"
                title="Data Analyst"
                description="Analyzes payroll data to identify trends, anomalies, and generate forecasts for better decision making."
                capabilities={[
                  "Payroll data trend analysis",
                  "Expense and cost forecasting",
                  "Budget vs. actual comparisons",
                  "Anomaly detection in financial data"
                ]}
              />
              
              <AgentCard
                type="research"
                title="Research Specialist"
                description="Researches payroll and tax topics to provide up-to-date information and insights."
                capabilities={[
                  "Tax law research and updates",
                  "Industry best practice research",
                  "Regulatory information gathering",
                  "Fact-checking and verification"
                ]}
              />
              
              <AgentCard
                type="reasoning"
                title="Reasoning Engine"
                description="Coordinates with specialized agents to provide integrated answers to complex payroll questions."
                capabilities={[
                  "Multi-perspective analysis",
                  "Step-by-step reasoning",
                  "Complex problem decomposition",
                  "Agent orchestration and integration"
                ]}
              />
            </div>
          </TabsContent>

          <TabsContent value="examples" className="mt-0">
            <div className="grid gap-4 md:grid-cols-2">
              <ExampleCard
                title="Tax Calculation"
                query="Calculate federal income tax, Social Security, and Medicare for an employee earning $75,000 per year in California."
              />
              
              <ExampleCard
                title="Expense Categorization"
                query="How should I categorize a $500 expense for a business lunch with potential clients? What documentation do I need?"
              />
              
              <ExampleCard
                title="Compliance Check"
                query="What are the upcoming tax filing deadlines for a small business in New York for the next quarter?"
              />
              
              <ExampleCard
                title="Data Analysis"
                query="Analyze our monthly payroll costs for the last year and identify any concerning trends or anomalies."
              />
              
              <ExampleCard
                title="Research Request"
                query="What are the latest changes to the W-4 form and how do they affect our payroll processing?"
              />
              
              <ExampleCard
                title="Complex Problem"
                query="We're expanding to open an office in Texas with 5 employees. What payroll taxes, compliance requirements, and deadlines do we need to be aware of?"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface AgentCardProps {
  type: AgentType;
  title: string;
  description: string;
  capabilities: string[];
}

function AgentCard({ type, title, description, capabilities }: AgentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <h4 className="text-sm font-medium mb-2">Capabilities:</h4>
        <ul className="text-sm space-y-1 list-disc pl-5">
          {capabilities.map((capability, i) => (
            <li key={i}>{capability}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

interface ExampleCardProps {
  title: string;
  query: string;
}

function ExampleCard({ title, query }: ExampleCardProps) {
  return (
    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">{query}</p>
      </CardContent>
    </Card>
  );
}