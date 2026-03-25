-- Allow multiple users to share the same deviceId; enforce one row per (user, device).

DROP INDEX IF EXISTS "UserDevice_deviceId_key";

CREATE UNIQUE INDEX "UserDevice_userId_deviceId_key" ON "UserDevice"("userId", "deviceId");

CREATE INDEX IF NOT EXISTS "UserDevice_deviceId_idx" ON "UserDevice"("deviceId");
