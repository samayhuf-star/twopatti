import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts, formatChips } from '../theme';

type Props = {
  name: string;
  isBot: boolean;
  chips: number;
  badge: 'Blind' | 'Seen' | 'Folded' | null;
  active: boolean;
  winner: boolean;
  dim: boolean;
  lastAction?: string | null;
  size?: number;
};

export function Seat({ name, isBot, chips, badge, active, winner, dim, lastAction, size = 56 }: Props) {
  const reduce = useReducedMotion();
  const ring = useSharedValue(0);
  const crown = useSharedValue(0);

  useEffect(() => {
    if (active && !reduce) {
      ring.value = withRepeat(withSequence(withTiming(1, { duration: 700 }), withTiming(0.3, { duration: 700 })), -1, true);
    } else {
      ring.value = withTiming(active ? 1 : 0, { duration: 150 });
    }
  }, [active, reduce, ring]);

  useEffect(() => {
    crown.value = winner ? (reduce ? withTiming(1, { duration: 150 }) : withSpring(1, { damping: 8, stiffness: 160 })) : 0;
  }, [winner, reduce, crown]);

  const ringStyle = useAnimatedStyle(() => ({ opacity: ring.value }));
  const crownStyle = useAnimatedStyle(() => ({ opacity: crown.value, transform: [{ scale: 0.4 + crown.value * 0.6 }, { translateY: (1 - crown.value) * 10 }] }));
  const initials = isBot ? name.replace('Bot ', 'B') : 'YOU';

  return (
    <View style={[styles.wrap, dim && { opacity: 0.45 }]} accessibilityLabel={`${name}${isBot ? ', computer player' : ''}, ${formatChips(chips)} chips${badge ? `, ${badge}` : ''}`}>
      <Animated.Text style={[styles.crown, crownStyle]}>👑</Animated.Text>
      <View style={{ width: size + 12, height: size + 12, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={[styles.ring, { width: size + 12, height: size + 12, borderRadius: (size + 12) / 2 }, ringStyle]} />
        {winner && <View style={[styles.winRing, { width: size + 12, height: size + 12, borderRadius: (size + 12) / 2 }]} />}
        <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }, !isBot && styles.you]}>
          <View style={styles.innerGlow} />
          <Text style={[styles.initials, { fontSize: isBot ? size * 0.28 : size * 0.22 }]}>{initials}</Text>
        </View>
        {isBot && (
          <View style={styles.botTag}>
            <Text style={styles.botTagText}>BOT</Text>
          </View>
        )}
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.chips}>{formatChips(chips)}</Text>
      {badge && (
        <View style={[styles.badge, badge === 'Folded' && styles.badgeFold]}>
          <Text style={[styles.badgeText, badge === 'Folded' && { color: colors.muted }]}>{badge}</Text>
        </View>
      )}
      {lastAction ? <Text style={styles.action}>{lastAction}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', width: 100 },
  crown: { fontSize: 22, height: 26, marginBottom: -2 },
  ring: { position: 'absolute', borderWidth: 2.5, borderColor: colors.goldSoft },
  winRing: { position: 'absolute', borderWidth: 3, borderColor: colors.highlight, shadowColor: colors.goldSoft, shadowOpacity: 0.85, shadowRadius: 12 },
  avatar: { backgroundColor: colors.panel, borderWidth: 2, borderColor: colors.goldDark, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  you: { backgroundColor: colors.feltEdge, borderColor: colors.gold },
  innerGlow: { position: 'absolute', top: -8, width: '70%', height: '40%', borderRadius: 40, backgroundColor: 'rgba(240,212,138,0.12)' },
  initials: { fontFamily: fonts.bold, color: colors.ink, letterSpacing: 0.5 },
  botTag: { position: 'absolute', bottom: -1, right: -2, backgroundColor: colors.black, borderRadius: 7, paddingHorizontal: 5, paddingVertical: 1, borderWidth: 1, borderColor: colors.goldDark },
  botTagText: { fontFamily: fonts.bold, fontSize: 9, color: colors.goldSoft, letterSpacing: 0.7 },
  name: { marginTop: 4, fontFamily: fonts.semibold, color: colors.ink, fontSize: 13 },
  chips: { fontFamily: fonts.bold, color: colors.goldSoft, fontSize: 13, fontVariant: ['tabular-nums'] },
  badge: { marginTop: 4, borderWidth: 1, borderColor: colors.gold, backgroundColor: 'rgba(14,16,20,0.92)', borderRadius: 9, paddingHorizontal: 8, paddingVertical: 2 },
  badgeFold: { borderColor: colors.panelBorder },
  badgeText: { fontFamily: fonts.semibold, color: colors.goldSoft, fontSize: 11 },
  action: { marginTop: 2, fontFamily: fonts.medium, color: colors.warm, fontSize: 11 },
});
