# Asset sources and licences

Every image bundled with 2 Patti is public domain or made for this project. Nothing was bought.
Generated images are original works made for this app; they show fictional people, not real ones.
`tools/art/build_assets.py` rebuilds the files in `assets/art/` from the sources below.

| File | What it is | Source | Licence |
| --- | --- | --- | --- |
| `assets/art/room-dealer.jpg` | Casino floor with slot machines, soft ceiling lights and a dealer at the far edge of the table (1080x1920) | Generated image made for 2 Patti on 12 Nov 2026, using the approved v4 table concept (`v4-table.jpg`) as the layout reference | Self-made, owned by Samay Vashsht |
| `assets/art/table.webp` | Green felt table with a dark padded rail (1400x1100, transparent outside the table) | Drawn by `tools/art/build_assets.py`; the felt grain comes from a generated felt texture made for 2 Patti on 12 Nov 2026 | Self-made, owned by Samay Vashsht |
| `assets/art/cards/*.webp` (52 faces) | Illustrated playing cards, 168x245 | Vector Playing Cards by Byron Knoll, via https://github.com/notpeter/Vector-Playing-Cards (`cards-svg`), rendered to PNG with resvg and saved as WebP | Public domain (WTFPL where public domain is not recognised). The court-card designs are themselves public domain. Attribution appreciated, not required: thanks to Byron Knoll. |
| `assets/art/cards/back.webp` | Navy card back with a subtle diamond lattice | Drawn by `tools/art/build_assets.py` | Self-made, owned by Samay Vashsht |
| `assets/art/portraits/marcus.jpg`, `jennifer.jpg`, `tanya.jpg`, `kevin.jpg`, `priya.jpg`, `walt.jpg` | Round-frame portraits for the six named computer players | Generated images made for 2 Patti on 12 Nov 2026. Fictional people; any likeness to a real person is unintended | Self-made, owned by Samay Vashsht |
| Pot chip stacks | Red, green and white casino chips | Drawn in code with react-native-svg (`src/components/ChipPile.tsx`) | Self-made, owned by Samay Vashsht |
| `assets/icon.png`, `assets/adaptive-icon.png`, `assets/splash-icon.png`, `assets/favicon.png` | App icon and splash | Made for 2 Patti for build 1, unchanged | Self-made, owned by Samay Vashsht |

Removed in this build: `assets/casino-bg.jpg` (the blurred photo used by build 1), replaced by `room-dealer.jpg`.

Fonts: Outfit by Rodrigo Fuenzalida, SIL Open Font License 1.1, via `@expo-google-fonts/outfit` (unchanged).
