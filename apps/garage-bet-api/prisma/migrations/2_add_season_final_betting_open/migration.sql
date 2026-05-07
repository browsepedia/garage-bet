-- Season.finalBettingOpen exists in 0_init; older databases may lack it if they drifted.
ALTER TABLE "Season" ADD COLUMN IF NOT EXISTS "finalBettingOpen" BOOLEAN NOT NULL DEFAULT true;
