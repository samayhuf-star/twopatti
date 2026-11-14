import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { colors, fonts, formatChips } from '../theme';

const CHIP_COLORS = [colors.wine, colors.feltHi, colors.ivory, colors.navy, colors.goldDark, colors.felt, colors.navy];

export function ChipPile({ amount, ante }: { amount: number; ante: number }) {
  const reduce = useReducedMotion();
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (reduce || amount === 0) return;
    pulse.value = withSequence(withTiming(1.15, { duration: 90 }), withSpring(1, { damping: 10, stiffness: 260 }));
  }, [amount, reduce, pulse]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const stacks = Math.min(7, Math.max(1, Math.ceil(amount / (ante * 6))));
  return (
    <View style={styles.wrap} accessibilityLabel={`Pot ${formatChips(amount)} chips`}>
      <Animated.View style={[styles.pile, anim]}>
        {amount > 0 &&
          Array.from({ length: stacks }).map((_, i) => (
            <View key={i} style={[styles.stack, { left: (i % 4) * 18 + (i >= 4 ? 9 : 0), top: i >= 4 ? 14 : 0 }]}>
              {Array.from({ length: 3 }).map((__, j) => (
                <View key={j} style={[styles.chip, { backgroundColor: CHIP_COLORS[(i + j) % CHIP_COLORS.length], bottom: j * 4.5 }]}>
                  <View style={styles.chipRing} />
                </View>
              ))}
            </View>
          ))}
      </Animated.View>
      <Text style={styles.pot}>POT {formatChips(amount)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  pile: { width: 80, height: 38 },
  stack: { position: 'absolute', width: 20, height: 24 },
  chip: {
    position: 'absolute',
    width: 20,
    height: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRing: { width: 10, height: 4, borderRadius: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
  pot: { marginTop: 8, fontFamily: fonts.bold, color: colors.goldSoft, fontSize: 15, letterSpacing: 0.8, fontVariant: ['tabular-nums'] },
});
