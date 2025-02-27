# AI-Powered Payroll Management System

A comprehensive payroll management system enhanced with specialized AI agents for tax calculations, expense categorization, and compliance guidance.

## Features

### AI Agent System

- **Multi-Agent Architecture**: Specialized AI agents for different payroll-related tasks
  - Tax Calculation Agent: Handles tax calculations, rates, and filing information
  - Expense Categorization Agent: Classifies expenses and provides tax deduction insights
  - Compliance Agent: Tracks regulatory requirements and filing deadlines

- **Knowledge Management**:
  - Vector database for semantic search and retrieval
  - Document upload and processing
  - Automated categorization of information

- **Conversation Interface**:
  - Real-time chat with AI agents
  - Agent selection for specialized queries
  - Conversation history and context management

### Payroll Features

- **Complete Payroll Processing**:
  - Employee and contractor payments
  - Tax withholding and calculations
  - Direct deposit integration
  - Automated deductions

- **Tax Management**:
  - Federal, state, and local tax calculations
  - Tax form generation (W-2, 1099, etc.)
  - Filing deadline reminders
  - Tax compliance guidance

- **Expense Tracking**:
  - Intelligent expense categorization
  - Tax deduction recommendations
  - Custom categories for specific business needs
  - Receipt processing and management

- **Compliance Tools**:
  - Regulatory filing deadline tracking
  - Compliance requirement explanations
  - State-specific compliance guidance
  - Audit preparation assistance

## Technology Stack

- **Frontend**: Next.js with React and TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Database**: Supabase with PostgreSQL
- **Vector Database**: pgvector for semantic search
- **AI**: OpenAI API for language processing and embeddings
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Deployment**: Docker for containerization

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-payroll-system.git
   cd ai-payroll-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with the following environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   OPENAI_API_KEY=your-openai-api-key
   ```

4. Set up the database:
   ```bash
   npm run setup-database
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t ai-payroll-system \
     --build-arg NEXT_PUBLIC_SUPABASE_URL=your-supabase-url \
     --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key \
     --build-arg OPENAI_API_KEY=your-openai-api-key \
     .
   ```

2. Run the Docker container:
   ```bash
   docker run -p 3000:3000 ai-payroll-system
   ```

## Database Schema

The system uses the following key database tables:

- `profiles`: User profiles linked to Supabase auth
- `companies`: Company information
- `employees`: Employee records
- `payroll_periods`: Payroll processing periods
- `payroll_items`: Individual payroll line items
- `time_entries`: Employee time tracking
- `knowledge_base`: Vector-embedded knowledge entries
- `ai_conversations`: Conversation history with AI agents

## AI Agent System

### Agent Orchestrator

The Agent Orchestrator coordinates between specialized agents:

1. Analyzes user queries to determine the most appropriate agent
2. Routes queries to specialized agents based on topic and intent
3. Manages conversation context and persistence
4. Handles follow-up questions by maintaining conversation state

### Knowledge Base

The knowledge base uses vector embeddings to enable semantic search:

1. Documents are chunked into manageable segments
2. Each segment is converted to a vector embedding
3. Vector similarity search finds relevant information
4. Results are incorporated into agent responses

### Adding New Agents

To add a new specialized agent:

1. Create a new agent class extending `BaseAgent`
2. Implement specialized tools and handlers
3. Register the agent in the `AgentOrchestrator`
4. Add the agent type to the `AgentType` enum

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for their API
- Supabase for database services
- The Next.js team for the awesome framework

## Contact

For questions or support, please contact [your-email@example.com](mailto:your-email@example.com).
