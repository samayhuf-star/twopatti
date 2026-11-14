import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts } from '../theme';
import { PressableScale } from './PressableScale';

type Tone = 'gold' | 'tan' | 'wine' | 'green' | 'dark';

const bg: Record<Tone, string> = {
  gold: colors.gold,
  tan: '#9A7B45',
  wine: colors.wine,
  green: colors.feltHi,
  dark: colors.panel,
};
const fg: Record<Tone, string> = {
  gold: colors.black,
  tan: colors.ink,
  wine: colors.ink,
  green: colors.ink,
  dark: colors.ink,
};

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
      <View style={[
        styles.btn,
        compact && styles.compact,
        { backgroundColor: bg[tone], borderColor: tone === 'dark' ? colors.panelBorder : tone === 'gold' ? colors.goldSoft : tone === 'tan' ? '#C4A35A' : 'transparent' },
        tone === 'gold' && styles.goldBtn,
      ]}>
        <Text style={[styles.label, compact && styles.compactLabel, { color: fg[tone] }]} numberOfLines={1} adjustsFontSizeToFit>
          {label}
        </Text>
        {sub ? <Text style={[styles.sub, { color: fg[tone] }]}>{sub}</Text> : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  compact: { minHeight: 56, paddingHorizontal: 4 },
  compactLabel: { fontSize: 15, letterSpacing: 0.6 },
  goldBtn: {
    shadowColor: colors.goldDark,
    shadowOpacity: 0.4,
  },
  label: { fontFamily: fonts.bold, fontSize: 16, letterSpacing: 1 },
  sub: { fontFamily: fonts.semibold, fontSize: 12, opacity: 0.9, fontVariant: ['tabular-nums'], marginTop: 1 },
});
