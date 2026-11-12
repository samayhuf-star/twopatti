import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts } from '../theme';
import { PressableScale } from './PressableScale';

type Tone = 'gold' | 'tan' | 'wine' | 'green' | 'dark';

const bg: Record<Tone, string> = { gold: colors.gold, tan: '#9A7B45', wine: '#7A1F26', green: colors.felt, dark: colors.panel };
const fg: Record<Tone, string> = { gold: colors.black, tan: '#FFFFFF', wine: colors.ink, green: colors.ink, dark: colors.ink };

export function Button({
  label,
  sub,
  onPress,
  tone = 'gold',
  disabled,
  style,
  testID,
  compact,
}: {
  label: string;
  sub?: string;
  onPress?: () => void;
  tone?: Tone;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** Tighter padding and type, for the one-row table action bar. */
  compact?: boolean;
}) {
  return (
    <PressableScale onPress={onPress} disabled={disabled} style={style} accessibilityLabel={sub ? `${label} ${sub}` : label} testID={testID}>
      <View style={[styles.btn, compact && styles.compact, { backgroundColor: bg[tone], borderColor: tone === 'dark' ? colors.panelBorder : tone === 'tan' ? '#C4A35A' : 'transparent' }]}>
        <Text style={[styles.label, compact && styles.compactLabel, { color: fg[tone] }]} numberOfLines={1} adjustsFontSizeToFit>
          {label}
        </Text>
        {sub ? <Text style={[styles.sub, { color: fg[tone] }]}>{sub}</Text> : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  btn: { minHeight: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, borderWidth: 1 },
  compact: { minHeight: 56, paddingHorizontal: 4 },
  compactLabel: { fontSize: 15, letterSpacing: 0.6 },
  label: { fontFamily: fonts.bold, fontSize: 16, letterSpacing: 0.8 },
  sub: { fontFamily: fonts.semibold, fontSize: 12, opacity: 0.85, fontVariant: ['tabular-nums'] },
});
