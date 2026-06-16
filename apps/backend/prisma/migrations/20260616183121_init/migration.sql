-- CreateTable
CREATE TABLE "credentials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cookie" TEXT NOT NULL,
    "csrf" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "linkedinId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "companyInfo" TEXT NOT NULL,
    "companyLogo" TEXT,
    "description" TEXT,
    "location" TEXT,
    "url" TEXT,
    "employmentStatus" TEXT,
    "companyName" TEXT,
    "source" TEXT NOT NULL DEFAULT 'api',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "resumes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT,
    "text" TEXT NOT NULL,
    "filename" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "answers" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "jobs_linkedinId_key" ON "jobs"("linkedinId");

-- CreateIndex
CREATE INDEX "jobs_linkedinId_idx" ON "jobs"("linkedinId");

-- CreateIndex
CREATE INDEX "jobs_title_idx" ON "jobs"("title");

-- CreateIndex
CREATE UNIQUE INDEX "resumes_profileId_key" ON "resumes"("profileId");

-- CreateIndex
CREATE INDEX "applications_jobId_idx" ON "applications"("jobId");
