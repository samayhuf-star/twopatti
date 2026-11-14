import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { PlayingCard } from '../components/PlayingCard';
import { PressableScale } from '../components/PressableScale';
import { colors, fonts } from '../theme';

const STEPS = [
  {
    title: 'Centre mode',
    body: 'Everyone gets two cards. One shared card sits face down in the middle. After the first betting round it opens and becomes everyone\u2019s third card. Then a second betting round starts.',
    example: 'You hold K♥ Q♥. Centre opens as A♥ → you have a flush.',
    mode: 'centre' as const,
  },
  {
    title: 'Imaginary mode',
    body: 'No shared card. The game automatically picks the single best third card for your two cards only. It never uses a card you already hold. Both of your real cards always stay in your hand.',
    example: 'You hold A♠ K♠. Imaginary completion picks Q♠ → you have a straight flush.',
    mode: 'imaginary' as const,
  },
  {
    title: 'Blind vs Seen',
    body: 'Stay blind and bet cheaper. Look at any time for free, but once seen you stay seen and bet double. Win while still blind and the house adds 10% of the pot to your chips.',
    example: 'Blind bet costs the current blind. Seen bet costs double.',
    mode: 'both' as const,
  },
];

export default function Tutorial() {
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.top}>
        <PressableScale onPress={() => router.back()} accessibilityLabel="Close tutorial">
          <View style={styles.iconBtn}>
            <Ionicons name="close" size={20} color={colors.ink} />
          </View>
        </PressableScale>
        <Text style={styles.title}>How 2 Patti works</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.progress}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotOn]} />
          ))}
        </View>
        <Text style={styles.stepTitle}>{s.title}</Text>
        <Text style={styles.body}>{s.body}</Text>

        <View style={styles.cardRow}>
          <PlayingCard card={{ rank: 13, suit: 'H' }} faceUp width={56} />
          <PlayingCard card={{ rank: 12, suit: 'H' }} faceUp width={56} />
          {s.mode === 'centre' && <PlayingCard card={{ rank: 14, suit: 'H' }} faceUp width={56} />}
          {s.mode === 'imaginary' && <PlayingCard card={{ rank: 12, suit: 'S' }} faceUp imaginary width={56} />}
        </View>

        <View style={styles.example}>
          <Text style={styles.exampleText}>{s.example}</Text>
        </View>

        <View style={styles.nav}>
          {step > 0 && (
            <Button style={{ flex: 1 }} label="BACK" tone="dark" onPress={() => setStep(step - 1)} />
          )}
          <Button
            style={{ flex: 2 }}
            label={last ? 'GOT IT' : 'NEXT'}
            onPress={() => (last ? router.back() : setStep(step + 1))}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.charcoal },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.panel, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.panelBorder },
  title: { fontFamily: fonts.bold, fontSize: 20, color: colors.ink },
  scroll: { padding: 16, gap: 16, paddingBottom: 40 },
  progress: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.panelBorder },
  dotOn: { backgroundColor: colors.goldSoft, width: 24 },
  stepTitle: { fontFamily: fonts.black, fontSize: 26, color: colors.ink, textAlign: 'center' },
  body: { fontFamily: fonts.regular, fontSize: 16, color: colors.ink, lineHeight: 24, textAlign: 'center' },
  cardRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 12 },
  example: { backgroundColor: colors.panel, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.goldDark },
  exampleText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.goldSoft, textAlign: 'center' },
  nav: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
