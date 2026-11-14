# Apple pre-submission report — 2 Patti

Packet: branch `cursor/app-store-prep-feb8`. Version **1.0.0**, iOS build **3**, bundle ID `com.samayvashsht.twopatti`, ASC app id `6833949427`, Expo owner `krosz`, project `@krosz/twopatti`.

This version is free. There is no in-app purchase. A 7-day trial and a $39.99 lifetime product are not part of 1.0; in-app purchase is deferred to 1.1.

**Decision: DO NOT SUBMIT** until the four FAILs are fixed and the NEEDS DEVICE and NEEDS ASC rows are cleared on a TestFlight build of this commit.

**Summary:** PASS 38 · FAIL 4 · N/A 44 · NEEDS DEVICE 8 · NEEDS ASC 11 · Decision: DO NOT SUBMIT

Checklist source: `/cursor/stores/bot/apple-presubmission-checklist.md` (105 checks). Screenshot sizes were checked against Apple’s screenshot specifications page fetched on 14 November 2026. A simulator, web preview, or export cannot PASS a crash, purchase, permission, or iPad check.

## What was verified in this session

- `npx tsc --noEmit` passed.
- `npx jest --ci` passed: 4 suites, 84 tests.
- `npx expo-doctor`: 21/21 checks passed after `npx expo install --fix` (SDK 57 patch alignment: expo ~57.0.33, expo-constants, expo-linking ~57.0.14, expo-router ~57.0.31).
- `npx expo export --platform ios` bundled `node_modules/expo-router/entry.js` (1775 modules) and wrote `dist/` (gitignored).
- `npx expo config --type public`: version 1.0.0, buildNumber 3, `supportsTablet` false, `ITSAppUsesNonExemptEncryption` false, privacy manifest reasons `CA92.1`, `C617.1`, `35F9.1`, `NSPrivacyTracking` false, no usage-description keys, no `UIBackgroundModes`.
- Legal URLs, `curl -sI -L --max-redirs 5`:
  - privacy.html **200** `https://samayhuf-star.github.io/app-legal/2patti/privacy.html`
  - terms.html **200** `https://samayhuf-star.github.io/app-legal/2patti/terms.html`
  - support.html **200** `https://samayhuf-star.github.io/app-legal/2patti/support.html`
- Placeholder scan (`rg` excluding `node_modules`, `dist`, and the lockfile) found no `coming soon`, `lorem`, `placeholder`, `tbd`, or `coming shortly` in the app or the listing draft.
- No `google play` or `play store` in the listing or app source.
- Screenshots: five PNG files in `store/screenshots/`, each **1290×2796**, PNG color type 2 (no alpha). Captured in headless Chrome from this commit’s Expo web bundle at a 430×932 viewport with device scale 3, after confirming age and playing a Silver hand through showdown. They are supporting evidence, not a physical-device pass.

| File | What it shows |
| --- | --- |
| `store/screenshots/01-lobby.png` | Lobby: Centre/Imaginary, computer opponents, Silver and Gold SIT, Diamond disabled below its minimum, 17+ simulated-gambling notice |
| `store/screenshots/02-blind-turn.png` | Table, face-down centre card, blind action bar (SEE, BET, RAISE, FOLD) |
| `store/screenshots/03-seen-hand.png` | Same hand after SEE, hole cards face up |
| `store/screenshots/04-midhand-pot.png` | Centre card open, larger pot, your turn |
| `store/screenshots/05-winner.png` | Showdown banner, revealed hands, LEAVE and NEXT HAND |

The archived shots in `docs/launch-archive/2patti-v4-art/` are 1170×2532 and the lobby still says 18+ with only a Silver table, so they were not reused.

## Remaining FAILs (all on the live legal site, outside this repo)

These four rows are the same website. Fix the pages, then re-check B7, F1, H1, and H3.

1. **privacy.html** and **terms.html** still say `Effective [EFFECTIVE DATE – LAUNCH DAY]`. Replace that with a real date before submission.
2. Both pages say the player must be **18**. This binary’s gate, `AGE_NOTICE`, rules, and the listing are **17+**. Change the pages to 17 or older so they match the app.
3. **privacy.html** says a “daily bonus streak” is stored. The app stores a flat daily bonus of 250 chips and does not keep a streak (`src/lib/daily.ts`).
4. **support.html** says to “use the free top-up that appears when your balance is below the table minimum.” That control was removed. There is no chip shop. The page should say: claim the daily bonus of 250 virtual chips, or sit only at a table the balance can cover.

Suggested support replacement for the “I ran out of chips” answer: “Claim the daily bonus of 250 virtual chips in the lobby. You can sit at a table only when your balance covers that table’s minimum. Chips cannot be purchased.”

## ASC-side to-dos

Paste `store/listing.md` into the version page. Paste `store/review-notes.md` into App Review Information. Then:

- Age rating questionnaire (answers are also in `store/listing.md`):
  - Simulated gambling: **Frequent** (the card game is the app).
  - Real-money gambling, contests, loot boxes: **None**. Chips cannot be purchased or cashed out.
  - Violence, horror, profanity, sexual content, alcohol, tobacco, drugs: **None**.
  - Medical or wellness topics: **None**.
  - User-generated content, messaging, chat: **None**.
  - Unrestricted web access: **None**. Settings opens only the Privacy, Terms, and Support pages.
  - Age assurance: the player declares they are 17 or older. Identity is not verified.
  - Do not select Made for Kids.
- App Privacy: **Data Not Collected**. No account, analytics, ads, or crash SDK. Chips, the age confirmation, and settings stay on device.
- Price: **Free**. Do not attach a trial, a lifetime product, or any other in-app purchase to 1.0.
- Privacy URL: `https://samayhuf-star.github.io/app-legal/2patti/privacy.html`
- Support URL: `https://samayhuf-star.github.io/app-legal/2patti/support.html`
- License: Apple’s standard EULA is fine. In-app Terms are `https://samayhuf-star.github.io/app-legal/2patti/terms.html`.
- Export compliance: app does not use non-exempt encryption (`ITSAppUsesNonExemptEncryption` is false). HTTPS is only used when the player opens a legal or support page.
- Upload the five 1290×2796 screenshots. Confirm App Store Connect fills the required iPhone slot. That size is an accepted portrait size for iPhone with Dynamic Island (large display), including iPhone 14 Pro Max, 15 Plus, 16 Plus, and 16 Pro Max. `ios.supportsTablet` is false, so 13-inch iPad screenshots are not required.
- Build with `eas build --platform ios --profile production` from this commit. `eas.json` uses `appVersionSource: local` and production `autoIncrement: false`, so the binary’s `CFBundleVersion` stays **3** (ASC already has build 1; build 2 failed bundling and never shipped).
- After the IPA exists: install it from TestFlight on a physical iPhone, cold-launch three times, play a hand, open Settings’ three links, and run the same build in iPad compatibility mode. Record the device model and iOS version in the review notes.
- Set the App Review contact email to the monitored address `samayhuf@gmail.com`. There is no phone line.
- Confirm the name “2 Patti” is available, and confirm this is not a duplicate of another app on the same account.

## Checklist

| ID | Area | Result | Evidence | Notes |
| --- | --- | --- | --- | --- |
| A1 | Binary matches listing version and build | NEEDS ASC | `app.json` version 1.0.0, `ios.buildNumber` 3, bundle `com.samayvashsht.twopatti`. No IPA has been built from this commit. | Build with the production profile, then compare `CFBundleShortVersionString` and `CFBundleVersion` in the IPA. |
| A2 | Clean install does not crash | NEEDS DEVICE | Not installed on a physical iPhone. | TestFlight, delete, cold-launch three times. |
| A3 | Core journeys work | NEEDS DEVICE | Web walkthrough of this commit: age gate, lobby, Silver hand, see, bet, raise, showdown, Settings routes exist in `src/app/settings.tsx`. | Web cannot PASS this row. Repeat on device. |
| A4 | No placeholder UI | PASS | `rg` for coming soon / lorem / placeholder / tbd returned no matches in app source or `store/listing.md`. Locked “Coming soon” tables and the Online soon pill are gone. Lobby lists Silver, Gold, and Diamond only. | Diamond’s SIT control is disabled until the balance covers 50,000. That is a stake rule, not an unfinished table. |
| A5 | No hidden or dormant features | PASS | Production profile in `eas.json` is not a dev client. `expo-dev-client` is not a dependency. IAP product ids and RevenueCat placeholders were removed from `src/lib/config.ts`. No debug menu. | `src/lib/sound.ts` is not imported and plays nothing. |
| A6 | Background modes match real use | PASS | `npx expo config --type public` infoPlist has no `UIBackgroundModes`. | The app does not play audio in the background. |
| A7 | Works on IPv6 | PASS | Core play never opens a socket. `src/lib/store.tsx` uses AsyncStorage only. Network is limited to Safari pages the player chooses to open. | NAT64 was not tested. Gameplay does not need it. |
| A8 | Capture indicator | N/A | No camera, microphone, or screen-recording API. | |
| A9 | Export compliance matches the binary | NEEDS ASC | `ios.infoPlist.ITSAppUsesNonExemptEncryption` is false. | Answer the ASC export questions the same way after upload. |
| A10 | Minimum iOS version runs | NEEDS DEVICE | Minimum OS is the Expo SDK 57 default. Not installed on that OS. | A crash on a supported OS would be a FAIL. |
| A11 | No instructions to disable system settings | PASS | Age gate, rules, settings, and the live support page do not tell anyone to restart the device or turn off Wi-Fi or security features. | |
| A12 | Release build, not Expo Go or a dev client | PASS | `eas.json` production has no `developmentClient`. The store command is `eas build --platform ios --profile production`. | |
| B1 | Demo account if login exists | N/A | No account, no sign-in. | |
| B2 | Expired-subscription demo | N/A | No subscription. | |
| B3 | Credentials for every role | N/A | No roles. | |
| B4 | Backends live | PASS | No API, auth, or payment backend. Privacy, terms, and support returned HTTP 200. | |
| B5 | Review notes are a test script | PASS | `store/review-notes.md` covers how to play, no login, virtual chips, where the legal links are, and that 1.0 has no purchase. | |
| B6 | Every IAP works or is explained | N/A | No in-app purchase in this binary. | Deferred to 1.1. |
| B7 | Metadata URLs are finished pages | FAIL | Pages return 200, but privacy and terms contain `Effective [EFFECTIVE DATE – LAUNCH DAY]` and say 18+. Support tells the reader to use a free top-up that is not in the app. | Fix the three pages. See the remaining-FAIL section. |
| B8 | Support and ASC contact are monitored | NEEDS ASC | Support page shows `samayhuf@gmail.com` and a Delhi postal address. | Confirm the ASC review contact uses that email. No phone line is published. |
| B9 | External services named in notes | PASS | Notes say gameplay contacts no server. The only network use is the static legal and support pages. | |
| B10 | Notes list devices actually tested | NEEDS DEVICE | Notes do not name a device, because none was tested. | Add the model and iOS version after the TestFlight pass. Do not invent one. |
| C1 | Metadata matches this binary | PASS | `store/listing.md` describes Centre, Imaginary, computer opponents, a local wallet, a daily bonus, and a 17+ gate. Those are the screens exercised above. No trial and no price. | |
| C2 | No false prices, features, or medical claims | PASS | Description, What’s New, and the five screenshots contain no price, no trial, and no medical claim. | The stale top-up sentence is on the support site (B7), not in the listing draft. |
| C3 | Premium items in screenshots are labelled | N/A | Nothing in the screenshots requires a purchase. | |
| C4 | iPhone screenshots at an accepted size, no alpha | PASS | `01`–`05` are 1290×2796 PNG, color type 2. Apple’s screenshot spec lists 1290×2796 as a portrait size for iPhone with Dynamic Island (large display). | Confirm ASC fills the required iPhone slot from this set. `supportsTablet` is false, so iPad shots are not required (C5). |
| C5 | 13-inch iPad screenshots | N/A | `ios.supportsTablet` is false. | |
| C6 | More than half of the shots show the app in use | PASS | 5 of 5 are the lobby or a live hand. None is the age gate, Settings, or a title card. | |
| C7 | Screenshots match the TestFlight build | NEEDS DEVICE | Shots were taken from this commit’s UI in Chrome, not from TestFlight. | Compare side by side after the device build. |
| C8 | No other-platform imagery | PASS | Screenshots show the iPhone-layout app. Listing draft has no Play badge. `rg` found no “google play” or “play store”. | `app.json` still has an Android package for Expo. It is not shown in the UI or the listing. |
| C9 | No prices in name, subtitle, keywords, or shots | PASS | Name “2 Patti” (7). Subtitle “Two-card social card game” (25). Keywords have no `$` and no trial. Screenshots show chip amounts only. | |
| C10 | Name length and uniqueness | NEEDS ASC | Name 7 characters, subtitle 25, keywords 65. | Confirm the name is free in App Store Connect. Keywords do not name other apps. |
| C11 | Screenshot content is 4+ safe; not a Kids app | PASS | Cards, chips, and a dealer. No sexual content, gore, or “for kids” wording. | The app’s rating is 17+ because of simulated gambling. |
| C12 | What’s New is specific | PASS | `store/listing.md` What’s New describes the first release: Centre, Imaginary, computer opponents, virtual chips. | |
| C13 | Category fits | PASS | Games, subcategory Card, in `store/listing.md`. | Select that pair in App Store Connect. |
| C14 | Previews are screen captures | N/A | No app preview video. | |
| C15 | Creative assets | N/A | No extra creative assets beyond the icon and the five screenshots. | |
| C16 | Fictional demo data | PASS | Names are You, Tanya, Kevin, Marcus, Walt, Priya. `ASSET_LICENSES.md` says the portraits are generated fictional people. | |
| D1 | Digital goods use StoreKit | N/A | No digital goods are sold. Chips cannot be purchased. | |
| D2 | Restore Purchases | N/A | No purchases. | |
| D3 | Subscription length and value | N/A | No subscription. | |
| D4 | One subscription group | N/A | No subscription. | |
| D5 | Price and duration before purchase | N/A | No paywall. | |
| D6 | Trial length and post-trial price | N/A | No trial. | |
| D7 | Privacy and Terms on the paywall | N/A | No paywall. Both links are in Settings. | |
| D8 | Metadata points at Privacy and Terms | N/A | No IAP. The listing still includes both URLs for the free app. | |
| D9 | Paywall matches ASC prices | N/A | No paywall and no products. | |
| D10 | Paywall does not sell unfinished features | N/A | No paywall. | |
| D11 | First IAP submitted with the version | N/A | No IAP in this version. | |
| D12 | Paid Applications Agreement | N/A | Free app, no IAP. The paid-apps agreement is not required for this version. | |
| D13 | Sandbox purchase unlocks | N/A | No purchase. | |
| D14 | Manage subscription | N/A | No subscription. | |
| D15 | Existing paid users keep access | N/A | Nothing was previously sold. | |
| D16 | Notes explain the paywall | N/A | Notes say there is no purchase and no paywall. | |
| E1 | Lasting use without paying | PASS | A full Silver hand was played in this session with the starting 25,000 virtual chips. No paywall. | |
| E2 | Not a white-label template | PASS | Original rules engine in `src/engine/` and original table UI. Publisher Samay Vashsht. | |
| E3 | Not a copy under another bundle id | NEEDS ASC | This packet is one bundle id. Other apps on the account were not listed. | Inventory the account before submit. |
| E4 | Not an indistinguishable saturated app | PASS | `store/review-notes.md` states the difference: two hole cards, Centre or Imaginary third card, offline bots, no cash. | Teen Patti is a crowded category. Keep that sentence in the notes. |
| E5 | Related apps are distinct | NEEDS ASC | Same gap as E3. | |
| E6 | Does not impersonate another app | PASS | Name is descriptive. Icon and table art are documented as made for this app in `ASSET_LICENSES.md`. | |
| E7 | No forced rating or cross-download | PASS | No `StoreReview` or rating API in source. | |
| E8 | Works without another app | PASS | First launch goes age gate to lobby to table. No other app is required. | |
| F1 | Privacy policy matches real practice | FAIL | Policy returns 200 and correctly says there is no account, no ads, and no analytics. It also says 18+, a daily-bonus streak, and `Effective [EFFECTIVE DATE – LAUNCH DAY]`. The app confirms 17+ and stores a flat 250-chip bonus. | Update the page, then re-read it. |
| F2 | Nutrition labels match the binary | NEEDS ASC | No analytics, ads, attribution, or crash SDK in `package.json`. | Set App Privacy to Data Not Collected. |
| F3 | Privacy manifest required-reason APIs | NEEDS ASC | `app.json` declares UserDefaults `CA92.1`, FileTimestamp `C617.1`, SystemBootTime `35F9.1`, tracking false. | Unzip the IPA and confirm `PrivacyInfo.xcprivacy` before upload. |
| F4 | Listed third-party SDKs ship manifests | PASS | Dependencies are Expo SDK 57 and React Native. No Firebase, Facebook, or other SDK from Apple’s commonly-used list. | |
| F5 | Purpose strings for every permission | PASS | Resolved infoPlist has no camera, photo, microphone, location, tracking, contacts, Bluetooth, or HealthKit key. | |
| F6 | Permissions are contextual | N/A | The app does not request a permission. | |
| F7 | In-app account deletion | N/A | The app does not create an account. | |
| F8 | Usable without sign-in | PASS | Age gate then lobby. No login screen. | |
| F9 | Equivalent login beside social login | N/A | No social login. | |
| F10 | ATT only if the app tracks | PASS | No ATT prompt, no `NSUserTrackingUsageDescription`, no ads or attribution SDK. | Do not claim tracking on the nutrition label. |
| F11 | Tracking flags match behavior | PASS | `NSPrivacyTracking` false and `NSPrivacyTrackingDomains` empty in `app.json`. The app does not track. | |
| F12 | Consent before third-party AI | N/A | No third-party model and no prompt leaves the device. | |
| F13 | Health data not used for ads | N/A | No health, fitness, or motion data. | |
| F14 | Health data not in iCloud | N/A | No health data and no iCloud entitlement. | |
| F15 | Name and email are optional | N/A | The app never asks for a name or email. | |
| F16 | Location used only when relevant | N/A | No location API. | |
| G1 | No diagnosis or treatment claims | N/A | No medical feature. Listing, notes, and UI were read for those claims. | |
| G2 | No phone-sensor medical measurements | N/A | None. | |
| G3 | Consult-a-doctor reminder | N/A | The app does not touch medical decisions. | |
| G4 | Medical age-rating answers | NEEDS ASC | Draft answer is None. | Enter it in the questionnaire. |
| G5 | Notes do not over-claim | PASS | `store/review-notes.md` describes a card game. It does not call the app a medical device. | |
| H1 | Privacy URL is HTTPS 200 and complete | FAIL | HTTP 200 on the final privacy.html URL. The page is not finished: placeholder effective date, and it says 18+ while the app says 17+. | |
| H2 | Support URL is HTTPS 200 with a contact | PASS | HTTP 200. Email `samayhuf@gmail.com` and postal address 2/61 Bhim Street, Vishwas Nagar, Delhi 110032, India. | The free-top-up sentence is a content FAIL under B7, not a missing contact. |
| H3 | Terms URL is HTTPS 200 and matches the app | FAIL | HTTP 200 on terms.html. The terms require 18+ and still contain the placeholder effective date. The in-app gate is 17+. | If a custom EULA is pasted into ASC, paste the corrected plain text. Standard EULA is also acceptable. |
| H4 | Legal links tappable without buying | NEEDS DEVICE | `src/app/settings.tsx` opens Privacy, Terms, and Support with `expo-web-browser`. There is no purchase to hide them behind. | Tap all three on a fresh install. |
| H5 | No placeholder in the listing or notes | PASS | `store/listing.md` and `store/review-notes.md` have no “TO ADD”, lorem, or example.com. | The placeholder date is on the live pages (H1, H3). |
| I1 | Notes include anything else the reviewer needs | PASS | No OTP, QR, sample file, or invite code. Notes say to tap “I AM 17 OR OLDER” and SIT at Silver. | |
| I2 | Hardware video | N/A | No accessory. | |
| I3 | ASC contact is monitored | NEEDS ASC | Support email is real. The ASC contact field was not opened. | Use `samayhuf@gmail.com`. |
| J1 | Age-rating questionnaire is honest | NEEDS ASC | Draft answers are in `store/listing.md` and the ASC to-dos above. Frequent simulated gambling, nothing else. | Enter them. Do not leave the questionnaire blank. |
| J2 | Metadata does not target children | PASS | Name, subtitle, description, and screenshots do not say “for kids” or “for children”. | |
| J3 | Kids Category parental gate | N/A | Not in the Kids Category. | |
| J4 | UGC filtering, report, and block | N/A | No user-generated content and no chat. | |
| J5 | Age restriction for UGC that can exceed the rating | N/A | No UGC. The 17+ declaration gate is for the simulated-gambling rating. | |
| K1 | Real iPad layout and 13-inch shots | N/A | `supportsTablet` is false. | |
| K2 | iPhone-only app still works in iPad compatibility mode | NEEDS DEVICE | Not run on an iPad. | Do not add `UIRequiredDeviceCapabilities` just to hide from iPad. |
| K3 | Small phone and large phone | NEEDS DEVICE | Chrome used a 430×932 layout (Pro Max class). An SE-class layout was not run. | Check clipping on both. |
| K4 | Missing hardware does not crash | N/A | No camera, Bluetooth, or other optional hardware. | |
| L1 | Art is licensed for the App Store | PASS | `ASSET_LICENSES.md`: Byron Knoll public-domain deck, self-made room, table, portraits, icon, and chip drawing. Outfit is SIL OFL via `@expo-google-fonts/outfit`. | |
| L2 | Music and sound effects are licensed | N/A | No audio files are bundled. `src/lib/sound.ts` is unused and silent. | |
| L3 | No Apple endorsement or Apple emoji | PASS | Winner marker is an Ionicons trophy plus the word “Winner” in `src/components/Seat.tsx` and `src/app/table.tsx`. Icon is original. | Tutorial sentences use suit characters to name cards. They are not emoji artwork. |
| L4 | Permission for third-party trademarks | N/A | No celebrity, team, or third-party brand is used. Portraits are fictional. | |
| L5 | Shots and demos use fictional personal data | PASS | Same evidence as C16. | |

## Fixes in this packet

- Lobby JSX in `src/app/index.tsx` again returns one card per table, with SIT inside the card and the tier id passed to the table. The stray button that sat next to a closed `View` is gone.
- Centre card sits at the top of the felt (`felt.h * 0.02`) so the pot no longer covers it.
- Card faces, seat portraits, and the SVG chip pot are the v4 art components, which typecheck and match the table screenshots.
- Tan and compact styles are applied on the one-row action bar.
- Age copy is 17+ everywhere in the app, and it says simulated gambling with no real money.
- Chip disclaimer says chips cannot be purchased.
- `ios.buildNumber` is 3. Production EAS uses the local build number and does not auto-increment it.
