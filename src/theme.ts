// Palette from spec section 16 (plain, modern US casino; v3/v4 mood board).
export const colors = {
  charcoal: '#1A1D22',
  panel: '#22262D',
  panelBorder: '#343A44',
  felt: '#1F6B3A',
  feltHi: '#2A7A46',
  feltEdge: '#16502B',
  rail: '#121417',
  gold: '#C4A35A',
  goldSoft: '#E8C56B',
  highlight: '#E8D9A8',
  ivory: '#F4E8C8',
  wine: '#6B1E2A',
  warm: '#F3E2B8',
  ink: '#F7F1DE',
  muted: '#A9A493',
  green: '#5FBF7A',
  navy: '#1C2A4A',
  red: '#B3261E',
  black: '#14161A',
};

export const fonts = {
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
  black: 'Outfit_800ExtraBold',
};

export function formatChips(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}
