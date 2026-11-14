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
import { Card, SUIT_SYMBOL, rankLabel } from '../engine';
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
  const height = Math.round(width * 1.4);
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
  const r = width * 0.14;

  return (
    <Animated.View style={[{ width, height }, anim, dim && { opacity: 0.45 }]}>
      {showFace ? (
        <View style={[styles.face, imaginary && styles.imaginary, { borderRadius: r }]}>
          <View style={styles.faceInner}>
            <Text style={[styles.rank, { fontSize: width * 0.36, color: red ? colors.red : colors.black }]}>{rankLabel(card.rank)}</Text>
            <Text style={[styles.suit, { fontSize: width * 0.4, color: red ? colors.red : colors.black }, imaginary && styles.imgSuit]}>
              {SUIT_SYMBOL[card.suit]}
            </Text>
          </View>
        </View>
      ) : (
        <View style={[styles.back, { borderRadius: r }]}>
          <View style={[styles.backInner, { borderRadius: r * 0.7 }]}>
            <View style={[styles.medallion, { width: width * 0.42, height: width * 0.42, borderRadius: width * 0.21 }]}>
              <Text style={[styles.backMark, { fontSize: width * 0.22 }]}>2</Text>
            </View>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  face: {
    flex: 1,
    backgroundColor: '#FAF6EE',
    borderWidth: 1.5,
    borderColor: colors.gold,
    padding: 2,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  faceInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(212,175,106,0.4)',
    borderRadius: 6,
  },
  imaginary: { borderStyle: 'dashed', borderColor: colors.goldSoft, borderWidth: 2, backgroundColor: '#F5EDD8' },
  rank: { fontFamily: fonts.bold },
  suit: { marginTop: -2 },
  imgSuit: { opacity: 0.5 },
  back: {
    flex: 1,
    backgroundColor: '#0F1A2E',
    borderWidth: 1.5,
    borderColor: colors.gold,
    padding: 3,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  backInner: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(212,175,106,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#162036',
  },
  medallion: {
    borderWidth: 1.5,
    borderColor: colors.goldSoft,
    backgroundColor: 'rgba(212,175,106,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backMark: { fontFamily: fonts.black, color: colors.goldSoft },
});
