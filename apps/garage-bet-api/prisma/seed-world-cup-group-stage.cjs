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
    date: '2026-03-26',
    time: '19:00',
    home: 'Qatar',
    away: 'Ecuador',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'A',
    date: '2026-03-27',
    time: '19:00',
    home: 'Senegal',
    away: 'Netherlands',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'A',
    date: '2026-03-31',
    time: '16:00',
    home: 'Qatar',
    away: 'Senegal',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'A',
    date: '2026-03-31',
    time: '19:00',
    home: 'Netherlands',
    away: 'Ecuador',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'A',
    date: '2026-04-04',
    time: '18:00',
    home: 'Netherlands',
    away: 'Qatar',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'A',
    date: '2026-04-04',
    time: '18:00',
    home: 'Ecuador',
    away: 'Senegal',
    homeScore: null,
    awayScore: null,
  },

  // Group B
  {
    group: 'B',
    date: '2026-03-27',
    time: '16:00',
    home: 'England',
    away: 'Iran',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'B',
    date: '2026-03-27',
    time: '22:00',
    home: 'USA',
    away: 'Wales',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'B',
    date: '2026-03-31',
    time: '13:00',
    home: 'Wales',
    away: 'Iran',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'B',
    date: '2026-03-31',
    time: '22:00',
    home: 'England',
    away: 'USA',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'B',
    date: '2026-04-04',
    time: '22:00',
    home: 'Wales',
    away: 'England',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'B',
    date: '2026-04-04',
    time: '22:00',
    home: 'Iran',
    away: 'USA',
    homeScore: null,
    awayScore: null,
  },

  // Group C
  {
    group: 'C',
    date: '2026-03-28',
    time: '13:00',
    home: 'Argentina',
    away: 'Saudi Arabia',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'C',
    date: '2026-03-28',
    time: '19:00',
    home: 'Mexico',
    away: 'Poland',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'C',
    date: '2026-04-01',
    time: '16:00',
    home: 'Poland',
    away: 'Saudi Arabia',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'C',
    date: '2026-04-01',
    time: '22:00',
    home: 'Argentina',
    away: 'Mexico',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'C',
    date: '2026-04-05',
    time: '22:00',
    home: 'Poland',
    away: 'Argentina',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'C',
    date: '2026-04-05',
    time: '22:00',
    home: 'Saudi Arabia',
    away: 'Mexico',
    homeScore: null,
    awayScore: null,
  },

  // Group D
  {
    group: 'D',
    date: '2026-03-28',
    time: '16:00',
    home: 'Denmark',
    away: 'Tunisia',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'D',
    date: '2026-03-28',
    time: '22:00',
    home: 'France',
    away: 'Australia',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'D',
    date: '2026-04-01',
    time: '13:00',
    home: 'Tunisia',
    away: 'Australia',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'D',
    date: '2026-04-01',
    time: '19:00',
    home: 'France',
    away: 'Denmark',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'D',
    date: '2026-04-05',
    time: '18:00',
    home: 'Australia',
    away: 'Denmark',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'D',
    date: '2026-04-05',
    time: '18:00',
    home: 'Tunisia',
    away: 'France',
    homeScore: null,
    awayScore: null,
  },

  // Group E
  {
    group: 'E',
    date: '2026-03-29',
    time: '16:00',
    home: 'Germany',
    away: 'Japan',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'E',
    date: '2026-03-29',
    time: '19:00',
    home: 'Spain',
    away: 'Costa Rica',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'E',
    date: '2026-04-02',
    time: '13:00',
    home: 'Japan',
    away: 'Costa Rica',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'E',
    date: '2026-04-02',
    time: '22:00',
    home: 'Spain',
    away: 'Germany',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'E',
    date: '2026-04-06',
    time: '22:00',
    home: 'Japan',
    away: 'Spain',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'E',
    date: '2026-04-06',
    time: '22:00',
    home: 'Costa Rica',
    away: 'Germany',
    homeScore: null,
    awayScore: null,
  },

  // Group F
  {
    group: 'F',
    date: '2026-03-29',
    time: '13:00',
    home: 'Morocco',
    away: 'Croatia',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'F',
    date: '2026-03-29',
    time: '22:00',
    home: 'Belgium',
    away: 'Canada',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'F',
    date: '2026-04-02',
    time: '16:00',
    home: 'Belgium',
    away: 'Morocco',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'F',
    date: '2026-04-02',
    time: '19:00',
    home: 'Croatia',
    away: 'Canada',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'F',
    date: '2026-04-06',
    time: '18:00',
    home: 'Croatia',
    away: 'Belgium',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'F',
    date: '2026-04-06',
    time: '18:00',
    home: 'Canada',
    away: 'Morocco',
    homeScore: null,
    awayScore: null,
  },

  // Group G
  {
    group: 'G',
    date: '2026-03-30',
    time: '13:00',
    home: 'Switzerland',
    away: 'Cameroon',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'G',
    date: '2026-03-30',
    time: '22:00',
    home: 'Brazil',
    away: 'Serbia',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'G',
    date: '2026-04-03',
    time: '13:00',
    home: 'Cameroon',
    away: 'Serbia',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'G',
    date: '2026-04-03',
    time: '19:00',
    home: 'Brazil',
    away: 'Switzerland',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'G',
    date: '2026-04-07',
    time: '22:00',
    home: 'Serbia',
    away: 'Switzerland',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'G',
    date: '2026-04-07',
    time: '22:00',
    home: 'Cameroon',
    away: 'Brazil',
    homeScore: null,
    awayScore: null,
  },

  // Group H
  {
    group: 'H',
    date: '2026-03-30',
    time: '16:00',
    home: 'Uruguay',
    away: 'South Korea',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'H',
    date: '2026-03-30',
    time: '19:00',
    home: 'Portugal',
    away: 'Ghana',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'H',
    date: '2026-04-03',
    time: '16:00',
    home: 'South Korea',
    away: 'Ghana',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'H',
    date: '2026-04-03',
    time: '22:00',
    home: 'Portugal',
    away: 'Uruguay',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'H',
    date: '2026-04-07',
    time: '18:00',
    home: 'South Korea',
    away: 'Portugal',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'H',
    date: '2026-04-07',
    time: '18:00',
    home: 'Ghana',
    away: 'Uruguay',
    homeScore: null,
    awayScore: null,
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
      const hasResult =
        fixture.homeScore != null && fixture.awayScore != null;
      const isFinished = hasResult && kickoffAt <= now;
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
