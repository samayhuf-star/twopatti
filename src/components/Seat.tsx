import { Image } from 'expo-image';
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
import { portraitFor } from '../lib/art';
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

/** Portrait, name, chip balance and Blind or Seen badge. Bots are always labelled as computer players. */
export function Seat({ name, isBot, chips, badge, active, winner, dim, lastAction, size = 56 }: Props) {
  const reduce = useReducedMotion();
  const ring = useSharedValue(0);
  const crown = useSharedValue(0);

  useEffect(() => {
    if (active && !reduce) {
       
      ring.value = withRepeat(withSequence(withTiming(1, { duration: 650 }), withTiming(0.35, { duration: 650 })), -1, true);
    } else {
       
      ring.value = withTiming(active ? 1 : 0, { duration: 150 });
    }
  }, [active, reduce, ring]);

  useEffect(() => {
     
    crown.value = winner ? (reduce ? withTiming(1, { duration: 150 }) : withSpring(1, { damping: 8, stiffness: 160 })) : 0;
  }, [winner, reduce, crown]);

  const ringStyle = useAnimatedStyle(() => ({ opacity: ring.value }));
  const crownStyle = useAnimatedStyle(() => ({ opacity: crown.value, transform: [{ scale: 0.4 + crown.value * 0.6 }, { translateY: (1 - crown.value) * 10 }] }));
  const portrait = isBot ? portraitFor(name) : undefined;

  return (
    <View style={[styles.wrap, dim && { opacity: 0.45 }]} accessibilityLabel={`${name}${isBot ? ', computer player' : ''}, ${formatChips(chips)} chips${badge ? `, ${badge}` : ''}`}>
      <Animated.Text style={[styles.crown, crownStyle]}>{'\u{1F451}'}</Animated.Text>
      <View style={{ width: size + 8, height: size + 8, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={[styles.ring, { width: size + 8, height: size + 8, borderRadius: (size + 8) / 2 }, ringStyle]} />
        {winner && <View style={[styles.winRing, { width: size + 8, height: size + 8, borderRadius: (size + 8) / 2 }]} />}
        <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }, !isBot && styles.you]}>
          {portrait ? (
            <Image source={portrait} style={{ width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }} contentFit="cover" transition={0} />
          ) : (
            <Text style={[styles.initials, { fontSize: isBot ? size * 0.32 : size * 0.26 }]}>{isBot ? name.slice(0, 1) : 'YOU'}</Text>
          )}
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
  wrap: { alignItems: 'center', width: 92 },
  crown: { fontSize: 22, height: 26, marginBottom: -4 },
  ring: { position: 'absolute', borderWidth: 3, borderColor: colors.goldSoft },
  winRing: { position: 'absolute', borderWidth: 3, borderColor: colors.highlight, shadowColor: colors.highlight, shadowOpacity: 0.9, shadowRadius: 12 },
  avatar: { backgroundColor: colors.panel, borderWidth: 2, borderColor: '#D9D4C7', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  you: { backgroundColor: colors.feltEdge, borderColor: colors.gold },
  initials: { fontFamily: fonts.bold, color: colors.ink, letterSpacing: 0.5 },
  botTag: { position: 'absolute', bottom: -1, right: -2, backgroundColor: 'rgba(20,22,26,0.85)', borderRadius: 5, paddingHorizontal: 3, opacity: 0.8 },
  botTagText: { fontFamily: fonts.semibold, fontSize: 8, color: colors.muted, letterSpacing: 0.5 },
  name: { marginTop: 2, fontFamily: fonts.semibold, color: colors.ink, fontSize: 14, textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 3 },
  chips: { fontFamily: fonts.bold, color: colors.ink, fontSize: 14, fontVariant: ['tabular-nums'], textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 3 },
  badge: { marginTop: 3, borderWidth: 1, borderColor: colors.gold, backgroundColor: 'rgba(26,29,34,0.85)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 1 },
  badgeFold: { borderColor: colors.panelBorder },
  badgeText: { fontFamily: fonts.semibold, color: colors.goldSoft, fontSize: 11 },
  action: { marginTop: 2, fontFamily: fonts.medium, color: colors.warm, fontSize: 11 },
});
