// Generated list of bundled art. See ASSET_LICENSES.md for sources and licences.
import type { Card } from '../engine';
import { cardId } from '../engine';

export const ROOM_BG = require('../../assets/art/room-dealer.jpg');
export const TABLE_IMG = require('../../assets/art/table.webp');
/** Fraction of the background height where the dealer's table edge sits. */
export const TABLE_TOP_FRAC = 0.38;
/** Background image aspect ratio (width / height). */
export const ROOM_BG_ASPECT = 1080 / 1920;

/** Card art aspect ratio (height / width) of the public-domain deck. */
export const CARD_RATIO = 245 / 168;

export const CARD_BACK = require('../../assets/art/cards/back.webp');

const FACES: Record<string, number> = {
  'AS': require('../../assets/art/cards/AS.webp'),
  'KS': require('../../assets/art/cards/KS.webp'),
  'QS': require('../../assets/art/cards/QS.webp'),
  'JS': require('../../assets/art/cards/JS.webp'),
  '10S': require('../../assets/art/cards/10S.webp'),
  '9S': require('../../assets/art/cards/9S.webp'),
  '8S': require('../../assets/art/cards/8S.webp'),
  '7S': require('../../assets/art/cards/7S.webp'),
  '6S': require('../../assets/art/cards/6S.webp'),
  '5S': require('../../assets/art/cards/5S.webp'),
  '4S': require('../../assets/art/cards/4S.webp'),
  '3S': require('../../assets/art/cards/3S.webp'),
  '2S': require('../../assets/art/cards/2S.webp'),
  'AH': require('../../assets/art/cards/AH.webp'),
  'KH': require('../../assets/art/cards/KH.webp'),
  'QH': require('../../assets/art/cards/QH.webp'),
  'JH': require('../../assets/art/cards/JH.webp'),
  '10H': require('../../assets/art/cards/10H.webp'),
  '9H': require('../../assets/art/cards/9H.webp'),
  '8H': require('../../assets/art/cards/8H.webp'),
  '7H': require('../../assets/art/cards/7H.webp'),
  '6H': require('../../assets/art/cards/6H.webp'),
  '5H': require('../../assets/art/cards/5H.webp'),
  '4H': require('../../assets/art/cards/4H.webp'),
  '3H': require('../../assets/art/cards/3H.webp'),
  '2H': require('../../assets/art/cards/2H.webp'),
  'AD': require('../../assets/art/cards/AD.webp'),
  'KD': require('../../assets/art/cards/KD.webp'),
  'QD': require('../../assets/art/cards/QD.webp'),
  'JD': require('../../assets/art/cards/JD.webp'),
  '10D': require('../../assets/art/cards/10D.webp'),
  '9D': require('../../assets/art/cards/9D.webp'),
  '8D': require('../../assets/art/cards/8D.webp'),
  '7D': require('../../assets/art/cards/7D.webp'),
  '6D': require('../../assets/art/cards/6D.webp'),
  '5D': require('../../assets/art/cards/5D.webp'),
  '4D': require('../../assets/art/cards/4D.webp'),
  '3D': require('../../assets/art/cards/3D.webp'),
  '2D': require('../../assets/art/cards/2D.webp'),
  'AC': require('../../assets/art/cards/AC.webp'),
  'KC': require('../../assets/art/cards/KC.webp'),
  'QC': require('../../assets/art/cards/QC.webp'),
  'JC': require('../../assets/art/cards/JC.webp'),
  '10C': require('../../assets/art/cards/10C.webp'),
  '9C': require('../../assets/art/cards/9C.webp'),
  '8C': require('../../assets/art/cards/8C.webp'),
  '7C': require('../../assets/art/cards/7C.webp'),
  '6C': require('../../assets/art/cards/6C.webp'),
  '5C': require('../../assets/art/cards/5C.webp'),
  '4C': require('../../assets/art/cards/4C.webp'),
  '3C': require('../../assets/art/cards/3C.webp'),
  '2C': require('../../assets/art/cards/2C.webp'),
};

export function cardFace(c: Card): number {
  return FACES[cardId(c)];
}

/** Fictional computer players. Portraits are generated images, not real people. */
export const BOT_PROFILES: { name: string; portrait: number }[] = [
  { name: 'Marcus', portrait: require('../../assets/art/portraits/marcus.jpg') },
  { name: 'Jennifer', portrait: require('../../assets/art/portraits/jennifer.jpg') },
  { name: 'Tanya', portrait: require('../../assets/art/portraits/tanya.jpg') },
  { name: 'Kevin', portrait: require('../../assets/art/portraits/kevin.jpg') },
  { name: 'Priya', portrait: require('../../assets/art/portraits/priya.jpg') },
  { name: 'Walt', portrait: require('../../assets/art/portraits/walt.jpg') },
];

export function portraitFor(name: string): number | undefined {
  return BOT_PROFILES.find(p => p.name === name)?.portrait;
}
