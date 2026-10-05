-- ============================================================
-- EDU-SAAS: COMPLETE DATABASE SCHEMA (PHASES 1-7)
-- Run this in your Supabase SQL Editor to initialize the system.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- PHASE 1: CORE FOUNDATION & AUTHENTICATION
-- ------------------------------------------------------------

-- Roles Table (RBAC)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

INSERT INTO roles (name, description) VALUES
('Owner', 'Full control over all centers and settings'),
('Admin', 'Manage center operations, staff, and finances'),
('Teacher', 'Manage classes, attendance, and observations'),
('Marketing', 'Handle leads, campaigns, and growth tasks'),
('Parent', 'View student progress and communicate');

-- Centers Table (Multi-tenant support)
CREATE TABLE centers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users Table (Staff/Teachers/Admins)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    center_id INTEGER REFERENCES centers(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Logs (Audit Trail)
CREATE TABLE activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default Center for local development
INSERT INTO centers (name, address, phone, email) VALUES 
('Main Institute HQ', '123 Education Street, Knowledge City', '+1234567890', 'info@edusaas.local');

-- ------------------------------------------------------------
-- PHASE 2: STUDENT MANAGEMENT SYSTEM (CRM + LIFECYCLE)
-- ------------------------------------------------------------

-- Parents/Guardians
CREATE TABLE parents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    occupation VARCHAR(100),
    relationship VARCHAR(50), -- Father, Mother, Guardian
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students
CREATE TABLE students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id_code VARCHAR(20) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    medical_notes TEXT,
    special_requirements TEXT,
    status VARCHAR(20) DEFAULT 'Lead', -- Lead, Interested, Assessed, Registered, Active, On Hold, Withdrawn, Graduated
    current_level VARCHAR(50),
    enrolled_date DATE,
    center_id INTEGER REFERENCES centers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student-Parent Relationship (Many-to-Many)
CREATE TABLE student_parents (
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (student_id, parent_id)
);

-- Lifecycle History Tracking
CREATE TABLE student_lifecycle_history (
    id BIGSERIAL PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by UUID REFERENCES users(id),
    notes TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to auto-generate Student ID Code (STU-YYYY-NNNN)
CREATE OR REPLACE FUNCTION generate_student_id() RETURNS TRIGGER AS $$
DECLARE
    next_num INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO next_num FROM students WHERE student_id_code LIKE 'STU-' || EXTRACT(YEAR FROM CURRENT_DATE) || '%';
    NEW.student_id_code := 'STU-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || LPAD(next_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_student_id_code
BEFORE INSERT ON students
FOR EACH ROW EXECUTE FUNCTION generate_student_id();

-- ------------------------------------------------------------
-- PHASE 3: ACADEMIC MANAGEMENT SYSTEM
-- ------------------------------------------------------------

-- Academic Levels
CREATE TABLE academic_levels (
    id SERIAL PRIMARY KEY,
    level_name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0
);

INSERT INTO academic_levels (level_name, description, sort_order) VALUES
('Beginner', 'For absolute beginners with no prior knowledge', 1),
('Intermediate', 'For students with basic reading skills', 2),
('Advanced', 'For fluent readers focusing on deep understanding', 3),
('Hifz Track', 'Specialized track for memorization of the Qur''aan', 4);

-- Classes
CREATE TABLE classes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    class_name VARCHAR(100) NOT NULL,
    academic_level_id INTEGER REFERENCES academic_levels(id),
    teacher_id UUID REFERENCES users(id),
    schedule_days TEXT[] DEFAULT '{}',
    start_time TIME,
    end_time TIME,
    capacity INTEGER DEFAULT 20,
    room_location VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollments
CREATE TABLE student_class_enrollments (
    id BIGSERIAL PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'Enrolled', -- Enrolled, Completed, Dropped
    UNIQUE(student_id, class_id)
);

-- Lesson Plans
CREATE TABLE lesson_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id),
    scheduled_date DATE NOT NULL,
    topic VARCHAR(255),
    objectives TEXT,
    materials_needed TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teacher Observations
CREATE TABLE teacher_observations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    observer_id UUID REFERENCES users(id),
    observation_date DATE DEFAULT CURRENT_DATE,
    category VARCHAR(50), -- Behavior, Academics, Social, Spiritual
    notes TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------
-- PHASE 4: ATTENDANCE & ENGAGEMENT SYSTEM
-- ------------------------------------------------------------

-- Attendance Records
CREATE TABLE attendance_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status CHAR(1) NOT NULL CHECK (status IN ('P', 'A', 'L', 'E')), -- Present, Absent, Late, Excused
    marked_by UUID REFERENCES users(id),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, class_id, date)
);

-- Attendance Alerts
CREATE TABLE attendance_alerts (
    id BIGSERIAL PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    alert_type VARCHAR(50), -- Consecutive Absences, Low Average
    severity VARCHAR(20), -- Warning, Critical
    message TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Engagement Metrics
CREATE TABLE engagement_metrics (
    id BIGSERIAL PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    metric_date DATE DEFAULT CURRENT_DATE,
    homework_submitted_count INTEGER DEFAULT 0,
    quiz_average_score NUMERIC(5,2),
    parent_contact_frequency INTEGER DEFAULT 0,
    UNIQUE(student_id, metric_date)
);

-- ------------------------------------------------------------
-- PHASE 5: FINANCE & PAYMENT SYSTEM (ERP-LITE)
-- ------------------------------------------------------------

-- Fee Structures
CREATE TABLE fee_structures (
    id SERIAL PRIMARY KEY,
    level_id INTEGER REFERENCES academic_levels(id),
    fee_name VARCHAR(100) NOT NULL, -- Tuition, Registration, Materials
    amount NUMERIC(10,2) NOT NULL,
    billing_cycle VARCHAR(20) DEFAULT 'Monthly' -- Monthly, Quarterly, Termly
);

-- Invoices
CREATE TABLE invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_number VARCHAR(20) UNIQUE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    total_amount NUMERIC(10,2) NOT NULL,
    paid_amount NUMERIC(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Unpaid', -- Unpaid, Partially Paid, Paid, Overdue
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- Cash, Card, Bank Transfer, Cheque
    reference_number VARCHAR(100),
    received_by UUID REFERENCES users(id),
    payment_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses
CREATE TABLE expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    expense_category VARCHAR(50) NOT NULL, -- Rent, Utilities, Salaries, Supplies
    amount NUMERIC(10,2) NOT NULL,
    expense_date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    receipt_url TEXT,
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff Payroll
CREATE TABLE staff_payroll (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    staff_id UUID REFERENCES users(id) ON DELETE CASCADE,
    period_month INT NOT NULL,
    period_year INT NOT NULL,
    base_salary NUMERIC(10,2),
    bonuses NUMERIC(10,2) DEFAULT 0,
    deductions NUMERIC(10,2) DEFAULT 0,
    net_paid NUMERIC(10,2),
    payment_date DATE,
    status VARCHAR(20) DEFAULT 'Pending',
    UNIQUE(staff_id, period_month, period_year)
);

-- Trigger to auto-generate Invoice Number (INV-YYYY-NNNN)
CREATE OR REPLACE FUNCTION generate_invoice_number() RETURNS TRIGGER AS $$
DECLARE
    next_num INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO next_num FROM invoices WHERE invoice_number LIKE 'INV-' || EXTRACT(YEAR FROM CURRENT_DATE) || '%';
    NEW.invoice_number := 'INV-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || LPAD(next_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number
BEFORE INSERT ON invoices
FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- ------------------------------------------------------------
-- PHASE 6: MARKETING & GROWTH SYSTEM
-- ------------------------------------------------------------

-- Marketing Campaigns
CREATE TABLE marketing_campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_name VARCHAR(100) NOT NULL,
    channel VARCHAR(50) NOT NULL, -- Instagram, Local Flyers, Referrals
    budget NUMERIC(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active', -- Active, Paused, Completed
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketing Tasks
CREATE TABLE marketing_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_title VARCHAR(255) NOT NULL,
    assigned_to_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'Pending', -- Pending, In Progress, Completed
    due_date DATE,
    proof_of_completion_url TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Calendar
CREATE TABLE content_calendar (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    publish_date DATE NOT NULL,
    platform VARCHAR(50) NOT NULL,
    content_type VARCHAR(50), -- Image, Video, Story
    caption TEXT,
    media_url TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead Conversions
CREATE TABLE lead_conversions (
    id BIGSERIAL PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    converted_from_source VARCHAR(50), -- Organic, Ad, Referral
    converted_on DATE DEFAULT CURRENT_DATE,
    handled_by UUID REFERENCES users(id)
);

-- ------------------------------------------------------------
-- PHASE 7: COMMUNICATION SYSTEM
-- ------------------------------------------------------------

-- Notifications
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'Info', -- Info, Alert, Success
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages (Internal Chat)
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support Tickets
CREATE TABLE support_tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_number VARCHAR(20) UNIQUE,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'Medium', -- Low, Medium, High
    category VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Open', -- Open, In Progress, Resolved, Closed
    created_by_id UUID REFERENCES users(id),
    assigned_to_id UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket Responses
CREATE TABLE ticket_responses (
    id BIGSERIAL PRIMARY KEY,
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    responder_id UUID REFERENCES users(id),
    response_text TEXT NOT NULL,
    is_internal_note BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to auto-generate Ticket Number (TKT-YYYY-NNNN)
CREATE OR REPLACE FUNCTION generate_ticket_number() RETURNS TRIGGER AS $$
DECLARE
    next_num INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO next_num FROM support_tickets WHERE ticket_number LIKE 'TKT-' || EXTRACT(YEAR FROM CURRENT_DATE) || '%';
    NEW.ticket_number := 'TKT-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || LPAD(next_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_number
BEFORE INSERT ON support_tickets
FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- For a production app, you would tighten these significantly.
-- These allow authenticated users to see data within their center.
-- ============================================================

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all data (Basic Dev Mode)
CREATE POLICY "Allow authenticated read" ON students FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON attendance_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON support_tickets FOR SELECT TO authenticated USING (true);

-- Policy: Allow authenticated users to insert/update/delete (Basic Dev Mode)
CREATE POLICY "Allow authenticated write" ON students FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write" ON classes FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write" ON attendance_records FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write" ON invoices FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write" ON payments FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write" ON support_tickets FOR ALL TO authenticated USING (true);
