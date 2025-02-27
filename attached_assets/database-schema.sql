-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Profiles table (extends Supabase Auth users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id),
    name TEXT NOT NULL,
    industry TEXT,
    size INTEGER,
    state TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Many-to-many relationship between users and companies
CREATE TABLE company_users (
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'admin', 'member', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (company_id, user_id)
);

-- AI Conversations
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    company_id UUID REFERENCES companies(id),
    agent_type TEXT NOT NULL, -- 'tax', 'expense', 'compliance', 'general'
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tax Rates (reference data)
CREATE TABLE tax_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country TEXT NOT NULL DEFAULT 'US',
    state TEXT,
    type TEXT NOT NULL, -- 'federal_income', 'state_income', 'fica_social_security', etc.
    filing_status TEXT, -- 'single', 'married', 'head_of_household'
    tax_year INTEGER NOT NULL,
    min_amount NUMERIC,
    max_amount NUMERIC,
    rate NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expense Categories (reference data)
CREATE TABLE expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    tax_deductible BOOLEAN DEFAULT true,
    company_id UUID REFERENCES companies(id), -- NULL for standard categories
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance Requirements (reference data)
CREATE TABLE compliance_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    applies_to TEXT[] NOT NULL, -- ['all', 'small_business', etc.]
    employee_threshold INTEGER,
    regions TEXT[] NOT NULL, -- ['US', 'CA', 'NY', etc.]
    deadline_type TEXT NOT NULL, -- 'fixed', 'relative', 'recurring'
    deadline_details JSONB NOT NULL,
    reference_url TEXT,
    penalties TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company compliance tracking
CREATE TABLE company_compliance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id),
    requirement_id UUID NOT NULL REFERENCES compliance_requirements(id),
    status TEXT NOT NULL, -- 'compliant', 'pending', 'late', 'exempt'
    last_filed_date TIMESTAMP WITH TIME ZONE,
    next_deadline TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (company_id, requirement_id)
);

-- Vector embeddings for knowledge base
CREATE TABLE knowledge_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection TEXT NOT NULL, -- 'tax', 'expense', 'compliance', 'general'
    content TEXT NOT NULL,
    embedding vector(1536) NOT NULL, -- OpenAI Ada embedding dimension
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_knowledge_embeddings_collection ON knowledge_embeddings(collection);
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_company_id ON ai_conversations(company_id);
CREATE INDEX idx_company_users_user_id ON company_users(user_id);
CREATE INDEX idx_tax_rates_country_state ON tax_rates(country, state);
CREATE INDEX idx_tax_rates_tax_year ON tax_rates(tax_year);
CREATE INDEX idx_compliance_requirements_regions ON compliance_requirements USING GIN(regions);
CREATE INDEX idx_company_compliance_company_id ON company_compliance(company_id);

-- RLS (Row Level Security) Policies

-- Profiles: Users can only read their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_policy ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY profiles_update_policy ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Companies: Company owners and members can see their companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY companies_select_policy ON companies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM company_users
            WHERE company_users.company_id = companies.id
            AND company_users.user_id = auth.uid()
        )
    );

CREATE POLICY companies_insert_policy ON companies
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY companies_update_policy ON companies
    FOR UPDATE USING (
        owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM company_users
            WHERE company_users.company_id = companies.id
            AND company_users.user_id = auth.uid()
            AND company_users.role = 'admin'
        )
    );

-- Company Users: Visible to company members
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY company_users_select_policy ON company_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM company_users cu
            WHERE cu.company_id = company_users.company_id
            AND cu.user_id = auth.uid()
        )
    );

-- AI Conversations: Users can only see their own conversations
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY ai_conversations_select_policy ON ai_conversations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY ai_conversations_insert_policy ON ai_conversations
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY ai_conversations_update_policy ON ai_conversations
    FOR UPDATE USING (user_id = auth.uid());

-- Enable company admins to manage their own expense categories
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY expense_categories_select_policy ON expense_categories
    FOR SELECT USING (
        company_id IS NULL OR
        EXISTS (
            SELECT 1 FROM company_users
            WHERE company_users.company_id = expense_categories.company_id
            AND company_users.user_id = auth.uid()
        )
    );

CREATE POLICY expense_categories_insert_policy ON expense_categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM company_users
            WHERE company_users.company_id = expense_categories.company_id
            AND company_users.user_id = auth.uid()
        )
    );

-- Company compliance status visible to company members
ALTER TABLE company_compliance ENABLE ROW LEVEL SECURITY;

CREATE POLICY company_compliance_select_policy ON company_compliance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM company_users
            WHERE company_users.company_id = company_compliance.company_id
            AND company_users.user_id = auth.uid()
        )
    );

-- Reference data is publicly readable
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY tax_rates_select_policy ON tax_rates FOR SELECT USING (true);

ALTER TABLE compliance_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY compliance_requirements_select_policy ON compliance_requirements FOR SELECT USING (true);

-- Knowledge base is publicly readable
ALTER TABLE knowledge_embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY knowledge_embeddings_select_policy ON knowledge_embeddings FOR SELECT USING (true);