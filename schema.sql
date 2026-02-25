-- CreatorOS Database Schema (PostgreSQL/Supabase)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles Enum
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'brand');

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    avatar_url TEXT
);

-- Brands/Sponsors Table
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_url TEXT,
    contact_email TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Videos/Projects Table
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES users(id),
    brand_id UUID REFERENCES brands(id),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'idea', -- 'idea', 'scripting', 'recording', 'editing', 'published'
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    views_count BIGINT DEFAULT 0,
    publish_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revenue_deal NUMERIC(10, 2),
    is_urgent BOOLEAN DEFAULT FALSE,
    deadline TIMESTAMP WITH TIME ZONE
);

-- Scripts Table
CREATE TABLE scripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    content JSONB, -- Stores blocks: { blocks: [{ type: 'hook', text: '...', notes: '...' }, ...] }
    estimated_time_seconds INTEGER,
    approval_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'feedback'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets Table
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT, -- 'thumbnail', 'contract', 'b-roll', 'logo'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices Table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES videos(id),
    brand_id UUID REFERENCES brands(id),
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'draft', -- 'draft', 'sent', 'paid', 'overdue'
    invoice_number SERIAL,
    due_date TIMESTAMP WITH TIME ZONE,
    issued_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brainstorming Table
CREATE TABLE brainstorm_ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    color TEXT,
    position_x INTEGER,
    position_y INTEGER,
    converted_to_video_id UUID REFERENCES videos(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies (Conceptual)
-- ADMIN: Full access
-- EDITOR: Can see/edit videos, scripts, assets. Cannot see financial data (revenue_deal, invoices).
-- BRAND: Can only see their own brand data, associated video scripts (read-only), and invoices.
