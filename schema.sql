-- BORRADO DE PRUEBAS ANTERIORES PARA EMPEZAR EN LIMPIO
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS brainstorm_ideas;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS scripts;
DROP TABLE IF EXISTS videos;
DROP TABLE IF EXISTS brands;
DROP TABLE IF EXISTS users;
DROP TYPE IF EXISTS user_role;

-- CreatorOS Database Schema (PostgreSQL/Supabase)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles Enum
-- Roles Enum
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'brand', 'creador');

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

-- ADMIN: Full access
-- EDITOR: Can see/edit videos, scripts, assets. Cannot see financial data (revenue_deal, invoices).
-- BRAND: Can only see their own brand data, associated video scripts (read-only), and invoices.

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE brainstorm_ideas ENABLE ROW LEVEL SECURITY;

-- Políticas para 'users'
CREATE POLICY "Usuarios pueden ver su propio perfil" ON users
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Políticas generales basadas en Creador (Dueño del CRM)
-- Asumimos para este MVP que cada usuario logueado gestiona sus propios datos de forma aislada.

-- Brands
CREATE POLICY "Creadores ven sus propias marcas" ON brands
    FOR ALL USING (auth.uid() IN (
        SELECT creator_id FROM videos WHERE brand_id = brands.id
    ) OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'creador'
    ));

-- Videos
CREATE POLICY "Creadores ven sus propios videos" ON videos FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "Creadores insertan sus propios videos" ON videos FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creadores actualizan sus propios videos" ON videos FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creadores borran sus propios videos" ON videos FOR DELETE USING (auth.uid() = creator_id);

-- Scripts
CREATE POLICY "Creadores gestionan guiones de sus videos" ON scripts
    FOR ALL USING (
        video_id IN (SELECT id FROM videos WHERE creator_id = auth.uid())
    );

-- Assets
CREATE POLICY "Creadores gestionan assets de sus videos" ON assets
    FOR ALL USING (
        video_id IN (SELECT id FROM videos WHERE creator_id = auth.uid())
    );

-- Invoices
CREATE POLICY "Creadores gestionan facturas de sus videos" ON invoices
    FOR ALL USING (
        video_id IN (SELECT id FROM videos WHERE creator_id = auth.uid())
    );

-- Brainstorm Ideas
CREATE POLICY "Creadores gestionan sus propias ideas" ON brainstorm_ideas
    FOR ALL USING (auth.uid() = creator_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE(NEW.raw_user_meta_data->>'role', 'admin')::user_role
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- FIX PARA USUARIOS EXISTENTES (BACKFILL)
-- ==========================================
-- Sincronizar usuarios que ya estaban registrados en auth.users pero se borraron de public.users al reiniciar la base de datos
INSERT INTO public.users (id, email, full_name, avatar_url, role)
SELECT 
    id, 
    email, 
    raw_user_meta_data->>'full_name', 
    raw_user_meta_data->>'avatar_url', 
    'admin'::user_role
FROM auth.users
ON CONFLICT (id) DO NOTHING;
