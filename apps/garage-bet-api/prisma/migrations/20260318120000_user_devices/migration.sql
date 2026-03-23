-- CreateTable
CREATE TABLE "UserDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserDevice_pkey" PRIMARY KEY ("id")
);

-- Initial migration may not include User.deviceId; fresh empty DBs need it for the backfill below.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'User'
          AND column_name = 'deviceId'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "deviceId" TEXT;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "User_deviceId_key" ON "User"("deviceId");
CREATE INDEX IF NOT EXISTS "User_deviceId_idx" ON "User"("deviceId");

-- Copy existing User.deviceId into UserDevice (one device per user as before).
-- Qualify columns with u.*: in INSERT...SELECT, bare "deviceId" binds to the INSERT target (UserDevice), not User.
INSERT INTO "UserDevice" ("id", "userId", "deviceId", "createdAt")
SELECT
    'mig_ud_' || u."id",
    u."id",
    u."deviceId",
    NOW()
FROM "User" AS u
WHERE u."deviceId" IS NOT NULL AND TRIM(u."deviceId") <> '';

CREATE UNIQUE INDEX "UserDevice_deviceId_key" ON "UserDevice"("deviceId");

ALTER TABLE "UserDevice" ADD CONSTRAINT "UserDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "UserDevice_userId_idx" ON "UserDevice"("userId");

-- Drop User.deviceId
DROP INDEX IF EXISTS "User_deviceId_idx";
DROP INDEX IF EXISTS "User_deviceId_key";
ALTER TABLE "User" DROP COLUMN IF EXISTS "deviceId";
