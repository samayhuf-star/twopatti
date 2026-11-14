import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Card, SUIT_SYMBOL, cardLabel, rankLabel } from '../engine';
import { CARD_BACK, CARD_RATIO, cardFace } from '../lib/art';
import { colors, fonts } from '../theme';

type Props = {
  card?: Card | null;
  faceUp: boolean;
  width?: number;
  dealFrom?: { x: number; y: number };
  dealDelay?: number;
  imaginary?: boolean;
  dim?: boolean;
  rotate?: number;
  slowFlip?: boolean;
  onDealt?: () => void;
};

export function PlayingCard({ card, faceUp, width = 44, dealFrom, dealDelay = 0, imaginary, dim, rotate = 0, slowFlip, onDealt }: Props) {
  const reduce = useReducedMotion();
  const height = Math.round(width * CARD_RATIO);
  const tx = useSharedValue(reduce || !dealFrom ? 0 : dealFrom.x);
  const ty = useSharedValue(reduce || !dealFrom ? 0 : dealFrom.y);
  const op = useSharedValue(reduce || !dealFrom ? 1 : 0);
  const flip = useSharedValue(1);
  const firstFace = useRef(faceUp);

  useEffect(() => {
    if (!dealFrom) return;
    if (reduce) {
      onDealt?.();
      return;
    }
    const t = { duration: 320, easing: Easing.out(Easing.cubic) };
    op.value = withDelay(dealDelay, withTiming(1, { duration: 120 }));
    tx.value = withDelay(dealDelay, withTiming(0, t));
    ty.value = withDelay(dealDelay, withTiming(0, t));
    const id = setTimeout(() => onDealt?.(), dealDelay);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (firstFace.current === faceUp) return;
    firstFace.current = faceUp;
    if (reduce) return;
    const d = slowFlip ? 380 : 160;
    flip.value = withSequence(withTiming(0, { duration: 0 }), withTiming(1, { duration: d, easing: Easing.out(Easing.back(1.4)) }));
  }, [faceUp, reduce, slowFlip, flip]);

  const anim = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { rotate: `${rotate}deg` }, { scaleX: Math.max(0.02, flip.value) }],
  }));

  const red = card && (card.suit === 'H' || card.suit === 'D');
  const showFace = faceUp && card;
  const r = width * 0.16;

  return (
    <Animated.View style={[{ width, height }, anim, dim && { opacity: 0.45 }]}>
      {showFace ? (
        <View style={[styles.face, imaginary && styles.imaginary, { borderRadius: r }]}>
          <View style={[styles.corner, { top: 3, left: 4 }]}>
            <Text style={[styles.cornerRank, { fontSize: width * 0.22, color: red ? colors.red : colors.black }]}>{rankLabel(card.rank)}</Text>
            <Text style={[styles.cornerSuit, { fontSize: width * 0.18, color: red ? colors.red : colors.black }]}>{SUIT_SYMBOL[card.suit]}</Text>
          </View>
          <View style={styles.center}>
            <Text style={[styles.centerSuit, { fontSize: width * 0.52, color: red ? colors.red : colors.black }, imaginary && styles.imgSuit]}>
              {SUIT_SYMBOL[card.suit]}
            </Text>
          </View>
          <View style={[styles.corner, styles.cornerBR, { bottom: 3, right: 4 }]}>
            <Text style={[styles.cornerRank, { fontSize: width * 0.22, color: red ? colors.red : colors.black }]}>{rankLabel(card.rank)}</Text>
            <Text style={[styles.cornerSuit, { fontSize: width * 0.18, color: red ? colors.red : colors.black }]}>{SUIT_SYMBOL[card.suit]}</Text>
          </View>
        </View>
      ) : (
        <View style={[styles.back, { borderRadius: r }]}>
          <View style={[styles.backInner, { borderRadius: r * 0.65 }]}>
            <View style={[styles.ornate, { width: width * 0.55, height: width * 0.55, borderRadius: width * 0.12 }]}>
              <View style={[styles.innerOrnate, { borderRadius: width * 0.08 }]}>
                <Text style={[styles.backMark, { fontSize: width * 0.28 }]}>2</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    flex: 1,
    backgroundColor: '#FBF7EF',
    borderWidth: 1.5,
    borderColor: colors.gold,
    padding: 1,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  imaginary: { borderStyle: 'dashed', borderColor: colors.goldSoft, borderWidth: 2, backgroundColor: '#F3EAD4' },
  corner: { position: 'absolute', alignItems: 'center' },
  cornerBR: { transform: [{ rotate: '180deg' }] },
  cornerRank: { fontFamily: fonts.bold, lineHeight: undefined },
  cornerSuit: { marginTop: -2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerSuit: { textAlign: 'center' },
  imgSuit: { opacity: 0.45 },
  back: {
    flex: 1,
    backgroundColor: '#0C1526',
    borderWidth: 1.5,
    borderColor: colors.gold,
    padding: 3,
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  backInner: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(212,175,106,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121C32',
  },
  ornate: {
    borderWidth: 1.5,
    borderColor: colors.goldSoft,
    backgroundColor: 'rgba(212,175,106,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  innerOrnate: {
    flex: 1,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.goldDark,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  backMark: { fontFamily: fonts.black, color: colors.goldSoft },
});
