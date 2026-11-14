import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Ellipse, G, Path, Rect } from 'react-native-svg';
import { SPOTS, potStacks } from '../lib/pot';
import { colors, fonts, formatChips } from '../theme';

/** Red, green and white casino chips, as in the v4 table art. */
const CHIP = [
  { face: '#B3261E', edge: '#7E1A15', stripe: '#F4EFE6' },
  { face: '#1E7A43', edge: '#14552F', stripe: '#F4EFE6' },
  { face: '#EDE8DC', edge: '#B8B2A3', stripe: '#B3261E' },
];
const CW = 26; // chip width
const CT = 4.2; // chip thickness
const RY = 6.5; // chip top ellipse radius y

function Chip({ x, y, kind }: { x: number; y: number; kind: number }) {
  const c = CHIP[kind % CHIP.length];
  const rx = CW / 2;
  // Side band, then the top face with edge spots.
  return (
    <G>
      <Path d={`M${x - rx},${y} v${CT} a${rx},${RY} 0 0 0 ${CW},0 v${-CT} z`} fill={c.edge} />
      <Rect x={x - 2} y={y + RY - 0.5} width={4} height={CT} fill={c.stripe} opacity={0.9} />
      <Rect x={x - rx * 0.78} y={y + RY * 0.55} width={3} height={CT} fill={c.stripe} opacity={0.75} />
      <Rect x={x + rx * 0.78 - 3} y={y + RY * 0.55} width={3} height={CT} fill={c.stripe} opacity={0.75} />
      <Ellipse cx={x} cy={y} rx={rx} ry={RY} fill={c.face} />
      <Ellipse cx={x} cy={y} rx={rx} ry={RY} fill="none" stroke={c.stripe} strokeWidth={2.2} strokeDasharray="4 5.5" />
      <Ellipse cx={x} cy={y} rx={rx * 0.58} ry={RY * 0.58} fill="none" stroke={c.stripe} strokeOpacity={0.55} strokeWidth={0.8} />
    </G>
  );
}

/** Pot chips in the middle of the felt. Stacks grow with the pot and pulse when chips arrive. */
export function ChipPile({ amount, ante, label = 'POT' }: { amount: number; ante: number; label?: string }) {
  const reduce = useReducedMotion();
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (reduce || amount === 0) return;
    pulse.value = withSequence(withTiming(1.08, { duration: 90 }), withSpring(1, { damping: 10, stiffness: 260 }));
  }, [amount, reduce, pulse]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const stacks = potStacks(amount, ante);
  const W = 120;
  const H = 86;
  const baseY = H - RY - CT - 18;
  const order = stacks.map((n, i) => ({ n, i, spot: SPOTS[i] })).sort((a, b) => a.spot.y - b.spot.y);
  return (
    <View style={styles.wrap} accessibilityLabel={`${label} ${formatChips(amount)} chips`}>
      <Animated.View style={[{ width: W, height: H }, anim]}>
        <Svg width={W} height={H}>
          <Ellipse cx={W / 2} cy={baseY + RY + CT + 6} rx={52} ry={12} fill="#000" opacity={stacks.length ? 0.22 : 0} />
          {order.map(({ n, i, spot }) =>
            Array.from({ length: n }).map((_, j) => <Chip key={`${i}-${j}`} x={W / 2 + spot.x} y={baseY + spot.y + 10 - j * CT} kind={i + (j > 3 ? 1 : 0)} />),
          )}
        </Svg>
      </Animated.View>
      <Text style={styles.pot}>
        {label} {formatChips(amount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  pot: { marginTop: -6, fontFamily: fonts.bold, color: colors.ink, fontSize: 15, letterSpacing: 0.8, fontVariant: ['tabular-nums'], textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 3 },
});
