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
  /** Deal flight: start offset relative to the final position, and a stagger delay. */
  dealFrom?: { x: number; y: number };
  dealDelay?: number;
  /** Rendered as an imaginary card: dashed edge, rank only, no suit. */
  imaginary?: boolean;
  dim?: boolean;
  rotate?: number;
  /** Slow, dramatic flip for the centre reveal. */
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
    // Deal runs once per mount (each hand remounts its cards).
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
  return (
    <Animated.View style={[{ width, height }, anim, dim && { opacity: 0.45 }]} accessible accessibilityLabel={showFace ? cardLabel(card) : 'Face-down card'}>
      {showFace && imaginary ? (
        <View style={[styles.face, styles.imaginary, { borderRadius: width * 0.08 }]}>
          <Text style={[styles.rank, { fontSize: width * 0.38, color: red ? colors.red : colors.black }]}>{rankLabel(card.rank)}</Text>
          <Text style={[styles.suit, { fontSize: width * 0.42, color: red ? colors.red : colors.black }, styles.imgSuit]}>{SUIT_SYMBOL[card.suit]}</Text>
        </View>
      ) : (
        <View style={styles.shadow}>
          <Image source={showFace ? cardFace(card) : CARD_BACK} style={{ width, height }} contentFit="fill" transition={0} />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    flex: 1,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  face: { flex: 1, backgroundColor: colors.ivory, alignItems: 'center', justifyContent: 'center' },
  imaginary: { borderStyle: 'dashed', borderColor: colors.goldSoft, borderWidth: 2, backgroundColor: '#EFE6CC' },
  rank: { fontFamily: fonts.bold, lineHeight: undefined },
  suit: { marginTop: -4 },
  imgSuit: { opacity: 0.45 },
});
