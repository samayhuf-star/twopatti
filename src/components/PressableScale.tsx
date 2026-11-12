import { ReactNode } from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';
import { feel } from '../lib/feel';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  haptic?: boolean;
  accessibilityLabel?: string;
  testID?: string;
};

export function PressableScale({ children, onPress, style, disabled, haptic = true, accessibilityLabel, testID }: Props) {
  const reduce = useReducedMotion();
  const s = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      testID={testID}
      disabled={disabled}
      onPressIn={() => {
        // Reanimated shared values are mutated by design.
        // eslint-disable-next-line react-hooks/immutability
        if (!reduce) s.value = withSpring(0.95, { damping: 18, stiffness: 400 });
      }}
      onPressOut={() => {
        // eslint-disable-next-line react-hooks/immutability
        s.value = withSpring(1, { damping: 14, stiffness: 300 });
      }}
      onPress={() => {
        if (haptic) feel.select();
        onPress?.();
      }}
      style={[style, anim, disabled && { opacity: 0.4 }]}>
      {children}
    </AnimatedPressable>
  );
}
