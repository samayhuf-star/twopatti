import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PressableScale } from '../components/PressableScale';
import { AGE_NOTICE, CHIP_DISCLAIMER, PRIVACY_URL, SUPPORT_URL, TERMS_URL } from '../lib/config';
import { useStore } from '../lib/store';
import { colors, fonts } from '../theme';

function Row({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} accessibilityLabel={label}>
      <View style={styles.row}>
        <Text style={styles.rowText}>{label}</Text>
        <Ionicons name="open-outline" size={18} color={colors.muted} />
      </View>
    </PressableScale>
  );
}

export default function Settings() {
  const store = useStore();
  const open = (url: string) => WebBrowser.openBrowserAsync(url).catch(() => {});
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.top}>
        <PressableScale onPress={() => router.back()} accessibilityLabel="Back">
          <View style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={20} color={colors.ink} />
          </View>
        </PressableScale>
        <Text style={styles.title}>Settings</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.row}>
          <Text style={styles.rowText}>Vibration</Text>
          <Switch value={store.haptics} onValueChange={store.setHaptics} trackColor={{ true: colors.felt }} accessibilityLabel="Vibration" />
        </View>
        <Text style={styles.note}>Large animations follow your device’s Reduce Motion setting.</Text>

        <Text style={styles.section}>Legal</Text>
        <Row label="Privacy Policy" onPress={() => open(PRIVACY_URL)} />
        <Row label="Terms of Use" onPress={() => open(TERMS_URL)} />
        <Row label="Support" onPress={() => open(SUPPORT_URL)} />

        <Text style={styles.section}>About</Text>
        <Text style={styles.note}>{AGE_NOTICE}</Text>
        <Text style={styles.note}>{CHIP_DISCLAIMER}</Text>
        <Text style={styles.note}>Your chips and settings are stored only on this device. Hands played: {store.handsPlayed}.</Text>
        <Text style={styles.note}>
          2 Patti {Constants.expoConfig?.version ?? ''}. © 2026 Samay Vashsht.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.charcoal },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.panel, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.panelBorder },
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.ink },
  scroll: { padding: 16, gap: 10, paddingBottom: 48 },
  section: { fontFamily: fonts.bold, fontSize: 14, color: colors.goldSoft, marginTop: 14, letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.panel, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1, borderColor: colors.panelBorder },
  rowText: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
  note: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, lineHeight: 19 },
});
