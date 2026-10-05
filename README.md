# EduSaaS: Education Operating System

A comprehensive management system for Qur'aan institutes, language schools, and training centers. Built with Next.js 14, TypeScript, TailwindCSS, and Supabase.

## Features (Phases 1-7)
1. **Core Foundation:** Role-based access control (Owner, Admin, Teacher, Marketing, Parent), multi-center support, and activity logging.
2. **Student Management:** CRM with lifecycle tracking (Lead → Graduated), parent linking, and auto-generated student IDs.
3. **Academic Management:** Class scheduling, lesson plans, teacher observations, and academic levels.
4. **Attendance & Engagement:** Daily P/A/L/E tracking, automated alerts, and engagement metrics.
5. **Finance (ERP-Lite):** Invoices, payments, expenses, and staff payroll with auto-status updates.
6. **Marketing & Growth:** Campaign management, task board with proof-of-completion, and lead conversion tracking.
7. **Communication:** Internal notifications, messaging, and a full support ticketing system.
8. **Voice Platform:** Secure, voice-only live rooms using LiveKit, plus an organized audio library for past lessons.

## Getting Started

### Prerequisites
- Node.js v18+
- A [Supabase](https://supabase.com) account (Free tier is sufficient)
- A [Vercel](https://vercel.com) account (for deployment)

### 1. Setup Database
1. Log in to your Supabase dashboard.
2. Go to the **SQL Editor**.
3. First, run the contents of `database/schema.sql`.
4. Then, run the contents of `database/voice_schema.sql` to add the voice platform features.
5. Click **Run** for both to create all tables, triggers, and RLS policies.

### 2. Configure Environment Variables
1. In your project root, rename `.env.example` to `.env.local`.
2. Open your Supabase Project Settings → API.
3. Copy the **Project URL** and **anon public key**.
4. Paste them into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-server-url
   NEXT_PUBLIC_LIVEKIT_API_KEY=your-livekit-api-key
   ```

### 3. Install Dependencies & Run Locally
```bash
npm install
npm run dev
```
Visit `http://localhost:3000`. You will be redirected to the login page.

### 4. Deployment (Zero Cost)
1. Push this folder to a GitHub repository.
2. Go to Vercel and "Import" the repository.
3. Add your Supabase environment variables in the Vercel dashboard.
4. Click **Deploy**. Your SaaS is now live on a free subdomain!

## Architecture Notes
- **Auto-IDs:** Student codes (STU-YYYY-NNNN), Invoice numbers (INV-YYYY-NNNN), and Ticket numbers (TKT-YYYY-NNNN) are handled by PostgreSQL triggers.
- **Security:** Row Level Security (RLS) is enabled. For production, ensure you restrict data based on `center_id` and user roles.
- **Multi-Tenant:** The `centers` table allows for scaling to multiple branches under one roof.
