# Remaining table.tsx wiring

The high-impact features are in place. To finish full integration in `src/app/table.tsx`:

1. Read `tier` from search params and pick the matching entry from `TIERS` instead of always using `SILVER`.
2. Change `BOT_LEVELS` to `['tight', 'loose', 'medium', 'easy']` so personalities show.
3. On hand complete, call `store.recordWin(result.pot, !human.seen)` or `store.recordLoss()`.
4. Optionally call `sfx.deal()`, `sfx.bet()`, `sfx.win()` from `src/lib/sound.ts` on the matching log events (after adding short sound files to `assets/sounds/`).

Online multiplayer and global leaderboard need a backend; the local achievements and "Online soon" pill are the current structure.
