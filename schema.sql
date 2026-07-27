-- Users Table
CREATE TABLE IF NOT EXISTS Users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'staff', 'admin')),
    matricNo TEXT, -- Optional for staff/admin
    department TEXT,
    level TEXT, -- e.g., 'Level 100', 'Level 200'
    status TEXT DEFAULT 'Active',
    passwordHash TEXT NOT NULL,
    sessionToken TEXT,
    plagiarismTokens INTEGER DEFAULT 5,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Staff Codes (for registering new staff)
CREATE TABLE IF NOT EXISTS StaffCodes (
    code TEXT PRIMARY KEY,
    createdBy TEXT NOT NULL, -- Admin ID who created this
    usedBy TEXT, -- User ID who used this (null if unused)
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
    expiresAt DATETIME NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES Users(id),
    FOREIGN KEY (usedBy) REFERENCES Users(id)
);

-- Lecture Notes
CREATE TABLE IF NOT EXISTS LectureNotes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    courseCode TEXT NOT NULL,
    lecturerId TEXT NOT NULL,
    fileUrl TEXT NOT NULL,
    fileSize INTEGER,
    downloads INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lecturerId) REFERENCES Users(id)
);

-- Evaluations
CREATE TABLE IF NOT EXISTS Evaluations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    courseCode TEXT NOT NULL,
    lecturerId TEXT NOT NULL,
    durationMinutes INTEGER NOT NULL,
    totalMarks INTEGER NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lecturerId) REFERENCES Users(id)
);

-- Questions (for Evaluations)
CREATE TABLE IF NOT EXISTS Questions (
    id TEXT PRIMARY KEY,
    evaluationId TEXT NOT NULL,
    questionText TEXT NOT NULL,
    optionsJSON TEXT NOT NULL, -- JSON array of options
    correctOptionIndex INTEGER NOT NULL,
    marks INTEGER DEFAULT 1,
    FOREIGN KEY (evaluationId) REFERENCES Evaluations(id) ON DELETE CASCADE
);

-- Evaluation Attempts (Student taking an evaluation)
CREATE TABLE IF NOT EXISTS EvaluationAttempts (
    id TEXT PRIMARY KEY,
    evaluationId TEXT NOT NULL,
    studentId TEXT NOT NULL,
    score INTEGER,
    startTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    endTime DATETIME,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'auto_submitted')),
    FOREIGN KEY (evaluationId) REFERENCES Evaluations(id),
    FOREIGN KEY (studentId) REFERENCES Users(id)
);

-- General Forum
CREATE TABLE IF NOT EXISTS ForumMessages (
    id TEXT PRIMARY KEY,
    authorId TEXT NOT NULL,
    messageText TEXT NOT NULL,
    isFlagged BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (authorId) REFERENCES Users(id)
);

-- Complaints Desk
CREATE TABLE IF NOT EXISTS Complaints (
    id TEXT PRIMARY KEY,
    studentId TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
    adminResponse TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES Users(id)
);

-- Announcements
CREATE TABLE IF NOT EXISTS Announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    authorId TEXT NOT NULL,
    targetAudience TEXT DEFAULT 'all' CHECK (targetAudience IN ('all', 'students', 'staff')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (authorId) REFERENCES Users(id)
);

-- Lost and Found
CREATE TABLE IF NOT EXISTS LostAndFound (
    id TEXT PRIMARY KEY,
    reporterId TEXT NOT NULL,
    type TEXT CHECK (type IN ('lost', 'found')),
    itemName TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT,
    contactInfo TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'closed')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporterId) REFERENCES Users(id)
);

-- Elections
CREATE TABLE IF NOT EXISTS Elections (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    startDate DATETIME NOT NULL,
    endDate DATETIME NOT NULL,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'closed')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Election Candidates
CREATE TABLE IF NOT EXISTS Candidates (
    id TEXT PRIMARY KEY,
    electionId TEXT NOT NULL,
    studentId TEXT NOT NULL,
    position TEXT NOT NULL,
    manifesto TEXT,
    FOREIGN KEY (electionId) REFERENCES Elections(id) ON DELETE CASCADE,
    FOREIGN KEY (studentId) REFERENCES Users(id)
);

-- Votes
CREATE TABLE IF NOT EXISTS Votes (
    id TEXT PRIMARY KEY,
    electionId TEXT NOT NULL,
    candidateId TEXT NOT NULL,
    voterId TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(electionId, voterId),
    FOREIGN KEY (electionId) REFERENCES Elections(id) ON DELETE CASCADE,
    FOREIGN KEY (candidateId) REFERENCES Candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (voterId) REFERENCES Users(id)
);

-- Plagiarism Tests
CREATE TABLE IF NOT EXISTS PlagiarismTests (
    id TEXT PRIMARY KEY,
    studentId TEXT NOT NULL,
    fileName TEXT NOT NULL,
    score INTEGER NOT NULL,
    matchingSourcesJSON TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES Users(id)
);

-- Token Requests
CREATE TABLE IF NOT EXISTS TokenRequests (
    id TEXT PRIMARY KEY,
    studentId TEXT NOT NULL,
    amount INTEGER NOT NULL,
    amountPaid REAL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES Users(id)
);
