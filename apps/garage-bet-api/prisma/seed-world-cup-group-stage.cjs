require('dotenv/config');
const { PrismaPg } = require('@prisma/adapter-pg');
const { MatchStage, MatchStatus, PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');

const rawConnectionString =
  process.env.PRISMA_DATABASE_URL ?? process.env.DATABASE_URL;
if (!rawConnectionString) {
  throw new Error('DATABASE_URL is not set');
}

let connectionString = rawConnectionString;
try {
  const parsedUrl = new URL(rawConnectionString);
  parsedUrl.searchParams.delete('sslmode');
  parsedUrl.searchParams.delete('ssl');
  connectionString = parsedUrl.toString();
} catch {
  // Keep original value if URL parsing fails.
}

const shouldUseSsl =
  process.env.NODE_ENV === 'production' ||
  /sslmode=require/i.test(rawConnectionString) ||
  process.env.PGSSLMODE === 'require';

const adapter = new PrismaPg(
  new Pool({
    connectionString,
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
  }),
);
const prisma = new PrismaClient({ adapter });

const fixtures = [
  // Group A
  {
    group: 'A',
    date: '2026-03-23',
    time: '19:00',
    home: 'Qatar',
    away: 'Ecuador',
    homeScore: 0,
    awayScore: 2,
  },
  {
    group: 'A',
    date: '2026-03-24',
    time: '19:00',
    home: 'Senegal',
    away: 'Netherlands',
    homeScore: 0,
    awayScore: 2,
  },
  {
    group: 'A',
    date: '2026-03-28',
    time: '16:00',
    home: 'Qatar',
    away: 'Senegal',
    homeScore: 1,
    awayScore: 3,
  },
  {
    group: 'A',
    date: '2026-03-28',
    time: '19:00',
    home: 'Netherlands',
    away: 'Ecuador',
    homeScore: 1,
    awayScore: 1,
  },
  {
    group: 'A',
    date: '2026-04-01',
    time: '18:00',
    home: 'Netherlands',
    away: 'Qatar',
    homeScore: 2,
    awayScore: 0,
  },
  {
    group: 'A',
    date: '2026-04-01',
    time: '18:00',
    home: 'Ecuador',
    away: 'Senegal',
    homeScore: 1,
    awayScore: 2,
  },

  // Group B
  {
    group: 'B',
    date: '2026-03-24',
    time: '16:00',
    home: 'England',
    away: 'Iran',
    homeScore: 6,
    awayScore: 2,
  },
  {
    group: 'B',
    date: '2026-03-24',
    time: '22:00',
    home: 'USA',
    away: 'Wales',
    homeScore: 1,
    awayScore: 1,
  },
  {
    group: 'B',
    date: '2026-03-28',
    time: '13:00',
    home: 'Wales',
    away: 'Iran',
    homeScore: 0,
    awayScore: 2,
  },
  {
    group: 'B',
    date: '2026-03-28',
    time: '22:00',
    home: 'England',
    away: 'USA',
    homeScore: 0,
    awayScore: 0,
  },
  {
    group: 'B',
    date: '2026-04-01',
    time: '22:00',
    home: 'Wales',
    away: 'England',
    homeScore: 0,
    awayScore: 3,
  },
  {
    group: 'B',
    date: '2026-04-01',
    time: '22:00',
    home: 'Iran',
    away: 'USA',
    homeScore: 0,
    awayScore: 1,
  },

  // Group C
  {
    group: 'C',
    date: '2026-03-25',
    time: '13:00',
    home: 'Argentina',
    away: 'Saudi Arabia',
    homeScore: 1,
    awayScore: 2,
  },
  {
    group: 'C',
    date: '2026-03-25',
    time: '19:00',
    home: 'Mexico',
    away: 'Poland',
    homeScore: 0,
    awayScore: 0,
  },
  {
    group: 'C',
    date: '2026-03-29',
    time: '16:00',
    home: 'Poland',
    away: 'Saudi Arabia',
    homeScore: 2,
    awayScore: 0,
  },
  {
    group: 'C',
    date: '2026-03-29',
    time: '22:00',
    home: 'Argentina',
    away: 'Mexico',
    homeScore: 2,
    awayScore: 0,
  },
  {
    group: 'C',
    date: '2026-04-02',
    time: '22:00',
    home: 'Poland',
    away: 'Argentina',
    homeScore: 0,
    awayScore: 2,
  },
  {
    group: 'C',
    date: '2026-04-02',
    time: '22:00',
    home: 'Saudi Arabia',
    away: 'Mexico',
    homeScore: 1,
    awayScore: 2,
  },

  // Group D
  {
    group: 'D',
    date: '2026-03-25',
    time: '16:00',
    home: 'Denmark',
    away: 'Tunisia',
    homeScore: 0,
    awayScore: 0,
  },
  {
    group: 'D',
    date: '2026-03-25',
    time: '22:00',
    home: 'France',
    away: 'Australia',
    homeScore: 4,
    awayScore: 1,
  },
  {
    group: 'D',
    date: '2026-03-29',
    time: '13:00',
    home: 'Tunisia',
    away: 'Australia',
    homeScore: 0,
    awayScore: 1,
  },
  {
    group: 'D',
    date: '2026-03-29',
    time: '19:00',
    home: 'France',
    away: 'Denmark',
    homeScore: 2,
    awayScore: 1,
  },
  {
    group: 'D',
    date: '2026-04-02',
    time: '18:00',
    home: 'Australia',
    away: 'Denmark',
    homeScore: 1,
    awayScore: 0,
  },
  {
    group: 'D',
    date: '2026-04-02',
    time: '18:00',
    home: 'Tunisia',
    away: 'France',
    homeScore: 1,
    awayScore: 0,
  },

  // Group E
  {
    group: 'E',
    date: '2026-03-26',
    time: '16:00',
    home: 'Germany',
    away: 'Japan',
    homeScore: 1,
    awayScore: 2,
  },
  {
    group: 'E',
    date: '2026-03-26',
    time: '19:00',
    home: 'Spain',
    away: 'Costa Rica',
    homeScore: 7,
    awayScore: 0,
  },
  {
    group: 'E',
    date: '2026-03-30',
    time: '13:00',
    home: 'Japan',
    away: 'Costa Rica',
    homeScore: 0,
    awayScore: 1,
  },
  {
    group: 'E',
    date: '2026-03-30',
    time: '22:00',
    home: 'Spain',
    away: 'Germany',
    homeScore: 1,
    awayScore: 1,
  },
  {
    group: 'E',
    date: '2026-04-03',
    time: '22:00',
    home: 'Japan',
    away: 'Spain',
    homeScore: 2,
    awayScore: 1,
  },
  {
    group: 'E',
    date: '2026-04-03',
    time: '22:00',
    home: 'Costa Rica',
    away: 'Germany',
    homeScore: 2,
    awayScore: 4,
  },

  // Group F
  {
    group: 'F',
    date: '2026-03-26',
    time: '13:00',
    home: 'Morocco',
    away: 'Croatia',
    homeScore: 0,
    awayScore: 0,
  },
  {
    group: 'F',
    date: '2026-03-26',
    time: '22:00',
    home: 'Belgium',
    away: 'Canada',
    homeScore: 1,
    awayScore: 0,
  },
  {
    group: 'F',
    date: '2026-03-30',
    time: '16:00',
    home: 'Belgium',
    away: 'Morocco',
    homeScore: 0,
    awayScore: 2,
  },
  {
    group: 'F',
    date: '2026-03-30',
    time: '19:00',
    home: 'Croatia',
    away: 'Canada',
    homeScore: 4,
    awayScore: 1,
  },
  {
    group: 'F',
    date: '2026-04-03',
    time: '18:00',
    home: 'Croatia',
    away: 'Belgium',
    homeScore: 0,
    awayScore: 0,
  },
  {
    group: 'F',
    date: '2026-04-03',
    time: '18:00',
    home: 'Canada',
    away: 'Morocco',
    homeScore: 1,
    awayScore: 2,
  },

  // Group G
  {
    group: 'G',
    date: '2026-03-27',
    time: '13:00',
    home: 'Switzerland',
    away: 'Cameroon',
    homeScore: 1,
    awayScore: 0,
  },
  {
    group: 'G',
    date: '2026-03-27',
    time: '22:00',
    home: 'Brazil',
    away: 'Serbia',
    homeScore: 2,
    awayScore: 0,
  },
  {
    group: 'G',
    date: '2026-03-31',
    time: '13:00',
    home: 'Cameroon',
    away: 'Serbia',
    homeScore: 3,
    awayScore: 3,
  },
  {
    group: 'G',
    date: '2026-03-31',
    time: '19:00',
    home: 'Brazil',
    away: 'Switzerland',
    homeScore: 1,
    awayScore: 0,
  },
  {
    group: 'G',
    date: '2026-04-04',
    time: '22:00',
    home: 'Serbia',
    away: 'Switzerland',
    homeScore: 2,
    awayScore: 3,
  },
  {
    group: 'G',
    date: '2026-04-04',
    time: '22:00',
    home: 'Cameroon',
    away: 'Brazil',
    homeScore: 1,
    awayScore: 0,
  },

  // Group H
  {
    group: 'H',
    date: '2026-03-27',
    time: '16:00',
    home: 'Uruguay',
    away: 'South Korea',
    homeScore: 0,
    awayScore: 0,
  },
  {
    group: 'H',
    date: '2026-03-27',
    time: '19:00',
    home: 'Portugal',
    away: 'Ghana',
    homeScore: 3,
    awayScore: 2,
  },
  {
    group: 'H',
    date: '2026-03-31',
    time: '16:00',
    home: 'South Korea',
    away: 'Ghana',
    homeScore: 2,
    awayScore: 3,
  },
  {
    group: 'H',
    date: '2026-03-31',
    time: '22:00',
    home: 'Portugal',
    away: 'Uruguay',
    homeScore: 2,
    awayScore: 0,
  },
  {
    group: 'H',
    date: '2026-04-04',
    time: '18:00',
    home: 'South Korea',
    away: 'Portugal',
    homeScore: 2,
    awayScore: 1,
  },
  {
    group: 'H',
    date: '2026-04-04',
    time: '18:00',
    home: 'Ghana',
    away: 'Uruguay',
    homeScore: 0,
    awayScore: 2,
  },
];

function qatarDateToUtc(date, time) {
  return new Date(`${date}T${time}:00+03:00`);
}

async function main() {
  const competition = await prisma.competition.upsert({
    where: { slug: 'fifa-world-cup' },
    update: { name: 'FIFA World Cup' },
    create: { slug: 'fifa-world-cup', name: 'FIFA World Cup' },
  });

  const season = await prisma.season.upsert({
    where: {
      competitionId_name: {
        competitionId: competition.id,
        name: '2026 Group Stage',
      },
    },
    update: { year: 2026 },
    create: {
      competitionId: competition.id,
      name: '2026 Group Stage',
      year: 2026,
    },
  });

  const teamNames = Array.from(
    new Set(fixtures.flatMap((f) => [f.home, f.away])),
  );

  for (const teamName of teamNames) {
    await prisma.team.upsert({
      where: { name: teamName },
      update: {},
      create: { name: teamName },
    });
  }

  const teams = await prisma.team.findMany({
    where: { name: { in: teamNames } },
  });
  const teamByName = new Map(teams.map((t) => [t.name, t]));

  await prisma.$transaction([
    prisma.bet.deleteMany({
      where: { match: { seasonId: season.id } },
    }),
    prisma.match.deleteMany({
      where: { seasonId: season.id },
    }),
    prisma.seasonTeam.deleteMany({
      where: { seasonId: season.id },
    }),
  ]);

  await prisma.seasonTeam.createMany({
    data: teamNames.map((name) => ({
      seasonId: season.id,
      teamId: teamByName.get(name).id,
    })),
    skipDuplicates: true,
  });

  const now = new Date();
  await prisma.match.createMany({
    data: fixtures.map((fixture) => {
      const kickoffAt = qatarDateToUtc(fixture.date, fixture.time);
      const isFinished = kickoffAt <= now;
      return {
        seasonId: season.id,
        kickoffAt,
        status: isFinished ? MatchStatus.FINISHED : MatchStatus.SCHEDULED,
        stage: MatchStage.GROUP,
        groupName: fixture.group,
        homeTeamId: teamByName.get(fixture.home).id,
        awayTeamId: teamByName.get(fixture.away).id,
        homeScore: isFinished ? fixture.homeScore : null,
        awayScore: isFinished ? fixture.awayScore : null,
      };
    }),
  });

  console.log(
    `Seeded ${fixtures.length} group-stage matches for FIFA World Cup 2026 Group Stage.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
