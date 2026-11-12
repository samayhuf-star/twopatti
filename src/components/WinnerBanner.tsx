import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { colors, fonts, formatChips } from '../theme';

const CONFETTI = [colors.gold, colors.wine, colors.ivory, colors.green, colors.goldSoft, colors.navy];

function Confetto({ i }: { i: number }) {
  const y = useSharedValue(-20);
  const o = useSharedValue(1);
  useEffect(() => {
     
    y.value = withDelay(i * 25, withTiming(220 + (i % 5) * 30, { duration: 1300 }));
     
    o.value = withDelay(900 + i * 20, withTiming(0, { duration: 500 }));
  }, [i, y, o]);
  const st = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ translateY: y.value }, { rotate: `${i * 47}deg` }] }));
  return <Animated.View style={[styles.confetto, { left: `${(i * 37) % 100}%`, backgroundColor: CONFETTI[i % CONFETTI.length] }, st]} />;
}

/** Winner moment: title pop, pot amount, optional +10% Blind Win toast, light confetti. Reduce Motion: fade only, no confetti. */
export function WinnerBanner({ title, subtitle, pot, bonus, big }: { title: string; subtitle: string; pot: number; bonus: number; big: boolean }) {
  const reduce = useReducedMotion();
  const s = useSharedValue(reduce ? 1 : 0.6);
  const o = useSharedValue(0);
  const toast = useSharedValue(0);
  useEffect(() => {
     
    o.value = withTiming(1, { duration: reduce ? 150 : 200 });
     
    if (!reduce) s.value = withSequence(withSpring(1.08, { damping: 7, stiffness: 180 }), withSpring(1));
     
    if (bonus > 0) toast.value = withDelay(reduce ? 0 : 500, withTiming(1, { duration: 250 }));
  }, [reduce, bonus, o, s, toast]);
  const st = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ scale: s.value }] }));
  const tst = useAnimatedStyle(() => ({ opacity: toast.value, transform: [{ translateY: (1 - toast.value) * 8 }] }));
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {!reduce && Array.from({ length: big ? 28 : 14 }).map((_, i) => <Confetto key={i} i={i} />)}
      <Animated.View style={[styles.banner, st]}>
        <Text style={[styles.title, big && { fontSize: 30 }]}>{title}</Text>
        <Text style={styles.sub}>{subtitle}</Text>
        <Text style={styles.pot}>+{formatChips(pot)}</Text>
        {bonus > 0 && (
          <Animated.View style={[styles.toast, tst]}>
            <Text style={styles.toastText}>+10% Blind Win  +{formatChips(bonus)}</Text>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  confetto: { position: 'absolute', top: 60, width: 7, height: 11, borderRadius: 2 },
  banner: { position: 'absolute', top: '30%', alignSelf: 'center', alignItems: 'center', backgroundColor: 'rgba(20,22,26,0.88)', borderRadius: 16, paddingHorizontal: 22, paddingVertical: 14, borderWidth: 1, borderColor: colors.gold },
  title: { fontFamily: fonts.black, fontSize: 24, color: colors.highlight, letterSpacing: 1 },
  sub: { fontFamily: fonts.medium, fontSize: 14, color: colors.ink, marginTop: 2, textAlign: 'center' },
  pot: { fontFamily: fonts.bold, fontSize: 20, color: colors.goldSoft, marginTop: 4, fontVariant: ['tabular-nums'] },
  toast: { marginTop: 8, backgroundColor: colors.felt, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: colors.goldSoft },
  toastText: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink },
});
