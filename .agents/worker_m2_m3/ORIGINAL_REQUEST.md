## 2026-07-27T13:50:51Z

You are the Milestone 2 & 3 Worker for "HICM Hub".

Your project root is: `c:\Users\DELL\Desktop\SECOND SEM COMPLAINS\hicm-hub`
Your working directory is: `c:\Users\DELL\Desktop\SECOND SEM COMPLAINS\hicm-hub\.agents\worker_m2_m3`

Create your working directory `.agents/worker_m2_m3` and maintain a `progress.md` file with a `Last visited: [timestamp]` liveness header.

Read `c:\Users\DELL\Desktop\SECOND SEM COMPLAINS\hicm-hub\PROJECT.md` for project architecture and specifications.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Tasks for Milestones 2 & 3 (Mobile-First Layout & Core Functional Features):

1. Define TypeScript types in `src/types/index.ts`:
   - `User` (id, name, email, role: 'student'|'staff', matricNo?, staffCode?, department?, level?)
   - `NavTab` ('home' | 'forum' | 'alerts' | 'notes')
   - `ForumMessage` (id, author, role, text, timestamp)
   - `QuizQuestion` (id, question, options, correctAnswer, explanation)
   - `PlagiarismDoc` (id, name, size, uploadDate, status, score?, tokenCost)

2. Create UI & Layout Components:
   - `src/components/Header.tsx`: Sticky top header (`sticky top-0 z-50 bg-navy-900 text-offwhite px-4 py-3 shadow-md flex items-center justify-between`). HICM Hub logo, user profile status/avatar, notifications icon.
   - `src/components/BottomNav.tsx`: Fixed mobile bottom navigation bar (`fixed bottom-0 left-0 right-0 z-50 bg-navy-900 border-t border-navy-800 flex justify-around items-center py-2 md:hidden`). Tabs: Home (`Home`), Forum (`MessageSquare`), Alerts (`Bell`), Notes (`FileText`) using Lucide icons.
   - `src/components/Sidebar.tsx`: Desktop sidebar (`hidden md:flex flex-col w-64 bg-navy-900 text-offwhite min-h-screen border-r border-navy-800 p-4`). Houses brand header, navigation tabs, quick links.
   - `src/components/AccordionNav.tsx`: Compact accordion-style dropdown menus with smooth toggle state for 3 categories:
     1. **Academics** (Courses, Timetables, Exam Schedule, Results, Library)
     2. **Student Services** (Financial Aid, Hostel Booking, Transcripts, Counseling)
     3. **Campus Life** (Clubs & Societies, Events, Sports, Campus Map, Health Services)

3. Create Core Feature Views:
   - `src/components/LoginForm.tsx`: Unified login & registration view.
     - Includes Staff Code toggle logic: input field for staff code. If user enters "STF-123", dynamic Staff Registration mode triggers (showing Staff ID, Department, Staff Role fields). Standard Student login otherwise.
     - Form validation and login state trigger.
   - `src/components/StudentDashboard.tsx`:
     - User information card (Name, ID, Department, Level, Status).
     - Announcement ribbon (prominent ticker/banner with latest updates & emergency notices).
     - Embedded `AccordionNav` component.
     - Action cards to launch Timed Evaluation and Plagiarism Test.
   - `src/components/TimedEvaluation.tsx`:
     - Interactive multiple-choice evaluation view.
     - Countdown timer (e.g. 10-minute timer with visual warning badge when under 2 minutes).
     - Question progression, option selection, auto-submit when timer reaches 0:00.
     - Results card with score, accuracy %, and explanations.
   - `src/components/PlagiarismTest.tsx`:
     - File upload zone (drag & drop or click to upload `.pdf`, `.docx`, `.txt`).
     - Payment status badge (Paid / Token Required).
     - Token counter widget (e.g., "Available Tokens: 5", "Cost per Check: 1 Token").
     - "Buy/Redeem Tokens" action.
     - Simulated analysis progress and detailed plagiarism report (similarity score, matching sources).
   - `src/components/GeneralForum.tsx`:
     - Chronological chat feed with user messages.
     - Prominent warning banner: `"Web links are strictly forbidden."`
     - Strict URL validation on message submit: regex check for `http://`, `https://`, `www.`, `.com`, `.org`, `.net`, `.edu`, `.io`, etc. If detected, block post and show red alert warning: `"Web links are strictly forbidden."`.
   - `src/components/AlertsView.tsx`: Campus notifications, event alerts, exam notices.
   - `src/components/NotesView.tsx`: Student personal & shared course notes management.

4. Connect Everything in `src/App.tsx`:
   - Active tab state (`home`, `forum`, `alerts`, `notes`), active sub-view state (`dashboard`, `evaluation`, `plagiarism`, `login`).
   - Responsive layout structure combining Header, Sidebar (desktop), Main Content view, and BottomNav (mobile).
   - Color palette application: Navy `#0f172a` / `#1e293b`, Off-white `#f8fafc`, Emerald `#10b981`, Red `#ef4444`.

5. Verify Implementation:
   - Ensure all components are written with clean, type-safe React TypeScript.
   - Document verification and write handoff report to `c:\Users\DELL\Desktop\SECOND SEM COMPLAINS\hicm-hub\.agents\worker_m2_m3\handoff.md`.
   - Send completion message to parent.
