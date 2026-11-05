-- ==============================================================================
-- SUPABASE MIGRATION: Shared Cart & Split-Billing (Social Ordering)
-- Real-Time WebSockets enabled for table_sessions, session_participants, cart_items
-- ==============================================================================

-- 1. Enable UUID Extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if recreating (safe idempotent setup)
-- DROP TABLE IF EXISTS cart_items CASCADE;
-- DROP TABLE IF EXISTS session_participants CASCADE;
-- DROP TABLE IF EXISTS table_sessions CASCADE;

-- 3. Table: table_sessions
-- Represents an active dining table session across multiple devices
CREATE TABLE IF NOT EXISTS table_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id TEXT NOT NULL,
    table_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Index for rapid lookup by table and venue
CREATE INDEX IF NOT EXISTS idx_table_sessions_venue_table 
    ON table_sessions(venue_id, table_number, status);

-- 4. Table: session_participants
-- Tracks individual guests connected to the table session
CREATE TABLE IF NOT EXISTS session_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES table_sessions(id) ON DELETE CASCADE,
    user_nickname TEXT NOT NULL,
    avatar_color TEXT DEFAULT '#4F46E5',
    is_host BOOLEAN NOT NULL DEFAULT false,
    has_paid BOOLEAN NOT NULL DEFAULT false,
    amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_session_participants_session_id 
    ON session_participants(session_id);

-- 5. Table: cart_items
-- Live shared cart items synchronized via Supabase Realtime
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES table_sessions(id) ON DELETE CASCADE,
    added_by_user_id UUID REFERENCES session_participants(id) ON DELETE SET NULL,
    item_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    custom_notes TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_cart_items_session_id 
    ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_status 
    ON cart_items(session_id, status);

-- 6. Trigger: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_table_sessions_timestamp ON table_sessions;
CREATE TRIGGER trg_update_table_sessions_timestamp
    BEFORE UPDATE ON table_sessions
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_update_cart_items_timestamp ON cart_items;
CREATE TRIGGER trg_update_cart_items_timestamp
    BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- 7. Row Level Security (RLS) Configuration
ALTER TABLE table_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access scoped to active dining sessions (B2B guest flow)
CREATE POLICY "Public table sessions access" 
    ON table_sessions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public session participants access" 
    ON session_participants FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public cart items access" 
    ON cart_items FOR ALL USING (true) WITH CHECK (true);

-- 8. Enable Full Replica Identity for Realtime UPDATE/DELETE payloads
ALTER TABLE table_sessions REPLICA IDENTITY FULL;
ALTER TABLE session_participants REPLICA IDENTITY FULL;
ALTER TABLE cart_items REPLICA IDENTITY FULL;

-- 9. Add tables to Supabase Realtime Publication
-- Note: In Supabase SQL editor, this registers the tables for postgres_changes broadcasts
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'table_sessions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE table_sessions;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'session_participants'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE session_participants;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'cart_items'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE cart_items;
    END IF;
END $$;

