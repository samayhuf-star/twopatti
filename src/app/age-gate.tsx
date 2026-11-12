import { Image } from 'expo-image';
import { useState } from 'react';
import { BackHandler, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { CHIP_DISCLAIMER } from '../lib/config';
import { useStore } from '../lib/store';
import { colors, fonts } from '../theme';

/** First-launch 18+ gate (spec sections 1 and 12). Shown before the lobby. */
export default function AgeGate() {
  const { confirmAge } = useStore();
  const [under, setUnder] = useState(false);
  return (
    <View style={styles.root}>
      <Image source={require('../../assets/casino-bg.jpg')} style={StyleSheet.absoluteFill} contentFit="cover" />
      <SafeAreaView style={styles.safe}>
        <Text style={styles.word}>2 PATTI</Text>
        <Text style={styles.tag}>Two cards. One table. Your best third card.</Text>
        <View style={styles.card}>
          {under ? (
            <>
              <Text style={styles.h}>Sorry, 2 Patti is for adults</Text>
              <Text style={styles.p}>You must be 18 or older to play. Please close the app.</Text>
              {Platform.OS === 'android' && <Button label="CLOSE" tone="dark" onPress={() => BackHandler.exitApp()} />}
            </>
          ) : (
            <>
              <Text style={styles.h}>Are you 18 or older?</Text>
              <Text style={styles.p}>2 Patti is a social card game for adults 18+. It uses virtual chips only.</Text>
              <Text style={styles.small}>{CHIP_DISCLAIMER} No real-money gambling, no prizes.</Text>
              <View style={{ gap: 10, marginTop: 6 }}>
                <Button label="I AM 18 OR OLDER" onPress={confirmAge} testID="age-yes" />
                <Button label="I AM UNDER 18" tone="dark" onPress={() => setUnder(true)} testID="age-no" />
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.charcoal },
  safe: { flex: 1, justifyContent: 'center', padding: 24 },
  word: { fontFamily: fonts.black, fontSize: 52, color: colors.ink, textAlign: 'center', letterSpacing: 2 },
  tag: { fontFamily: fonts.medium, fontSize: 15, color: colors.goldSoft, textAlign: 'center', marginBottom: 28 },
  card: { backgroundColor: 'rgba(26,29,34,0.92)', borderRadius: 18, borderWidth: 1, borderColor: colors.panelBorder, padding: 20, gap: 10 },
  h: { fontFamily: fonts.bold, fontSize: 22, color: colors.ink },
  p: { fontFamily: fonts.regular, fontSize: 15, color: colors.ink, lineHeight: 21 },
  small: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, lineHeight: 18 },
});
