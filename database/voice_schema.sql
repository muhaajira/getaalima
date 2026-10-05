-- ============================================================
-- PHASE 8: VOICE PLATFORM SCHEMA (LIVEKIT INTEGRATION)
-- Run this in your Supabase SQL Editor after the main schema.
-- ============================================================

-- Voice Sessions (Scheduled Live Lessons)
CREATE TABLE voice_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_title VARCHAR(255) NOT NULL,
    description TEXT,
    host_id UUID REFERENCES users(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    max_participants INTEGER DEFAULT 50,
    is_live BOOLEAN DEFAULT FALSE,
    livekit_room_name VARCHAR(100), -- The name used for the LiveKit server room
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audio Library (Organized Past Lessons)
CREATE TABLE audio_library (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    book_title VARCHAR(255) NOT NULL,
    lesson_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    audio_url TEXT NOT NULL, -- Path to Supabase Storage bucket
    duration_seconds INTEGER,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT TRUE, -- Whether students can see it
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(book_title, lesson_number)
);

-- Session Participants (Tracking who joined a live session)
CREATE TABLE voice_session_participants (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID REFERENCES voice_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(session_id, user_id)
);

-- RLS Policies for Voice Platform
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_session_participants ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read sessions and library
CREATE POLICY "Allow authenticated read" ON voice_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON audio_library FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON voice_session_participants FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to manage sessions and library
CREATE POLICY "Allow authenticated write" ON voice_sessions FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write" ON audio_library FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write" ON voice_session_participants FOR ALL TO authenticated USING (true);
