-- CreateTable
CREATE TABLE "UserDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserDevice_pkey" PRIMARY KEY ("id")
);

-- Copy existing User.deviceId into UserDevice (one device per user as before)
INSERT INTO "UserDevice" ("id", "userId", "deviceId", "createdAt")
SELECT
    'mig_ud_' || "id",
    "id",
    "deviceId",
    NOW()
FROM "User"
WHERE "deviceId" IS NOT NULL AND TRIM("deviceId") <> '';

CREATE UNIQUE INDEX "UserDevice_deviceId_key" ON "UserDevice"("deviceId");

ALTER TABLE "UserDevice" ADD CONSTRAINT "UserDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "UserDevice_userId_idx" ON "UserDevice"("userId");

-- Drop User.deviceId
DROP INDEX IF EXISTS "User_deviceId_idx";
DROP INDEX IF EXISTS "User_deviceId_key";
ALTER TABLE "User" DROP COLUMN "deviceId";
