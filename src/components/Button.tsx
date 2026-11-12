import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts } from '../theme';
import { PressableScale } from './PressableScale';

type Tone = 'gold' | 'wine' | 'green' | 'dark';

const bg: Record<Tone, string> = { gold: colors.gold, wine: colors.wine, green: colors.felt, dark: colors.panel };
const fg: Record<Tone, string> = { gold: colors.black, wine: colors.ink, green: colors.ink, dark: colors.ink };

export function Button({
  label,
  sub,
  onPress,
  tone = 'gold',
  disabled,
  style,
  testID,
}: {
  label: string;
  sub?: string;
  onPress?: () => void;
  tone?: Tone;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  return (
    <PressableScale onPress={onPress} disabled={disabled} style={style} accessibilityLabel={sub ? `${label} ${sub}` : label} testID={testID}>
      <View style={[styles.btn, { backgroundColor: bg[tone], borderColor: tone === 'dark' ? colors.panelBorder : 'transparent' }]}>
        <Text style={[styles.label, { color: fg[tone] }]} numberOfLines={1}>
          {label}
        </Text>
        {sub ? <Text style={[styles.sub, { color: fg[tone] }]}>{sub}</Text> : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  btn: { minHeight: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, borderWidth: 1 },
  label: { fontFamily: fonts.bold, fontSize: 16, letterSpacing: 0.8 },
  sub: { fontFamily: fonts.semibold, fontSize: 12, opacity: 0.85, fontVariant: ['tabular-nums'] },
});
