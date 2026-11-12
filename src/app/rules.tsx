import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PressableScale } from '../components/PressableScale';
import { CHIP_DISCLAIMER } from '../lib/config';
import { colors, fonts } from '../theme';

const RANKING: [string, string][] = [
  ['Three of a Kind', 'Three cards of one rank. AAA is best, 222 is lowest.'],
  ['Straight Flush', 'Three in a row, same suit. A-2-3 is the highest, then A-K-Q, K-Q-J down to 4-3-2.'],
  ['Straight', 'Three in a row, mixed suits. Same order: A-2-3 first, then A-K-Q.'],
  ['Flush', 'Three of one suit, not in a row. Compare high card, then middle, then low.'],
  ['Pair', 'Two of one rank. Higher pair wins, then the kicker.'],
  ['High Card', 'None of the above. Compare high, middle, then low.'],
];

function H({ children }: { children: string }) {
  return <Text style={styles.h}>{children}</Text>;
}
function P({ children }: { children: string }) {
  return <Text style={styles.p}>{children}</Text>;
}

export default function Rules() {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.top}>
        <PressableScale onPress={() => router.back()} accessibilityLabel="Back">
          <View style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={20} color={colors.ink} />
          </View>
        </PressableScale>
        <Text style={styles.title}>How to play</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <P>2 Patti is a two-card game inspired by Teen Patti. Everyone gets two cards. The third card comes from the table mode, and the best three-card hand wins the pot.</P>

        <H>Two modes</H>
        <P>Centre: one card is set aside face down. After the first betting round, if two or more players are still in, it opens and becomes everyone’s third card. Then a second betting round starts.</P>
        <P>Imaginary: there is no centre card. Your third card is the best card for your own two cards, and the game picks it for you. Both of your real cards always stay in your hand.</P>

        <H>Hand ranking, best first</H>
        {RANKING.map(([name, d], i) => (
          <View key={name} style={styles.rankRow}>
            <Text style={styles.rankNo}>{i + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.rankName}>{name}</Text>
              <Text style={styles.rankDesc}>{d}</Text>
            </View>
          </View>
        ))}
        <View style={styles.callout}>
          <Text style={styles.calloutText}>A-2-3 is the highest straight in 2 Patti, above A-K-Q. There is no wrap-around such as K-A-2.</Text>
        </View>

        <H>Ties</H>
        <P>Hands never split. If two hands are equal, suits decide using your own two real cards: Spades, then Hearts, then Diamonds, then Clubs. Compare the suit of your higher card first, then the other card. The centre card and the imaginary card never break a tie.</P>

        <H>Betting</H>
        <P>Everyone posts the ante (100 at Silver). Every bet is a multiple of the ante. The current blind starts at the ante.</P>
        <P>Blind (cards not seen): bet the current blind, or raise to double it.</P>
        <P>Seen (cards seen): bet double the current blind, or raise to four times it.</P>
        <P>A raise can never be more than the pot. Reaching the pot cap (12,800 at Silver) shows every hand still in.</P>

        <H>Playing blind</H>
        <P>You can keep your cards face down and bet at the cheaper blind rate. You can look at any time for free, but once seen you stay seen. You can stay blind for up to 4 of your own bets. After that you must see. At Silver a blind bet can never be more than 800.</P>
        <P>Blind Win bonus: if you win the pot while still blind, the house adds 10% of the pot to your chips. It never comes from other players and never changes the cards.</P>

        <H>Fold and show</H>
        <P>Fold to drop out. Chips already in the pot stay there. When only two players are left, you can pay for a show: seen players pay double the current blind, blind players pay the current blind. Both hands open and the best hand wins.</P>

        <H>Computer players</H>
        <P>Every opponent at this table is a computer player, marked BOT.</P>

        <H>Chips</H>
        <P>{`${CHIP_DISCLAIMER} 2 Patti is for adults 18+ and is for entertainment only.`}</P>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.charcoal },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.panel, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.panelBorder },
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.ink },
  scroll: { padding: 16, paddingBottom: 48, gap: 8 },
  h: { fontFamily: fonts.bold, fontSize: 18, color: colors.goldSoft, marginTop: 12 },
  p: { fontFamily: fonts.regular, fontSize: 15, color: colors.ink, lineHeight: 22 },
  rankRow: { flexDirection: 'row', gap: 10, backgroundColor: colors.panel, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: colors.panelBorder },
  rankNo: { fontFamily: fonts.bold, fontSize: 18, color: colors.gold, width: 18 },
  rankName: { fontFamily: fonts.semibold, fontSize: 15, color: colors.ink },
  rankDesc: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, lineHeight: 18 },
  callout: { backgroundColor: colors.feltEdge, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: colors.green },
  calloutText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },
});
