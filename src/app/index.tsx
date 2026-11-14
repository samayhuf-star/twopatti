import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { PressableScale } from '../components/PressableScale';
import { Mode, SILVER, TIERS } from '../engine';
import { AGE_NOTICE, CHIP_DISCLAIMER } from '../lib/config';
import { nextDaily } from '../lib/daily';
import { feel } from '../lib/feel';
import { useStore } from '../lib/store';
import { colors, fonts, formatChips } from '../theme';

function Segment<T extends string | number>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={styles.segment}>
      {options.map(o => {
        const on = o.value === value;
        return (
          <PressableScale key={String(o.value)} style={{ flex: 1 }} onPress={() => onChange(o.value)} accessibilityLabel={o.label}>
            <View style={[styles.segItem, on && styles.segOn]}>
              <Text style={[styles.segText, on && { color: colors.ink }]}>{o.label}</Text>
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}

export default function Lobby() {
  const store = useStore();
  const [mode, setMode] = useState<Mode>('imaginary');
  const [seats, setSeats] = useState<4 | 5>(5);
  const [toast, setToast] = useState<string | null>(null);
  const daily = nextDaily(store.lastDaily);
  const canSit = store.balance >= SILVER.minToSit;

  const flash = (t: string) => {
    setToast(t);
    setTimeout(() => setToast(null), 2200);
  };

  return (
    <View style={styles.root}>
      <Image source={require('../../assets/casino-bg.jpg')} style={StyleSheet.absoluteFill} contentFit="cover" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <View style={styles.top}>
          <View style={styles.balance} accessibilityLabel={`Balance ${formatChips(store.balance)} chips`}>
            <View style={styles.chipIcon} />
            <Text style={styles.balanceText}>{formatChips(store.balance)}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <PressableScale onPress={() => router.push('/rules')} accessibilityLabel="How to play">
              <View style={styles.iconBtn}>
                <Ionicons name="book-outline" size={20} color={colors.ink} />
              </View>
            </PressableScale>
            <PressableScale onPress={() => router.push('/settings')} accessibilityLabel="Settings">
              <View style={styles.iconBtn}>
                <Ionicons name="settings-outline" size={20} color={colors.ink} />
              </View>
            </PressableScale>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.word}>2 PATTI</Text>
          <Text style={styles.sub}>Premium Card Table</Text>

          <PressableScale
            disabled={!daily.available}
            onPress={() => {
              const got = store.claimDaily();
              if (got) {
                feel.success();
                flash(`Daily bonus +${formatChips(got)} chips`);
              }
            }}
            accessibilityLabel="Daily bonus">
            <View style={styles.daily}>
              <Ionicons name="calendar-outline" size={18} color={colors.goldSoft} />
              <Text style={styles.dailyText}>
                {daily.available ? `DAILY BONUS  +${formatChips(daily.amount)}` : 'DAILY BONUS CLAIMED. COME BACK TOMORROW'}
              </Text>
            </View>
          </PressableScale>

          <Segment
            options={[
              { value: 'centre', label: 'Centre' },
              { value: 'imaginary', label: 'Imaginary' },
            ]}
            value={mode}
            onChange={m => setMode(m)}
          />
          <Text style={styles.modeHint}>
            {mode === 'centre'
              ? 'One shared centre card opens after the first betting round.'
              : 'No centre card. Your best third card is picked for you.'}
          </Text>

          <View style={styles.row}>
            <View style={[styles.pill, styles.pillOn]}>
              <Ionicons name="desktop-outline" size={16} color={colors.ink} />
              <Text style={styles.pillText}>Computer</Text>
            </View>
            <View style={styles.pill}>
              <Ionicons name="globe-outline" size={16} color={colors.muted} />
              <Text style={[styles.pillText, { color: colors.muted }]}>Online soon</Text>
            </View>
          </View>

          <Segment
            options={[
              { value: 4, label: '4 seats' },
              { value: 5, label: '5 seats (max)' },
            ]}
            value={seats}
            onChange={v => setSeats(v)}
          />

          <View style={styles.grid}>
            {TIERS.map(t => {
              const open = t.id === SILVER.id;
              return (
                <View key={t.id} style={[styles.tier, !open && { opacity: 0.55 }]}>
                  <Text style={styles.tierName}>{t.name.toUpperCase()}</Text>
                  <Text style={styles.tierAnte}>ANTE {t.ante >= 1000 ? `${t.ante / 1000}K` : t.ante}</Text>
                  <Text style={styles.tierMin}>Min {formatChips(t.minToSit)}</Text>
                  <Text style={styles.tierMin}>Blind cap {formatChips(t.blindCap)}</Text>
                  {open ? (
                    <Button
                      label="SIT"
                      tone="green"
                      disabled={!canSit}
                      style={{ marginTop: 10, alignSelf: 'stretch' }}
                      testID="sit-silver"
                      onPress={() => router.push({ pathname: '/table', params: { mode, seats: String(seats) } })}
                    />
                  ) : (
                    <View style={styles.soon}>
                      <Ionicons name="lock-closed" size={13} color={colors.muted} />
                      <Text style={styles.soonText}>Coming soon</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {!canSit && (
            <View style={styles.broke}>
              <Text style={styles.brokeText}>Need {formatChips(SILVER.minToSit - store.balance)} more chips to sit at Silver. Claim your daily bonus or wait for tomorrow.</Text>
            </View>
          )}

          <Text style={styles.legal}>
            {AGE_NOTICE} {CHIP_DISCLAIMER}
          </Text>
        </ScrollView>
      </SafeAreaView>
      {toast && (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.charcoal },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 6 },
  balance: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(14,16,20,0.92)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: colors.goldDark },
  chipIcon: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.feltHi, borderWidth: 2.5, borderColor: colors.goldSoft },
  balanceText: { fontFamily: fonts.bold, fontSize: 18, color: colors.goldSoft, fontVariant: ['tabular-nums'] },
  iconBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(14,16,20,0.92)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.panelBorder },
  scroll: { padding: 16, gap: 14, paddingBottom: 40 },
  word: { fontFamily: fonts.black, fontSize: 48, color: colors.ink, textAlign: 'center', letterSpacing: 3, marginTop: 4 },
  sub: { fontFamily: fonts.medium, fontSize: 13, color: colors.goldSoft, textAlign: 'center', letterSpacing: 1.5, marginTop: -6, marginBottom: 4 },
  daily: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(14,16,20,0.9)', borderRadius: 14, paddingVertical: 12, borderWidth: 1, borderColor: colors.goldDark },
  dailyText: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink, letterSpacing: 0.6 },
  segment: { flexDirection: 'row', backgroundColor: 'rgba(14,16,20,0.9)', borderRadius: 14, padding: 4, borderWidth: 1, borderColor: colors.panelBorder, gap: 4 },
  segItem: { paddingVertical: 11, borderRadius: 10, alignItems: 'center' },
  segOn: { backgroundColor: colors.feltHi, borderWidth: 1, borderColor: colors.goldSoft },
  segText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.muted },
  modeHint: { fontFamily: fonts.regular, fontSize: 13, color: colors.warm, textAlign: 'center', marginTop: -4 },
  row: { flexDirection: 'row', gap: 8 },
  pill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 12, backgroundColor: 'rgba(14,16,20,0.9)', borderWidth: 1, borderColor: colors.panelBorder },
  pillOn: { backgroundColor: colors.feltHi, borderColor: colors.goldSoft },
  pillText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tier: { width: '48%', flexGrow: 1, backgroundColor: 'rgba(14,16,20,0.94)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.goldDark, alignItems: 'center' },
  tierName: { fontFamily: fonts.bold, fontSize: 18, color: colors.ink, letterSpacing: 1.2 },
  tierAnte: { fontFamily: fonts.bold, fontSize: 14, color: colors.goldSoft },
  tierMin: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  soon: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12, paddingVertical: 12 },
  soonText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted },
  broke: { backgroundColor: 'rgba(122,36,48,0.4)', borderRadius: 14, padding: 14, gap: 8, borderWidth: 1, borderColor: colors.wine },
  brokeText: { fontFamily: fonts.medium, fontSize: 14, color: colors.ink, textAlign: 'center' },
  legal: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 17, marginTop: 8 },
  toast: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: colors.feltHi, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: colors.goldSoft },
  toastText: { fontFamily: fonts.bold, color: colors.ink, fontSize: 14 },
});
