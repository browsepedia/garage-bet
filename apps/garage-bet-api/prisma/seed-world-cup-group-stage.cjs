/**
 * 2026 FIFA World Cup — group stage (12 groups × 6 matches = 72).
 * Pairings and venues from the post-draw schedule (Wikipedia / FIFA).
 * `date` + `time` are local kickoff wall time; `offset` is the zone offset in June 2026
 * (e.g. -04:00 EDT, -05:00 CDT, -06:00 Mexico & MDT, -07:00 PDT).
 * `venue` is stadium and city (FIFA / Wikipedia schedule).
 */
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
    date: '2026-06-11',
    time: '18:00',
    offset: '-06:00',
    home: 'Mexico',
    away: 'South Africa',
    venue: 'Estadio Azteca, Mexico City',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'A',
    date: '2026-06-11',
    time: '21:00',
    offset: '-06:00',
    home: 'South Korea',
    away: 'Czech Republic',
    venue: 'Estadio Akron, Zapopan',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'A',
    date: '2026-06-18',
    time: '15:00',
    offset: '-04:00',
    home: 'Czech Republic',
    away: 'South Africa',
    venue: 'Mercedes-Benz Stadium, Atlanta',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'A',
    date: '2026-06-18',
    time: '21:00',
    offset: '-06:00',
    home: 'Mexico',
    away: 'South Korea',
    venue: 'Estadio Akron, Zapopan',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'A',
    date: '2026-06-24',
    time: '20:00',
    offset: '-06:00',
    home: 'Czech Republic',
    away: 'Mexico',
    venue: 'Estadio Azteca, Mexico City',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'A',
    date: '2026-06-24',
    time: '20:00',
    offset: '-06:00',
    home: 'South Africa',
    away: 'South Korea',
    venue: 'Estadio BBVA, Guadalupe',
    homeScore: null,
    awayScore: null,
  },

  // Group B
  {
    group: 'B',
    date: '2026-06-12',
    time: '15:00',
    offset: '-04:00',
    home: 'Canada',
    away: 'Bosnia and Herzegovina',
    venue: 'BMO Field, Toronto',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'B',
    date: '2026-06-13',
    time: '15:00',
    offset: '-07:00',
    home: 'Qatar',
    away: 'Switzerland',
    venue: "Levi's Stadium, Santa Clara",
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'B',
    date: '2026-06-18',
    time: '16:00',
    offset: '-07:00',
    home: 'Switzerland',
    away: 'Bosnia and Herzegovina',
    venue: 'SoFi Stadium, Inglewood',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'B',
    date: '2026-06-18',
    time: '13:00',
    offset: '-07:00',
    home: 'Canada',
    away: 'Qatar',
    venue: 'BC Place, Vancouver',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'B',
    date: '2026-06-24',
    time: '13:00',
    offset: '-07:00',
    home: 'Switzerland',
    away: 'Canada',
    venue: 'BC Place, Vancouver',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'B',
    date: '2026-06-24',
    time: '16:00',
    offset: '-07:00',
    home: 'Bosnia and Herzegovina',
    away: 'Qatar',
    venue: 'Lumen Field, Seattle',
    homeScore: null,
    awayScore: null,
  },

  // Group C
  {
    group: 'C',
    date: '2026-06-13',
    time: '18:00',
    offset: '-04:00',
    home: 'Brazil',
    away: 'Morocco',
    venue: 'MetLife Stadium, East Rutherford',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'C',
    date: '2026-06-13',
    time: '21:00',
    offset: '-04:00',
    home: 'Haiti',
    away: 'Scotland',
    venue: 'Gillette Stadium, Foxborough',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'C',
    date: '2026-06-19',
    time: '18:00',
    offset: '-04:00',
    home: 'Scotland',
    away: 'Morocco',
    venue: 'Gillette Stadium, Foxborough',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'C',
    date: '2026-06-19',
    time: '20:30',
    offset: '-04:00',
    home: 'Brazil',
    away: 'Haiti',
    venue: 'Lincoln Financial Field, Philadelphia',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'C',
    date: '2026-06-24',
    time: '18:00',
    offset: '-04:00',
    home: 'Scotland',
    away: 'Brazil',
    venue: 'Hard Rock Stadium, Miami Gardens',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'C',
    date: '2026-06-24',
    time: '18:00',
    offset: '-04:00',
    home: 'Morocco',
    away: 'Haiti',
    venue: 'Mercedes-Benz Stadium, Atlanta',
    homeScore: null,
    awayScore: null,
  },

  // Group D
  {
    group: 'D',
    date: '2026-06-12',
    time: '18:00',
    offset: '-07:00',
    home: 'United States',
    away: 'Paraguay',
    venue: 'SoFi Stadium, Inglewood',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'D',
    date: '2026-06-13',
    time: '21:00',
    offset: '-07:00',
    home: 'Australia',
    away: 'Turkey',
    venue: 'BC Place, Vancouver',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'D',
    date: '2026-06-19',
    time: '12:00',
    offset: '-07:00',
    home: 'United States',
    away: 'Australia',
    venue: 'Lumen Field, Seattle',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'D',
    date: '2026-06-19',
    time: '20:00',
    offset: '-07:00',
    home: 'Turkey',
    away: 'Paraguay',
    venue: "Levi's Stadium, Santa Clara",
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'D',
    date: '2026-06-25',
    time: '19:00',
    offset: '-07:00',
    home: 'Turkey',
    away: 'United States',
    venue: 'SoFi Stadium, Inglewood',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'D',
    date: '2026-06-25',
    time: '19:00',
    offset: '-07:00',
    home: 'Paraguay',
    away: 'Australia',
    venue: "Levi's Stadium, Santa Clara",
    homeScore: null,
    awayScore: null,
  },

  // Group E
  {
    group: 'E',
    date: '2026-06-14',
    time: '15:00',
    offset: '-05:00',
    home: 'Germany',
    away: 'Curaçao',
    venue: 'NRG Stadium, Houston',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'E',
    date: '2026-06-14',
    time: '18:00',
    offset: '-04:00',
    home: 'Ivory Coast',
    away: 'Ecuador',
    venue: 'Lincoln Financial Field, Philadelphia',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'E',
    date: '2026-06-20',
    time: '15:00',
    offset: '-04:00',
    home: 'Germany',
    away: 'Ivory Coast',
    venue: 'BMO Field, Toronto',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'E',
    date: '2026-06-20',
    time: '19:00',
    offset: '-05:00',
    home: 'Ecuador',
    away: 'Curaçao',
    venue: 'Arrowhead Stadium, Kansas City',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'E',
    date: '2026-06-25',
    time: '15:00',
    offset: '-04:00',
    home: 'Curaçao',
    away: 'Ivory Coast',
    venue: 'Lincoln Financial Field, Philadelphia',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'E',
    date: '2026-06-25',
    time: '21:00',
    offset: '-04:00',
    home: 'Ecuador',
    away: 'Germany',
    venue: 'MetLife Stadium, East Rutherford',
    homeScore: null,
    awayScore: null,
  },

  // Group F
  {
    group: 'F',
    date: '2026-06-14',
    time: '16:00',
    offset: '-05:00',
    home: 'Netherlands',
    away: 'Japan',
    venue: 'AT&T Stadium, Arlington',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'F',
    date: '2026-06-14',
    time: '19:00',
    offset: '-06:00',
    home: 'Sweden',
    away: 'Tunisia',
    venue: 'Estadio BBVA, Guadalupe',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'F',
    date: '2026-06-20',
    time: '15:00',
    offset: '-05:00',
    home: 'Netherlands',
    away: 'Sweden',
    venue: 'NRG Stadium, Houston',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'F',
    date: '2026-06-20',
    time: '19:00',
    offset: '-06:00',
    home: 'Tunisia',
    away: 'Japan',
    venue: 'Estadio BBVA, Guadalupe',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'F',
    date: '2026-06-25',
    time: '18:00',
    offset: '-05:00',
    home: 'Japan',
    away: 'Sweden',
    venue: 'AT&T Stadium, Arlington',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'F',
    date: '2026-06-25',
    time: '19:00',
    offset: '-05:00',
    home: 'Tunisia',
    away: 'Netherlands',
    venue: 'Arrowhead Stadium, Kansas City',
    homeScore: null,
    awayScore: null,
  },

  // Group G
  {
    group: 'G',
    date: '2026-06-15',
    time: '12:00',
    offset: '-07:00',
    home: 'Belgium',
    away: 'Egypt',
    venue: 'Lumen Field, Seattle',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'G',
    date: '2026-06-15',
    time: '18:00',
    offset: '-07:00',
    home: 'Iran',
    away: 'New Zealand',
    venue: 'SoFi Stadium, Inglewood',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'G',
    date: '2026-06-21',
    time: '12:00',
    offset: '-07:00',
    home: 'Belgium',
    away: 'Iran',
    venue: 'SoFi Stadium, Inglewood',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'G',
    date: '2026-06-21',
    time: '18:00',
    offset: '-07:00',
    home: 'New Zealand',
    away: 'Egypt',
    venue: 'BC Place, Vancouver',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'G',
    date: '2026-06-26',
    time: '20:00',
    offset: '-07:00',
    home: 'Egypt',
    away: 'Iran',
    venue: 'Lumen Field, Seattle',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'G',
    date: '2026-06-26',
    time: '20:00',
    offset: '-07:00',
    home: 'New Zealand',
    away: 'Belgium',
    venue: 'BC Place, Vancouver',
    homeScore: null,
    awayScore: null,
  },

  // Group H
  {
    group: 'H',
    date: '2026-06-15',
    time: '18:00',
    offset: '-04:00',
    home: 'Spain',
    away: 'Cape Verde',
    venue: 'Mercedes-Benz Stadium, Atlanta',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'H',
    date: '2026-06-15',
    time: '21:00',
    offset: '-04:00',
    home: 'Saudi Arabia',
    away: 'Uruguay',
    venue: 'Hard Rock Stadium, Miami Gardens',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'H',
    date: '2026-06-21',
    time: '18:00',
    offset: '-04:00',
    home: 'Spain',
    away: 'Saudi Arabia',
    venue: 'Mercedes-Benz Stadium, Atlanta',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'H',
    date: '2026-06-21',
    time: '21:00',
    offset: '-04:00',
    home: 'Uruguay',
    away: 'Cape Verde',
    venue: 'Hard Rock Stadium, Miami Gardens',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'H',
    date: '2026-06-26',
    time: '15:00',
    offset: '-05:00',
    home: 'Cape Verde',
    away: 'Saudi Arabia',
    venue: 'NRG Stadium, Houston',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'H',
    date: '2026-06-26',
    time: '18:00',
    offset: '-06:00',
    home: 'Uruguay',
    away: 'Spain',
    venue: 'Estadio Akron, Zapopan',
    homeScore: null,
    awayScore: null,
  },

  // Group I
  {
    group: 'I',
    date: '2026-06-16',
    time: '15:00',
    offset: '-04:00',
    home: 'France',
    away: 'Senegal',
    venue: 'MetLife Stadium, East Rutherford',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'I',
    date: '2026-06-16',
    time: '18:00',
    offset: '-04:00',
    home: 'Iraq',
    away: 'Norway',
    venue: 'Gillette Stadium, Foxborough',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'I',
    date: '2026-06-22',
    time: '17:00',
    offset: '-04:00',
    home: 'France',
    away: 'Iraq',
    venue: 'Lincoln Financial Field, Philadelphia',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'I',
    date: '2026-06-22',
    time: '20:00',
    offset: '-04:00',
    home: 'Norway',
    away: 'Senegal',
    venue: 'MetLife Stadium, East Rutherford',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'I',
    date: '2026-06-26',
    time: '15:00',
    offset: '-04:00',
    home: 'Norway',
    away: 'France',
    venue: 'Gillette Stadium, Foxborough',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'I',
    date: '2026-06-26',
    time: '15:00',
    offset: '-04:00',
    home: 'Senegal',
    away: 'Iraq',
    venue: 'BMO Field, Toronto',
    homeScore: null,
    awayScore: null,
  },

  // Group J
  {
    group: 'J',
    date: '2026-06-16',
    time: '18:00',
    offset: '-05:00',
    home: 'Argentina',
    away: 'Algeria',
    venue: 'Arrowhead Stadium, Kansas City',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'J',
    date: '2026-06-16',
    time: '21:00',
    offset: '-07:00',
    home: 'Austria',
    away: 'Jordan',
    venue: "Levi's Stadium, Santa Clara",
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'J',
    date: '2026-06-22',
    time: '17:00',
    offset: '-05:00',
    home: 'Argentina',
    away: 'Austria',
    venue: 'AT&T Stadium, Arlington',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'J',
    date: '2026-06-22',
    time: '20:00',
    offset: '-07:00',
    home: 'Jordan',
    away: 'Algeria',
    venue: "Levi's Stadium, Santa Clara",
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'J',
    date: '2026-06-27',
    time: '15:00',
    offset: '-05:00',
    home: 'Algeria',
    away: 'Austria',
    venue: 'Arrowhead Stadium, Kansas City',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'J',
    date: '2026-06-27',
    time: '18:00',
    offset: '-05:00',
    home: 'Jordan',
    away: 'Argentina',
    venue: 'AT&T Stadium, Arlington',
    homeScore: null,
    awayScore: null,
  },

  // Group K
  {
    group: 'K',
    date: '2026-06-17',
    time: '15:00',
    offset: '-05:00',
    home: 'Portugal',
    away: 'DR Congo',
    venue: 'NRG Stadium, Houston',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'K',
    date: '2026-06-17',
    time: '18:00',
    offset: '-06:00',
    home: 'Uzbekistan',
    away: 'Colombia',
    venue: 'Estadio Azteca, Mexico City',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'K',
    date: '2026-06-23',
    time: '15:00',
    offset: '-05:00',
    home: 'Portugal',
    away: 'Uzbekistan',
    venue: 'NRG Stadium, Houston',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'K',
    date: '2026-06-23',
    time: '18:00',
    offset: '-06:00',
    home: 'Colombia',
    away: 'DR Congo',
    venue: 'Estadio Akron, Zapopan',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'K',
    date: '2026-06-27',
    time: '15:00',
    offset: '-04:00',
    home: 'Colombia',
    away: 'Portugal',
    venue: 'Hard Rock Stadium, Miami Gardens',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'K',
    date: '2026-06-27',
    time: '18:00',
    offset: '-04:00',
    home: 'DR Congo',
    away: 'Uzbekistan',
    venue: 'Mercedes-Benz Stadium, Atlanta',
    homeScore: null,
    awayScore: null,
  },

  // Group L
  {
    group: 'L',
    date: '2026-06-17',
    time: '15:00',
    offset: '-05:00',
    home: 'England',
    away: 'Croatia',
    venue: 'AT&T Stadium, Arlington',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'L',
    date: '2026-06-17',
    time: '18:00',
    offset: '-04:00',
    home: 'Ghana',
    away: 'Panama',
    venue: 'BMO Field, Toronto',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'L',
    date: '2026-06-23',
    time: '15:00',
    offset: '-04:00',
    home: 'England',
    away: 'Ghana',
    venue: 'Gillette Stadium, Foxborough',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'L',
    date: '2026-06-23',
    time: '18:00',
    offset: '-04:00',
    home: 'Panama',
    away: 'Croatia',
    venue: 'BMO Field, Toronto',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'L',
    date: '2026-06-27',
    time: '15:00',
    offset: '-04:00',
    home: 'Panama',
    away: 'England',
    venue: 'MetLife Stadium, East Rutherford',
    homeScore: null,
    awayScore: null,
  },
  {
    group: 'L',
    date: '2026-06-27',
    time: '18:00',
    offset: '-04:00',
    home: 'Croatia',
    away: 'Ghana',
    venue: 'Lincoln Financial Field, Philadelphia',
    homeScore: null,
    awayScore: null,
  },
];

function kickoffDate(fixture) {
  return new Date(`${fixture.date}T${fixture.time}:00${fixture.offset}`);
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
      const kickoffAt = kickoffDate(fixture);
      const hasResult =
        fixture.homeScore != null && fixture.awayScore != null;
      const isFinished = hasResult && kickoffAt <= now;
      return {
        seasonId: season.id,
        kickoffAt,
        status: isFinished ? MatchStatus.FINISHED : MatchStatus.SCHEDULED,
        stage: MatchStage.GROUP,
        groupName: fixture.group,
        venue: fixture.venue,
        homeTeamId: teamByName.get(fixture.home).id,
        awayTeamId: teamByName.get(fixture.away).id,
        homeScore: isFinished ? fixture.homeScore : null,
        awayScore: isFinished ? fixture.awayScore : null,
      };
    }),
  });

  console.log(
    `Seeded ${fixtures.length} group-stage matches (2026 FIFA World Cup, groups A–L).`,
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
