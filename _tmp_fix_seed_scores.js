const fs = require('fs');
const p = 'apps/garage-bet-api/prisma/seed-world-cup-group-stage.cjs';
const ind = ' '.repeat(4);
let s = fs.readFileSync(p, 'utf8');
s = s.replace(
  new RegExp(` {4}homeScore: \\d+,`, 'g'),
  `${ind}homeScore: null,`,
);
s = s.replace(
  new RegExp(` {4}awayScore: \\d+,`, 'g'),
  `${ind}awayScore: null,`,
);
fs.writeFileSync(p, s);
