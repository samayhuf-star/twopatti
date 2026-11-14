// Premium dark casino palette with richer felt and lighting.
export const colors = {
  charcoal: '#0C0E12',
  panel: '#181B22',
  panelBorder: '#2C313A',
  felt: '#0E5A34',
  feltHi: '#1E7A4A',
  feltEdge: '#0A4024',
  feltDeep: '#07301A',
  rail: '#07090C',
  gold: '#D4AF6A',
  goldSoft: '#F2D78A',
  goldDark: '#8F7036',
  highlight: '#F7E8C4',
  ivory: '#F9F2E0',
  wine: '#7A2430',
  warm: '#EAD6B4',
  ink: '#F9F5EA',
  muted: '#B2AA98',
  green: '#4ADE80',
  navy: '#162038',
  red: '#C53030',
  black: '#07080B',
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
