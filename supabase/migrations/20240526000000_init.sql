-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tables

-- Players table
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nickname TEXT UNIQUE NOT NULL,
    rating NUMERIC(10, 2) NOT NULL DEFAULT 1200.00,
    matches_played INTEGER NOT NULL DEFAULT 0,
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ranks table
CREATE TABLE IF NOT EXISTS ranks (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    min_rating NUMERIC(10, 2) NOT NULL,
    color_hex TEXT NOT NULL DEFAULT '#ffffff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_a_id UUID REFERENCES players(id),
    player_b_id UUID REFERENCES players(id),
    winner_id UUID REFERENCES players(id),
    rating_a_before NUMERIC(10, 2) NOT NULL,
    rating_a_after NUMERIC(10, 2) NOT NULL,
    rating_b_before NUMERIC(10, 2) NOT NULL,
    rating_b_after NUMERIC(10, 2) NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_void BOOLEAN DEFAULT FALSE
);

-- Rating Edits (Audit Log)
CREATE TABLE IF NOT EXISTS rating_edits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id),
    old_rating NUMERIC(10, 2) NOT NULL,
    new_rating NUMERIC(10, 2) NOT NULL,
    edited_by UUID REFERENCES auth.users(id),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Roles
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('judge', 'admin'))
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_players_rating ON players(rating DESC);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_players ON matches(player_a_id, player_b_id);

-- 3. Functions

-- Function to calculate Elo
CREATE OR REPLACE FUNCTION calculate_expected_score(rating_a NUMERIC, rating_b NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
    RETURN 1.0 / (1.0 + pow(10, (rating_b - rating_a) / 400.0));
END;
$$ LANGUAGE plpgsql;

-- Function to submit a match
CREATE OR REPLACE FUNCTION submit_match(
    host_id UUID,
    p_a_nickname TEXT,
    p_b_nickname TEXT,
    winner_nickname TEXT
) RETURNS UUID AS $$
DECLARE
    p_a_id UUID;
    p_b_id UUID;
    w_id UUID;
    r_a_old NUMERIC;
    r_b_old NUMERIC;
    r_a_new NUMERIC;
    r_b_new NUMERIC;
    e_a NUMERIC;
    e_b NUMERIC;
    k_a INTEGER;
    k_b INTEGER;
    s_a NUMERIC;
    s_b NUMERIC;
    m_a_count INTEGER;
    m_b_count INTEGER;
    match_id UUID;
BEGIN
    -- 1. Ensure players exist or create them
    INSERT INTO players (nickname) VALUES (p_a_nickname)
    ON CONFLICT (nickname) DO NOTHING;
    SELECT id, rating, matches_played INTO p_a_id, r_a_old, m_a_count FROM players WHERE nickname = p_a_nickname;

    INSERT INTO players (nickname) VALUES (p_b_nickname)
    ON CONFLICT (nickname) DO NOTHING;
    SELECT id, rating, matches_played INTO p_b_id, r_b_old, m_b_count FROM players WHERE nickname = p_b_nickname;

    IF p_a_id = p_b_id THEN
        RAISE EXCEPTION 'A player cannot fight themselves.';
    END IF;

    -- 2. Determine winner ID
    IF winner_nickname = p_a_nickname THEN
        w_id := p_a_id;
        s_a := 1;
        s_b := 0;
    ELSEIF winner_nickname = p_b_nickname THEN
        w_id := p_b_id;
        s_a := 0;
        s_b := 1;
    ELSE
        RAISE EXCEPTION 'Winner must be one of the participants.';
    END IF;

    -- 3. Calculate Elo
    e_a := calculate_expected_score(r_a_old, r_b_old);
    e_b := calculate_expected_score(r_b_old, r_a_old);

    k_a := CASE WHEN m_a_count < 10 THEN 40 ELSE 20 END;
    k_b := CASE WHEN m_b_count < 10 THEN 40 ELSE 20 END;

    r_a_new := r_a_old + k_a * (s_a - e_a);
    r_b_new := r_b_old + k_b * (s_b - e_b);

    -- 4. Update players
    UPDATE players 
    SET rating = r_a_new, 
        matches_played = matches_played + 1,
        wins = wins + (CASE WHEN s_a = 1 THEN 1 ELSE 0 END),
        losses = losses + (CASE WHEN s_a = 0 THEN 1 ELSE 0 END)
    WHERE id = p_a_id;

    UPDATE players 
    SET rating = r_b_new, 
        matches_played = matches_played + 1,
        wins = wins + (CASE WHEN s_b = 1 THEN 1 ELSE 0 END),
        losses = losses + (CASE WHEN s_b = 0 THEN 1 ELSE 0 END)
    WHERE id = p_b_id;

    -- 5. Record match
    INSERT INTO matches (player_a_id, player_b_id, winner_id, rating_a_before, rating_a_after, rating_b_before, rating_b_after, created_by)
    VALUES (p_a_id, p_b_id, w_id, r_a_old, r_a_new, r_b_old, r_b_new, host_id)
    RETURNING id INTO match_id;

    RETURN match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to undo last match
CREATE OR REPLACE FUNCTION undo_match(match_to_undo_id UUID)
RETURNS VOID AS $$
DECLARE
    m RECORD;
BEGIN
    SELECT * INTO m FROM matches WHERE id = match_to_undo_id AND is_void = FALSE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Match not found or already voided.';
    END IF;

    -- Revert player ratings and stats
    UPDATE players 
    SET rating = m.rating_a_before,
        matches_played = matches_played - 1,
        wins = wins - (CASE WHEN winner_id = player_a_id THEN 1 ELSE 0 END),
        losses = losses - (CASE WHEN winner_id != player_a_id THEN 1 ELSE 0 END)
    WHERE id = m.player_a_id;

    UPDATE players 
    SET rating = m.rating_b_before,
        matches_played = matches_played - 1,
        wins = wins - (CASE WHEN winner_id = player_b_id THEN 1 ELSE 0 END),
        losses = losses - (CASE WHEN winner_id != player_b_id THEN 1 ELSE 0 END)
    WHERE id = m.player_b_id;

    -- Mark match as void
    UPDATE matches SET is_void = TRUE WHERE id = match_to_undo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update player rating (Admin only)
CREATE OR REPLACE FUNCTION admin_edit_rating(
    admin_id UUID,
    p_id UUID,
    new_r NUMERIC,
    v_reason TEXT
) RETURNS VOID AS $$
DECLARE
    old_r NUMERIC;
BEGIN
    SELECT rating INTO old_r FROM players WHERE id = p_id;
    
    UPDATE players SET rating = new_r WHERE id = p_id;
    
    INSERT INTO rating_edits (player_id, old_rating, new_rating, edited_by, reason)
    VALUES (p_id, old_r, new_r, admin_id, v_reason);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Row Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
    SELECT role FROM user_roles WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE;

-- Players Policies
CREATE POLICY "Public can view players" ON players FOR SELECT USING (true);
CREATE POLICY "Admins can update players" ON players FOR UPDATE 
USING (get_my_role() = 'admin') 
WITH CHECK (get_my_role() = 'admin');

-- Ranks Policies
CREATE POLICY "Public can view ranks" ON ranks FOR SELECT USING (true);
CREATE POLICY "Admins can manage ranks" ON ranks FOR ALL 
USING (get_my_role() = 'admin') 
WITH CHECK (get_my_role() = 'admin');

-- Matches Policies
CREATE POLICY "Public can view matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Judges can insert matches" ON matches FOR INSERT 
WITH CHECK (get_my_role() IN ('judge', 'admin'));
-- Note: update/delete not allowed; matches are voided via undo_match function which is SECURITY DEFINER

-- Rating Edits Policies
CREATE POLICY "Admins can view rating edits" ON rating_edits FOR SELECT 
USING (get_my_role() = 'admin');

-- User Roles Policies
CREATE POLICY "Admins can manage roles" ON user_roles FOR ALL 
USING (get_my_role() = 'admin') 
WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "Users can view their own role" ON user_roles FOR SELECT 
USING (auth.uid() = user_id);
