# Championship final bet

## Player API (authenticated)

- `GET /api/seasons` — list seasons (competition editions).
- `GET /api/seasons/:seasonId/final-bet` — teams in season, your pick, actual result (if set), awarded points when settled.
- `PUT /api/seasons/:seasonId/final-bet` — create/update your pick (one per user per season). Body:

```json
{
  "predictedHomeTeamId": "team-cuid",
  "predictedAwayTeamId": "team-cuid",
  "predictedHomeScore": 2,
  "predictedAwayScore": 1
}
```

Betting is blocked when `finalBettingOpen` is false on the season.

## Admin API

Set `ADMIN_API_KEY` in the environment, then send header `x-admin-key: <same value>`.

- `PATCH /api/admin/seasons/:seasonId/final-answer` — set the real final (teams + scores). Body:

```json
{
  "finalHomeTeamId": "…",
  "finalAwayTeamId": "…",
  "finalHomeScore": 2,
  "finalAwayScore": 1
}
```

- `PATCH /api/admin/seasons/:seasonId/final-betting` — `{ "open": false }` to close player betting.

## Scoring (after final answer is complete)

| Condition | Points |
|-----------|--------|
| Exact home/away teams + exact score | 10 |
| Exact home/away + correct W/D/L | 7 |
| Exact home/away, wrong outcome | 5 |
| Both finalists correct but home/away flipped | 5 |
| Exactly one finalist correct | 2 |

Points are added to leaderboard `totalPoints` and shown in column **F**.
