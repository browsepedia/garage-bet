-- Email confirmation: verified timestamp + one-time token (device-only users get emailVerifiedAt at signup in app code).

ALTER TABLE "User" ADD COLUMN "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN "emailVerificationToken" TEXT,
ADD COLUMN "emailVerificationExpiresAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "User_emailVerificationToken_key" ON "User"("emailVerificationToken");

-- Grandfather existing rows as verified so current users are not blocked.
UPDATE "User" SET "emailVerifiedAt" = "createdAt" WHERE "emailVerifiedAt" IS NULL;
