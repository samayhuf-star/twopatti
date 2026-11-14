/**
 * Optional table sounds. Stays silent unless expo-av and short clips are added later.
 * Missing files or a missing expo-av module never throw.
 */
type Playback = { replayAsync: () => Promise<void> };
type AudioModule = {
  Sound: {
    createAsync: (src: number, opts: { volume: number }) => Promise<{ sound: Playback }>;
  };
};

let Audio: AudioModule | null = null;
try {
  // Optional dependency. Not imported statically so a missing module stays silent.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Audio = require('expo-av').Audio as AudioModule;
} catch {
  Audio = null;
}

type SoundName = 'deal' | 'bet' | 'win' | 'fold';

const cache: Partial<Record<SoundName, Playback>> = {};

const SOURCES: Record<SoundName, number | null> = {
  deal: null,
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
      const { sound: created } = await Audio.Sound.createAsync(src, { volume: 0.6 });
      cache[name] = created;
      sound = created;
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
