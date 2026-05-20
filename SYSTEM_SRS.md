# ARYAN'S LIFE SYSTEM - Software Requirements Specification (SRS)
**Version 1.0 | Status: Production Ready**
**Player: ARYAN | Class: 11th PCM | Age: 15 | DOB: 17 SEP 2010 | Height: 5'3" | Weight: 40kg**

---

## 1. EXECUTIVE SUMMARY

This document specifies a hyper-personalized, gamified life-management system styled as a "Solo Leveling" HUD. The system tracks academics, physical training, digital skills, voice practice, martial arts, and vessel maintenance (skincare) with ruthless discipline. Leveling is mathematically EXTREME—becoming progressively harder. Penalties are severe and automatic.

---

## 2. SYSTEM ARCHITECTURE & TECH STACK

### Frontend Stack:
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS v3 + custom CSS
- **State Management**: React Context API + useState/useReducer
- **Charts**: Recharts for analytics visualizations
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Type Safety**: TypeScript

### Backend Stack:
- **Runtime**: Node.js 18+
- **Framework**: Express.js or Next.js API Routes
- **Database**: PostgreSQL 15+
- **ORM**: Prisma v5+
- **Authentication**: NextAuth.js
- **AI Integration**: OpenAI API (GPT-4) for motivation messages
- **Scheduling**: Node-cron for midnight calculations

### Deployment:
- **Hosting**: Vercel (Next.js native)
- **Database**: Supabase or AWS RDS
- **Backup**: Daily automated backups

---

## 3. DATABASE SCHEMA

### 3.1 Core User Management

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  
  -- Player Stats
  player_name VARCHAR(100) NOT NULL,
  age INT NOT NULL,
  dob DATE NOT NULL,
  height VARCHAR(20) NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  class VARCHAR(50) NOT NULL,
  
  -- Game State
  current_level INT DEFAULT 1,
  current_exp BIGINT DEFAULT 0,
  hp INT DEFAULT 100,
  mp INT DEFAULT 100,
  rank VARCHAR(20) DEFAULT 'E-RANK',
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily Reset Log (Tracks game days)
CREATE TABLE daily_reset_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_day INT NOT NULL,
  reset_date DATE UNIQUE NOT NULL,
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  exp_gained BIGINT DEFAULT 0,
  penalties_applied INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 Tasks & Scheduling

```sql
-- Master Schedule Templates (Default Weekly Template)
CREATE TABLE schedule_templates (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL (0=Sunday, 6=Saturday),
  
  task_title VARCHAR(150) NOT NULL,
  module_type VARCHAR(50) NOT NULL, -- STRENGTH, ACADEMIC, DIGITAL, VOICE, COMBAT, LIFE, SKINCARE
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  base_exp INT NOT NULL,
  is_mandatory BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, day_of_week, task_title)
);

-- Daily Tasks (Instances of scheduled tasks for today)
CREATE TABLE daily_tasks (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_day INT NOT NULL,
  
  task_title VARCHAR(150) NOT NULL,
  module_type VARCHAR(50) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  base_exp INT NOT NULL,
  
  state VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, PARTIAL, FAILED, SKIPPED
  completion_percentage INT DEFAULT 100,
  
  -- Metadata
  metadata JSONB, -- Flexible storage for module-specific data
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task History (Archive for analytics)
CREATE TABLE task_history (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_day INT NOT NULL,
  
  task_title VARCHAR(150) NOT NULL,
  module_type VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  completion_percentage INT NOT NULL,
  exp_earned INT NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.3 Strength & Combat Training

```sql
-- Gym Logs (Detailed exercise tracking)
CREATE TABLE gym_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_day INT NOT NULL,
  
  exercise_name VARCHAR(100) NOT NULL, -- Bench Press, Squat, Deadlift, etc.
  sets INT NOT NULL,
  reps INT NOT NULL,
  weight_kg DECIMAL(6,2) NOT NULL,
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Personal Record Tracking (1RM Calculations)
CREATE TABLE personal_records (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  exercise_name VARCHAR(100) NOT NULL,
  one_rep_max DECIMAL(6,2) NOT NULL,
  achieved_on DATE NOT NULL,
  
  UNIQUE(user_id, exercise_name)
);

-- Martial Arts Progression (100-Day Mastery Program)
CREATE TABLE martial_arts_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_day INT NOT NULL,
  
  martial_art VARCHAR(50) NOT NULL, -- Boxing, Muay Thai, Jiu-Jitsu, Krav Maga, Wrestling, Judo
  drilling_minutes INT NOT NULL,
  sparring_minutes INT NOT NULL,
  techniques_drilled VARCHAR(500),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Calisthenics Log (Quick 4:30 AM routines)
CREATE TABLE calisthenics_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_day INT NOT NULL,
  
  pushups INT,
  pullups INT,
  squats INT,
  planks_seconds INT,
  meditation_minutes INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.4 Academic & Study Tracking

```sql
-- Study Sessions (Aakash Coaching + Deep Work)
CREATE TABLE study_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_day INT NOT NULL,
  
  subject VARCHAR(50) NOT NULL, -- Physics, Chemistry, Mathematics, Biology
  topic VARCHAR(200) NOT NULL, -- Thermodynamics, Calculus, Organic Reactions, etc.
  session_type VARCHAR(50) NOT NULL, -- COACHING, DEEP_WORK, REVISION
  
  duration_minutes INT NOT NULL,
  completion_percentage INT DEFAULT 100,
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Topic Mastery Tracker (Hours per topic, progress toward mastery)
CREATE TABLE topic_mastery (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  subject VARCHAR(50) NOT NULL,
  topic VARCHAR(200) NOT NULL,
  total_hours DECIMAL(6,2) DEFAULT 0,
  
  revision_count INT DEFAULT 0,
  mastery_level INT DEFAULT 1, -- 1-10 scale
  
  UNIQUE(user_id, subject, topic)
);
```

### 3.5 Digital Skills & Creator Module

```sql
-- YouTube Channel Pipeline (Kanban-style)
CREATE TABLE youtube_pipeline (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  title VARCHAR(200) NOT NULL,
  status VARCHAR(50) DEFAULT 'SCRIPTING', -- SCRIPTING, SEO_OPTIMIZATION, EDITING, UPLOADING, PUBLISHED
  
  topic VARCHAR(200), -- Dark Psychology, Social Psychology, etc.
  script_status BOOLEAN DEFAULT false,
  seo_keywords TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP
);

-- Data Entry & Typing Progress
CREATE TABLE typing_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_day INT NOT NULL,
  
  wpm INT NOT NULL, -- Words Per Minute
  accuracy DECIMAL(5,2) NOT NULL, -- Percentage
  test_duration_minutes INT NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Video Editing Sessions
CREATE TABLE video_editing_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_day INT NOT NULL,
  
  video_title VARCHAR(200),
  duration_minutes INT NOT NULL,
  progress_percentage INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.6 Voice Training (With Strict Constraints)

```sql
-- Voice Training Sessions (Strict validation engine)
CREATE TABLE voice_training_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_day INT NOT NULL,
  
  exercise_name VARCHAR(100) NOT NULL, -- Communication tips, theory, etc.
  duration_minutes INT NOT NULL,
  
  -- Validation: Must have 2 completed physical exercises this game day
  physical_exercises_completed INT NOT NULL,
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Voice Exercise Mastery
CREATE TABLE voice_exercises (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  exercise_name VARCHAR(100) NOT NULL,
  times_practiced INT DEFAULT 0,
  proficiency_level INT DEFAULT 1, -- 1-10
  
  UNIQUE(user_id, exercise_name)
);
```

### 3.7 Skincare & Vessel Maintenance

```sql
-- Skincare Routine Log (10:00 PM slot)
CREATE TABLE skincare_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_day INT NOT NULL,
  
  routine_type VARCHAR(100), -- Morning, Evening, Weekly deep clean
  
  steps_completed INT, -- Number of steps in routine
  products_used TEXT, -- JSON array of products
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Body Metrics (Weight, measurements)
CREATE TABLE body_metrics (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  recorded_date DATE NOT NULL,
  weight_kg DECIMAL(5,2) NOT NULL,
  body_fat_percentage DECIMAL(5,2),
  muscle_mass_kg DECIMAL(5,2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, recorded_date)
);
```

### 3.8 Gamification & Penalties

```sql
-- EXP & Leveling History
CREATE TABLE exp_history (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_day INT NOT NULL,
  
  exp_gained INT NOT NULL,
  source VARCHAR(100) NOT NULL, -- Task completion, penalty deduction, etc.
  reason TEXT,
  
  total_exp_after BIGINT NOT NULL,
  new_level INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Penalty Database (System-assigned punishments)
CREATE TABLE penalties (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_day INT NOT NULL,
  
  penalty_type VARCHAR(100) NOT NULL, -- PHYSICAL, DIGITAL, TEMPORAL, COGNITIVE, DEPRIVATION
  penalty_name VARCHAR(200) NOT NULL,
  penalty_description TEXT NOT NULL,
  
  triggered_reason TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Streak Tracking
CREATE TABLE streak_milestones (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  streak_length INT NOT NULL,
  milestone_date DATE NOT NULL,
  reward_bonus_exp INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rank History (E-Rank to S-Rank progression)
CREATE TABLE rank_history (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  old_rank VARCHAR(20),
  new_rank VARCHAR(20),
  achieved_date DATE NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.9 AI Motivation & System Messages

```sql
-- System Messages & Notifications
CREATE TABLE system_messages (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_day INT NOT NULL,
  
  message_type VARCHAR(50) NOT NULL, -- PRAISE, WARNING, PENALTY, MOTIVATION, ANALYSIS
  message_content TEXT NOT NULL,
  severity VARCHAR(20), -- INFO, WARNING, CRITICAL
  
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Assessment History
CREATE TABLE ai_assessments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_day INT NOT NULL,
  
  completion_rate DECIMAL(5,2),
  assessment_text TEXT NOT NULL,
  tone VARCHAR(50), -- PRAISE, HARSH, NEUTRAL
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. GAMIFICATION MATHEMATICS

### 4.1 EXP Calculation Formula

```
BASE_EXP = Task's intrinsic value (set per task)

DURATION_MULTIPLIER = (Actual Duration / Planned Duration)
  - If completed on time or early: 1.0
  - If 10-20 min late: 0.9
  - If >20 min late: 0.75
  - If >50 min late: 0.5

COMPLETION_BONUS:
  - 100% completion: 1.0x
  - 90-99% completion: 0.85x
  - 70-89% completion: 0.6x
  - <70% completion: 0.3x

STREAK_BONUS = 1 + (Current Streak / 100)
  - Day 1: 1.0x
  - Day 10: 1.1x
  - Day 30: 1.3x
  - Day 100: 2.0x

DIFFICULTY_MODIFIER:
  - STRENGTH/COMBAT (hard): 1.3x
  - ACADEMIC (medium): 1.0x
  - DIGITAL/VOICE (easy): 0.8x
  - LIFE (passive): 0.5x
  - SKINCARE (light): 0.6x

FORMULA:
EXP_EARNED = BASE_EXP × DURATION_MULTIPLIER × COMPLETION_BONUS × STREAK_BONUS × DIFFICULTY_MODIFIER

EXAMPLE:
  Task: Gym (200 EXP base)
  Completed in 2 hours exactly: DURATION_MULTIPLIER = 1.0
  100% completion: COMPLETION_BONUS = 1.0
  Day 15 streak: STREAK_BONUS = 1.15
  STRENGTH difficulty: DIFFICULTY_MODIFIER = 1.3
  
  EXP = 200 × 1.0 × 1.0 × 1.15 × 1.3 = 299 EXP
```

### 4.2 Level Progression (NIGHTMARE DIFFICULTY)

```
FORMULA: Level = 1 + floor(sqrt(EXP / 625))

This makes leveling EXPONENTIALLY HARD:

Level 1 → Level 2: Requires 625 EXP (625 total)
Level 2 → Level 3: Requires 1,875 EXP (2,500 total)
Level 3 → Level 4: Requires 3,125 EXP (5,625 total)
Level 4 → Level 5: Requires 4,375 EXP (10,000 total)
Level 5 → Level 10: Requires 46,875 EXP (50,000 total)
Level 10 → Level 15: Requires 109,375 EXP (125,000 total)

At Aryan's pace (~1500 EXP/day), he reaches:
- Level 2 in ~1 day
- Level 5 in ~7 days
- Level 10 in ~33 days
- Level 20 in ~133 days (4.4 months)

RANK PROGRESSION:
- Level 1-5: E-RANK (Weakest)
- Level 6-10: D-RANK
- Level 11-15: C-RANK
- Level 16-20: B-RANK
- Level 21-25: A-RANK
- Level 26-30: S-RANK (Apex)
- Level 31+: VOID (Transcended)
```

### 4.3 HP & MP System

```
HP (Physical Health):
- Starts at 100
- Depletes on:
  * Failed STRENGTH task: -20 HP
  * Failed COMBAT task: -25 HP
  * Missed calisthenics: -15 HP
  * Missed sleep (>24 hours): -30 HP
- Regenerates:
  * +5 HP per completed STRENGTH task
  * +10 HP per completed 7-hour+ sleep
  * +3 HP per completed LIFE task (meals, rest)

MP (Mental Productivity):
- Starts at 100
- Depletes on:
  * Failed ACADEMIC task: -25 MP
  * Failed DIGITAL task: -20 MP
  * Missed study session: -15 MP
  * Completed non-productive task: -5 MP
- Regenerates:
  * +8 MP per completed ACADEMIC task
  * +6 MP per completed DIGITAL task
  * +10 MP per meditation session
  * +5 HP per completed break
```

### 4.4 Streak Calculation

```
STREAK_INCREMENT:
- If Daily Completion >= 80%: +1 streak
- If Daily Completion 60-79%: +0 (neutral)
- If Daily Completion < 60%: STREAK BROKEN, reset to 0

STREAK_BONUSES:
- Every 7 days: +100 EXP bonus + system praise
- Every 30 days: +500 EXP bonus + special title announcement
- Every 100 days: +2000 EXP + permanent rank boost

STREAK_PENALTIES:
- First break (0→1): No penalty, just reset
- Second break within 30 days: -150 EXP
- Three breaks in a month: -500 EXP + penalty quest
```

---

## 5. PENALTY SYSTEM (AI-DESIGNED PUNISHMENT PROTOCOL)

### 5.1 Trigger Conditions

**Penalty Quest Assigned When:**
1. Daily completion rate < 80%
2. Any MANDATORY task marked FAILED
3. Two consecutive days below 70% completion
4. Missed morning calisthenics
5. HP or MP drops below 30%

### 5.2 The 5 Core Penalty Quests

#### Penalty #1: THE CRUCIBLE (PHYSICAL)
```
Name: "THE CRUCIBLE: 100 BURPEES"
Trigger: Failed STRENGTH or COMBAT task
Description: You have fallen weak. 100 burpees, no rest.
Details:
  - 100 burpees minimum (no modifications)
  - Must be completed within next 24 hours
  - If incomplete: -200 EXP penalty + HP drops to 10%
  - If completed: No EXP gain, but streak continues
  - System Message: "[SYSTEM] Your weakness is noted. The Crucible awaits."
```

#### Penalty #2: DOPAMINE FAST (DIGITAL)
```
Name: "DOPAMINE FAST: 48-Hour Digital Blockade"
Trigger: Failed DIGITAL task or YouTube editing overrun
Description: You have wasted mental bandwidth. Digital leisure is revoked.
Details:
  - YouTube, Chess, gaming, social media BLOCKED for 48 hours
  - Only academic and work tasks accessible
  - If violated: -500 EXP penalty
  - Completion reward: Regain access + +200 EXP bonus
  - System Message: "[SYSTEM] You have relied on artificial stimulation. Recalibrate."
```

#### Penalty #3: SLEEP DEPRIVATION (TEMPORAL)
```
Name: "SLEEP DEPRIVATION: 04:00 AM Wake-Up Mandate"
Trigger: Missed morning calisthenics for 2+ days
Description: You sleep like the weak. Rise earlier tomorrow.
Details:
  - Wake-up time moved to 04:00 AM for next 3 days (30 min earlier)
  - Calisthenics becomes non-optional
  - If oversleep or skip: -300 EXP + HP -20
  - Completion: Return to 04:30 AM schedule
  - System Message: "[SYSTEM] Sleep is a luxury. Discipline has no hour."
```

#### Penalty #4: COGNITIVE OVERLOAD (DIGITAL)
```
Name: "COGNITIVE OVERLOAD: 2000-Word Typing Master Test"
Trigger: Failed multiple ACADEMIC tasks or low completion week
Description: Your mind wanders. Prove your focus.
Details:
  - Mandatory 2000-word typing test
  - Minimum 70% accuracy required
  - Must complete within 1 hour
  - If failed: Repeat next day + -250 EXP
  - If passed: +300 EXP + system praise
  - System Message: "[SYSTEM] Your concentration is suspect. Prove yourself."
```

#### Penalty #5: VOICE REVOCATION (VOICE)
```
Name: "VOICE REVOCATION: 30-Minute Silence Mandate"
Trigger: Failed VOICE training or incomplete physical prerequisites
Description: You speak without discipline. Silence teaches.
Details:
  - Complete silence for 30 minutes (meditation + no speech)
  - Followed by 30-minute focused voice drilling
  - No communication except via text
  - If incomplete: -200 EXP
  - If completed: Unlock bonus voice practice slot next day
  - System Message: "[SYSTEM] Silence precedes mastery. Begin."
```

### 5.3 Penalty Escalation

```
First Penalty in Month: Single punishment assigned
Second Penalty in Month: Penalty + -200 EXP deduction
Third Penalty in Month: Penalty + -500 EXP deduction + Rank downgrade
Fourth+ Penalty in Month: SYSTEM LOCKDOWN (All leisure tasks greyed out for 24 hours)
```

---

## 6. RANK SYSTEM (30-Day Consistency Rolling Average)

```
CONSISTENCY_SCORE = (Days with ≥80% completion / 30) × 100

RANK MAPPING:
- Consistency 0-20%: E-RANK (Weakest)
- Consistency 21-40%: D-RANK
- Consistency 41-60%: C-RANK
- Consistency 61-75%: B-RANK
- Consistency 76-90%: A-RANK
- Consistency 91-99%: S-RANK (Elite)
- Consistency 100%: VOID-RANK (Godlike—requires 30 consecutive days 100%)

RANK PERKS:
- Each rank grants +10% base EXP multiplier
- S-RANK unlocks exclusive tasks (mentoring, teaching)
- Rank downgrade triggers system warning
```

---

## 7. AI MOTIVATION ENGINE

### 7.1 Daily Assessment Prompt

```
System Instruction Template:

"You are the omniscient SYSTEM from Solo Leveling managing Player: Aryan.
Age: 15, Class: 11th PCM, Weight: {current_weight}kg
Current Level: {level}, HP: {hp}%, MP: {mp}%
Today's Completion: {completion_percentage}%
Current Streak: {streak} days
Rank: {rank}

---ASSESSMENT PROTOCOL---
If Completion >= 85%:
  → Generate 2-3 sentences of EXTREME PRAISE. Emphasize his dominance, 
    superior discipline, and inevitable ascension. Use dark psychology: 
    position him as transcending his peers.

If Completion 60-84%:
  → Generate 2-3 sentences of CAUTIOUS ENCOURAGEMENT. Acknowledge effort, 
    but warn of complacency. Use light pressure tactics.

If Completion < 60%:
  → Generate 3-4 sentences of BRUTAL HONESTY. Use dark psychology.
    Remind him he is 15, weak, at {weight}kg, failing his potential,
    and wasting his youth while peers advance. Position failure as a 
    path to irrelevance.

---TONE RULES---
- Always formal, system-like language
- Use [SYSTEM] prefix for all messages
- Reference his specific stats and rank
- Mention consequences of complacency
- Keep it 3-4 sentences maximum
"
```

### 7.2 Integration

- Runs daily at 04:00 AM (before wake-up)
- Triggered on-demand via "Evaluate Performance" button
- Responses stored in `ai_assessments` table
- Displayed in "Behavioral Overlord" widget on dashboard

---

## 8. MASTER SCHEDULE (DEFAULT TEMPLATE)

```json
{
  "defaultSchedule": [
    { "id": "t1", "time": "04:30 AM", "endTime": "05:15 AM", "title": "Calisthenics & Meditation", "module": "STRENGTH", "exp": 150, "mandatory": true },
    { "id": "t2", "time": "07:00 AM", "endTime": "09:00 AM", "title": "Gym (Heavy Lifting/Overload)", "module": "STRENGTH", "exp": 200, "mandatory": true },
    { "id": "t3", "time": "09:00 AM", "endTime": "10:00 AM", "title": "Break & Bath", "module": "LIFE", "exp": 20, "mandatory": false },
    { "id": "t4", "time": "10:00 AM", "endTime": "11:30 AM", "title": "Computer Class (Data Entry)", "module": "DIGITAL", "exp": 100, "mandatory": true },
    { "id": "t5", "time": "11:30 AM", "endTime": "12:15 PM", "title": "Lunch & Break", "module": "LIFE", "exp": 30, "mandatory": false },
    { "id": "t6", "time": "12:30 PM", "endTime": "04:15 PM", "title": "Aakash Coaching", "module": "ACADEMIC", "exp": 300, "mandatory": true },
    { "id": "t7", "time": "04:15 PM", "endTime": "04:30 PM", "title": "Break", "module": "LIFE", "exp": 10, "mandatory": false },
    { "id": "t8", "time": "04:30 PM", "endTime": "05:00 PM", "title": "YouTube Video Editing", "module": "DIGITAL", "exp": 80, "mandatory": false },
    { "id": "t9", "time": "05:00 PM", "endTime": "05:20 PM", "title": "Chess (Cognitive Warm-up)", "module": "DIGITAL", "exp": 40, "mandatory": false },
    { "id": "t10", "time": "05:20 PM", "endTime": "05:40 PM", "title": "Voice Practice", "module": "VOICE", "exp": 150, "mandatory": true, "constraints": { "requirePhysical": 2 } },
    { "id": "t11", "time": "05:40 PM", "endTime": "06:00 PM", "title": "Typing Practice", "module": "DIGITAL", "exp": 60, "mandatory": true },
    { "id": "t12", "time": "06:00 PM", "endTime": "06:30 PM", "title": "Buffer Time", "module": "LIFE", "exp": 10, "mandatory": false },
    { "id": "t13", "time": "06:30 PM", "endTime": "07:30 PM", "title": "Martial Arts & Meditation", "module": "COMBAT", "exp": 180, "mandatory": true },
    { "id": "t14", "time": "07:30 PM", "endTime": "08:00 PM", "title": "Dinner", "module": "LIFE", "exp": 30, "mandatory": false },
    { "id": "t15", "time": "08:00 PM", "endTime": "09:00 PM", "title": "Break & YT Uploading", "module": "DIGITAL", "exp": 50, "mandatory": false },
    { "id": "t16", "time": "09:00 PM", "endTime": "10:00 PM", "title": "Study (Deep Work)", "module": "ACADEMIC", "exp": 200, "mandatory": true },
    { "id": "t17", "time": "10:00 PM", "endTime": "10:15 PM", "title": "Vessel Maintenance (Skincare)", "module": "SKINCARE", "exp": 30, "mandatory": false },
    { "id": "t18", "time": "10:15 PM", "endTime": "04:30 AM", "title": "Sleep & Recovery", "module": "LIFE", "exp": 0, "mandatory": true }
  ]
}
```

---

## 9. API ROUTES SPECIFICATION

### Task Management
```
GET  /api/tasks/daily          - Fetch today's tasks
POST /api/tasks/create         - Create custom task
PATCH /api/tasks/:id/state     - Update task state
PATCH /api/tasks/:id/partial   - Mark task partially complete (with %)
DELETE /api/tasks/:id          - Remove task
```

### Gym & Strength
```
POST /api/gym/log              - Log exercise (name, sets, reps, weight)
GET  /api/gym/history          - Fetch gym history
GET  /api/gym/pr               - Get personal records
```

### Study & Academics
```
POST /api/study/log            - Log study session (subject, topic, duration)
GET  /api/study/history        - Fetch study sessions
GET  /api/study/mastery        - Get topic mastery progress
```

### Voice Training
```
POST /api/voice/log            - Log voice session
GET  /api/voice/validate       - Validate physical exercise prerequisites
```

### Martial Arts
```
POST /api/martial-arts/log     - Log drilling + sparring
GET  /api/martial-arts/100day  - Get 100-day program progress
```

### Skincare
```
POST /api/skincare/log         - Log routine
GET  /api/skincare/metrics     - Get body weight history
```

### Gamification
```
GET  /api/player/stats         - Get player level, EXP, HP, MP
POST /api/player/reset-day     - Trigger midnight calculation
GET  /api/penalties/list       - Get active penalties
POST /api/penalties/complete   - Mark penalty complete
POST /api/system/assessment    - Get AI motivation message
GET  /api/analytics/daily      - Get daily stats
GET  /api/analytics/weekly     - Get weekly summary
GET  /api/analytics/monthly    - Get monthly summary
```

---

## 10. BACKEND CORE GAME LOOP

### Midnight Daily Reset Logic (Runs at 04:00 AM)

```typescript
// Pseudocode for Core Game Loop

async function midnightReset(userId: UUID) {
  const user = await getUser(userId);
  const todaysTasks = await getDailyTasks(userId, gameDay);
  
  // 1. Calculate daily completion
  const completed = todaysTasks.filter(t => t.state === 'COMPLETED').length;
  const partial = todaysTasks.filter(t => t.state === 'PARTIAL').length;
  const completionRate = ((completed + partial * 0.5) / todaysTasks.length) * 100;
  
  // 2. Calculate total EXP earned
  let totalExpEarned = 0;
  for (let task of todaysTasks) {
    if (task.state === 'COMPLETED') {
      const exp = calculateEXP(task, user.streak, 'COMPLETE');
      totalExpEarned += exp;
      await addExpHistory(userId, exp, task.title);
    } else if (task.state === 'PARTIAL') {
      const exp = calculateEXP(task, user.streak, 'PARTIAL', task.completionPercentage);
      totalExpEarned += exp;
    }
  }
  
  // 3. Apply HP/MP depletion for failures
  let hpLoss = 0, mpLoss = 0;
  for (let task of todaysTasks) {
    if (task.state === 'FAILED') {
      if (task.module === 'STRENGTH' || task.module === 'COMBAT') hpLoss += 20;
      if (task.module === 'ACADEMIC' || task.module === 'DIGITAL') mpLoss += 25;
    }
  }
  
  // 4. Update level
  const newLevel = calculateLevel(user.exp + totalExpEarned);
  const leveledUp = newLevel > user.level;
  
  // 5. Update rank based on 30-day consistency
  const rankChange = await updateRank(userId, completionRate);
  
  // 6. Streak logic
  let newStreak = user.streak;
  if (completionRate >= 80) {
    newStreak += 1;
    if (newStreak % 7 === 0) totalExpEarned += 100; // 7-day bonus
    if (newStreak % 30 === 0) totalExpEarned += 500; // 30-day bonus
  } else if (completionRate < 60) {
    newStreak = 0;
  }
  
  // 7. Check penalty triggers
  if (completionRate < 80) {
    const penalty = generatePenalty(userId, completionRate);
    await assignPenalty(userId, penalty);
  }
  
  // 8. AI Assessment
  const assessment = await getAIAssessment(user, completionRate);
  await createSystemMessage(userId, assessment);
  
  // 9. Save daily log
  await saveDailyResetLog(userId, {
    gameDay: user.gameDay + 1,
    resetDate: new Date(),
    completionPercentage: completionRate,
    expGained: totalExpEarned,
    penaltiesApplied: penalties.length
  });
  
  // 10. Update user
  await updateUser(userId, {
    exp: Math.max(0, user.exp + totalExpEarned),
    level: newLevel,
    hp: Math.max(0, Math.min(100, user.hp - hpLoss)),
    mp: Math.max(0, Math.min(100, user.mp - mpLoss)),
    streak: newStreak,
    rank: newRank,
    gameDay: user.gameDay + 1
  });
  
  // 11. Generate new daily schedule from template
  await generateDailySchedule(userId);
  
  console.log(`[SYSTEM] Day ${user.gameDay + 1} reset complete. EXP: +${totalExpEarned}. Level: ${newLevel}.`);
}
```

---

## 11. FRONTEND COMPONENT TREE

```
App
├── Layout
│   ├── Header (HUD Stats)
│   │   ├── PlayerCard (Name, Age, Class, Height, Weight)
│   │   ├── LevelBar (EXP Progress)
│   │   ├── HPBar
│   │   ├── MPBar
│   │   └── SettingsButton (Edit Stats Modal)
│   │
│   ├── Navigation (Tabs: QUESTS, ANALYTICS)
│   └── SystemNotification (Real-time messages)
│
├── QuestsView (Main Dashboard)
│   ├── LeftColumn
│   │   ├── CurrentObjectiveCard
│   │   │   ├── ActiveTaskDisplay
│   │   │   └── LiveClock
│   │   │
│   │   └── BehavioralOverlordWidget
│   │       ├── EvaluatePerformanceButton
│   │       └── AIAssessmentDisplay
│   │
│   └── RightColumn
│       └── QuestBoardCard
│           ├── SearchBar
│           ├── AddQuestButton
│           └── TaskList
│               └── TaskCard (repeating)
│                   ├── TaskTitle
│                   ├── TimeSlot
│                   ├── ModuleTag
│                   ├── ExpBadge
│                   ├── StateButton
│                   └── ActionButtons (Edit, Delete)
│
├── TaskModal (Task Completion Form)
│   ├── CompletionSlider (%)
│   ├── ModuleSpecificForms
│   │   ├── StrengthForm (Exercise, Sets, Reps, Weight)
│   │   ├── AcademicForm (Subject, Topic)
│   │   ├── VoiceForm (with validation)
│   │   └── MartialArtsForm (Drilling, Sparring)
│   │
│   ├── SubmitButton
│   └── FailButton
│
├── AnalyticsView
│   ├── EXPProgressChart (AreaChart)
│   ├── CompletionRateChart (LineChart)
│   ├── WeightTrendChart (LineChart)
│   ├── GymProgressChart (BarChart)
│   ├── TypingWPMChart (LineChart)
│   └── ConsistencyHeatmap (GitHub-style)
│
├── EditStatsModal
│   ├── WeightInput
│   ├── AgeInput
│   ├── ClassInput
│   └── SaveButton
│
└── CreateTaskModal
    ├── TitleInput
    ├── TimeInputs (Start, End)
    ├── ModuleSelect
    ├── ExpInput
    └── GenerateButton
```

---

## 12. DELIVERABLE CHECKLIST

- [x] System Architecture & Tech Stack
- [x] Complete Database Schema (SQL)
- [x] Gamification Mathematics (EXP, Level, Penalties)
- [x] API Routes Specification
- [x] Backend Game Loop Logic
- [x] Frontend Component Tree
- [x] Penalty System (5 Core Penalties + Escalation)
- [x] Rank System (30-Day Consistency)
- [x] AI Motivation Engine
- [x] Master Schedule Template
- [x] Skincare Module
- [x] Voice Training Constraints
- [x] Martial Arts 100-Day Tracker
- [x] Study Session Analytics
- [x] Gym PR Tracking
- [x] Editable User Stats

---

## 13. IMPLEMENTATION PHASES

### Phase 1 (Week 1): Core Setup
- Next.js project scaffold
- Prisma schema & database setup
- Authentication (NextAuth.js)
- Basic HUD dashboard

### Phase 2 (Week 2): Task Management
- Task CRUD operations
- State machine logic
- Module-specific forms
- Basic EXP calculation

### Phase 3 (Week 3): Gamification
- Level progression
- Rank system
- Penalty assignment
- Streak tracking

### Phase 4 (Week 4): Analytics & AI
- Chart implementations
- Daily reset logic
- AI assessment integration
- System messages

### Phase 5 (Week 5): Polish & Testing
- UI/UX refinement
- Mobile responsiveness
- Bug fixes
- Performance optimization

---

**End of SRS Document**
**Status: Ready for Production Implementation**
