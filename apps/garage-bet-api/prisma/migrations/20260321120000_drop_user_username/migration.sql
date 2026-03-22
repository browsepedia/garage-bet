-- Drop unused username column (identity is email and/or device).
DROP INDEX IF EXISTS "User_username_key";
DROP INDEX IF EXISTS "User_username_idx";
ALTER TABLE "User" DROP COLUMN IF EXISTS "username";
