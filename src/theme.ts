// Premium dark casino palette.
export const colors = {
  charcoal: '#0E1014',
  panel: '#1A1D24',
  panelBorder: '#2E333C',
  felt: '#0F4A2C',
  feltHi: '#1A6B40',
  feltEdge: '#0A3820',
  feltDeep: '#082818',
  rail: '#0A0C0F',
  gold: '#D4AF6A',
  goldSoft: '#F0D48A',
  goldDark: '#9A7B3C',
  highlight: '#F5E6C0',
  ivory: '#F8F0DC',
  wine: '#7A2430',
  warm: '#E8D4B0',
  ink: '#F8F4E8',
  muted: '#B0A898',
  green: '#4ADE80',
  navy: '#1A2540',
  red: '#C53030',
  black: '#08090C',
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
