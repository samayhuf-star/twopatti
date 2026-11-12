# 2 Patti

A two-card social card game for iPhone (Expo / React Native), inspired by Teen Patti.
Everyone gets two cards; the third card comes from the table mode, and the best
three-card hand wins the pot. Virtual chips only: no cash value, no cash-out. 18+.

© 2026 Samay Vashsht. All rights reserved.

## This build (first playable TestFlight)

- One Silver table (ante 100, blind cap 800, min to sit 1,000, pot cap 12,800) against
  3 or 4 computer players (4 or 5 seats). Bots are always labelled BOT.
- Both modes:
  - **Centre**: one face-down card opens after the first betting round and is everyone's third card.
  - **Imaginary**: no centre card. Each player's third card is the best card for their own two
    cards, auto-picked (locked rule: independent completion, it may match a card another player
    holds, never a card the player holds).
- Blind and seen betting with the locked stake rule, every amount an ante multiple, blind cap,
  max 4 blind actions then a forced free see, fold, show (two players left), pot cap showdown.
- A-2-3 is the highest straight. Equal hands are decided by the suits of each player's own two
  real cards (Spades > Hearts > Diamonds > Clubs), so there is always exactly one winner.
- +10% Blind Win house bonus for a still-blind winner (never taken from the pot).
- Local wallet only (AsyncStorage): 25,000 starting chips, daily bonus (2,000 up to 5,000 on a
  7-day streak). Test-only "Free refill (test)" back to 5,000 when below the Silver minimum
  (TODO: remove before release).
- 18+ age gate on first launch. Rules screen. Settings with a vibration toggle and legal links.
- Motion: deal animation, card flip on see, centre reveal, pot pulse, winner banner with crown
  and confetti, +10% Blind Win toast, haptics. System Reduce Motion skips movement and confetti.

Not in this build: online play, login, server wallet, IAP or shop, side show, leaderboard,
table extras, camera angles, sound and music, turn timers, hand history.

## Project layout

```
src/engine/        Pure TypeScript rules engine (no React or Expo imports)
  cards.ts         Cards, deck, seeded RNG, shuffle
  hand.ts          Hand ranking, A-2-3, suit tie-breaks, imaginary completion
  game.ts          Table config, tiers, betting state machine, show, Blind Win
  bot.ts           Easy and Medium computer players (own cards only)
  __tests__/       Jest unit tests
src/app/           Expo Router screens: age gate, lobby, table, rules, settings
src/components/    Cards, seats, chips, winner banner, buttons
src/lib/           Local wallet store, daily bonus, haptics, config
```

The imaginary rule is one switch in the engine: `TableConfig.imaginaryCompletion`
(`'independent'` default, `'remainingDeck'` stricter alternative, tested but not used in the app).

## Commands

```
npm install
npm test            # Jest, rules engine
npm run typecheck   # tsc
npm run lint        # expo lint
npx expo start
```

## Release

- Expo account `krosz`, project `@krosz/twopatti`, bundle ID `com.samayvashsht.twopatti`.
- `eas build --platform ios --profile production` (remote app version, auto-increment).
- `submit.production` in `eas.json` needs the App Store Connect app id (`ascAppId`) once it exists.

Legal pages: https://samayhuf-star.github.io/app-legal/2patti/
