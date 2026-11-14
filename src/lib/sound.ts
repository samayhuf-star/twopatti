/**
 * Lightweight sound system. Uses expo-av when available.
 * Drop short .mp3/.wav files into assets/sounds/ (deal.mp3, bet.mp3, win.mp3)
 * and they will play. Missing files or missing expo-av are silent (no crash).
 */
let Audio: typeof import('expo-av').Audio | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Audio = require('expo-av').Audio;
} catch {
  // expo-av not installed — sounds stay silent
}

type SoundName = 'deal' | 'bet' | 'win' | 'fold';

const cache: Partial<Record<SoundName, import('expo-av').Audio.Sound>> = {};

const SOURCES: Record<SoundName, number | null> = {
  deal: null, // require('../../assets/sounds/deal.mp3') once assets exist
  bet: null,
  win: null,
  fold: null,
};

export async function playSound(name: SoundName) {
  if (!Audio) return;
  try {
    const src = SOURCES[name];
    if (!src) return;
    let sound = cache[name];
    if (!sound) {
      const { sound: s } = await Audio.Sound.createAsync(src, { volume: 0.6 });
      cache[name] = s;
      sound = s;
    }
    await sound.replayAsync();
  } catch {
    // ignore missing assets or playback errors
  }
}

export const sfx = {
  deal: () => playSound('deal'),
  bet: () => playSound('bet'),
  win: () => playSound('win'),
  fold: () => playSound('fold'),
};
