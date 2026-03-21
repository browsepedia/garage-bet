-- AlterTable
ALTER TABLE "Season" ADD COLUMN "finalHomeTeamId" TEXT,
ADD COLUMN "finalAwayTeamId" TEXT,
ADD COLUMN "finalHomeScore" INTEGER,
ADD COLUMN "finalAwayScore" INTEGER,
ADD COLUMN "finalBettingOpen" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "FinalPlayerBet" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "predictedHomeTeamId" TEXT NOT NULL,
    "predictedAwayTeamId" TEXT NOT NULL,
    "predictedHomeScore" INTEGER NOT NULL,
    "predictedAwayScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinalPlayerBet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FinalPlayerBet_seasonId_userId_key" ON "FinalPlayerBet"("seasonId", "userId");

-- CreateIndex
CREATE INDEX "FinalPlayerBet_seasonId_idx" ON "FinalPlayerBet"("seasonId");

-- CreateIndex
CREATE INDEX "FinalPlayerBet_userId_idx" ON "FinalPlayerBet"("userId");

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_finalHomeTeamId_fkey" FOREIGN KEY ("finalHomeTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_finalAwayTeamId_fkey" FOREIGN KEY ("finalAwayTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalPlayerBet" ADD CONSTRAINT "FinalPlayerBet_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalPlayerBet" ADD CONSTRAINT "FinalPlayerBet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
