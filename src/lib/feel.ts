import * as Haptics from 'expo-haptics';

let enabled = true;
export function setHapticsEnabled(on: boolean) {
  enabled = on;
}

const safe = (p: Promise<void>) => p.catch(() => {});

export const feel = {
  light: () => enabled && safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  medium: () => enabled && safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  heavy: () => enabled && safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
  select: () => enabled && safe(Haptics.selectionAsync()),
  success: () => enabled && safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => enabled && safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
};
