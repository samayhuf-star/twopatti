import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { colors, fonts, formatChips } from '../theme';

const CHIP_COLORS = [colors.wine, colors.felt, colors.ivory, colors.navy, colors.wine, colors.felt, colors.navy];

/** Pot chips in the middle of the felt; pulses when chips arrive. */
export function ChipPile({ amount, ante }: { amount: number; ante: number }) {
  const reduce = useReducedMotion();
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (reduce || amount === 0) return;
     
    pulse.value = withSequence(withTiming(1.12, { duration: 90 }), withSpring(1, { damping: 10, stiffness: 260 }));
  }, [amount, reduce, pulse]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const stacks = Math.min(7, Math.max(1, Math.ceil(amount / (ante * 6))));
  return (
    <View style={styles.wrap} accessibilityLabel={`Pot ${formatChips(amount)} chips`}>
      <Animated.View style={[styles.pile, anim]}>
        {amount > 0 &&
          Array.from({ length: stacks }).map((_, i) => (
            <View key={i} style={[styles.stack, { left: (i % 4) * 16 + (i >= 4 ? 8 : 0), top: i >= 4 ? 12 : 0 }]}>
              {Array.from({ length: 3 }).map((__, j) => (
                <View key={j} style={[styles.chip, { backgroundColor: CHIP_COLORS[(i + j) % CHIP_COLORS.length], bottom: j * 4 }]} />
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
  pile: { width: 74, height: 34 },
  stack: { position: 'absolute', width: 18, height: 22 },
  chip: { position: 'absolute', width: 18, height: 8, borderRadius: 9, borderWidth: 1.5, borderColor: colors.goldSoft },
  pot: { marginTop: 6, fontFamily: fonts.bold, color: colors.ink, fontSize: 14, letterSpacing: 0.6, fontVariant: ['tabular-nums'] },
});
