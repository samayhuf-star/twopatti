import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { ChipPile } from '../components/ChipPile';
import { PlayingCard } from '../components/PlayingCard';
import { PressableScale } from '../components/PressableScale';
import { Seat } from '../components/Seat';
import { WinnerBanner } from '../components/WinnerBanner';
import {
  Action,
  BotLevel,
  GameState,
  Mode,
  SILVER,
  TIERS,
  SeatInput,
  act,
  activePlayers,
  bestImaginary,
  chooseBotAction,
  describeMade,
  evaluateThree,
  legalActions,
  seeCards,
  startHand,
  tableConfig,
} from '../engine';
import { CHIP_DISCLAIMER } from '../lib/config';
import { feel } from '../lib/feel';
import { useStore } from '../lib/store';
import { lastActions, suitsDecided, winnerTitle } from '../lib/tableText';
import { colors, fonts, formatChips } from '../theme';

const HUMAN = 'you';
const DEAL_STEP = 90;
const BOT_LEVELS: BotLevel[] = ['tight', 'loose', 'medium', 'easy'];

/** Seat anchors as fractions of the felt, clockwise from the local player at the bottom. */
const LAYOUT: Record<4 | 5, { x: number; y: number }[]> = {
  5: [
    { x: 0.5, y: 0.83 },
    { x: 0.14, y: 0.56 },
    { x: 0.2, y: 0.17 },
    { x: 0.8, y: 0.17 },
    { x: 0.86, y: 0.56 },
  ],
  4: [
    { x: 0.5, y: 0.83 },
    { x: 0.14, y: 0.56 },
    { x: 0.5, y: 0.11 },
    { x: 0.86, y: 0.56 },
  ],
};

function makeSeats(humanChips: number, bots: number[]): SeatInput[] {
  return [
    { id: HUMAN, name: 'You', isBot: false, chips: humanChips },
    ...bots.map((c, i) => ({ id: `b${i + 1}`, name: `Bot ${i + 1}`, isBot: true, chips: c })),
  ];
}

function randomBotChips() {
  return 8_000 + Math.floor(Math.random() * 13) * 1_000;
}

export default function Table() {
  const params = useLocalSearchParams<{ mode?: string; seats?: string; tier?: string }>();
  const mode: Mode = params.mode === 'centre' ? 'centre' : 'imaginary';
  const seatCount: 4 | 5 = params.seats === '4' ? 4 : 5;
  const store = useStore();
  const tier = useMemo(() => TIERS.find(t => t.id === params.tier) ?? SILVER, [params.tier]);
  const config = useMemo(() => tableConfig(mode, tier), [mode, tier]);

  const [felt, setFelt] = useState({ w: 0, h: 0 });
  const [handNo, setHandNo] = useState(0);
  const [dealer, setDealer] = useState(seatCount - 1);
  const [dealing, setDealing] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [bannerOn, setBannerOn] = useState(false);
  const [game, setGame] = useState<GameState>(() =>
    startHand(config, makeSeats(store.balance, Array.from({ length: seatCount - 1 }, randomBotChips)), seatCount - 1, Math.random),
  );

  const human = game.players[0];
  const legal = legalActions(game);
  const humanTurn = game.phase === 'betting' && game.turn === 0;
  const actions = lastActions(game);

  useEffect(() => {
    store.setBalance(human.chips);
  }, [human.chips]);

  useEffect(() => {
    const total = (seatCount * 2 + (mode === 'centre' ? 1 : 0)) * DEAL_STEP + 350;
    const id = setTimeout(() => setDealing(false), total);
    return () => clearTimeout(id);
  }, [handNo, seatCount, mode]);

  const apply = useCallback((a: Action) => {
    setGame(g => {
      if (g.phase !== 'betting') return g;
      try {
        return act(g, a);
      } catch {
        return g;
      }
    });
  }, []);

  useEffect(() => {
    if (dealing || game.phase !== 'betting') return;
    const p = game.players[game.turn];
    if (!p.isBot) return;
    const humanOut = game.players[0].folded;
    const wait = humanOut ? 380 : 650 + Math.random() * 450;
    const id = setTimeout(() => {
      setGame(g => {
        if (g.phase !== 'betting' || g.turn !== game.turn) return g;
        const level = BOT_LEVELS[(g.turn - 1) % BOT_LEVELS.length];
        try {
          return act(g, chooseBotAction(g, level, Math.random));
        } catch {
          return act(g, { type: 'fold' });
        }
      });
    }, wait);
    return () => clearTimeout(id);
  }, [game, dealing]);

  const lastLogLen = useRef(0);
  useEffect(() => {
    const fresh = game.log.slice(lastLogLen.current);
    lastLogLen.current = game.log.length;
    for (const e of fresh) {
      if (e.type === 'centre') {
        feel.heavy();
        setTimeout(() => feel.success(), 250);
      } else if (e.type === 'bet' && e.playerId === HUMAN) (e.raise ? feel.heavy : feel.medium)();
      else if (e.type === 'see' && e.playerId === HUMAN) feel.medium();
      else if (e.type === 'fold' && e.playerId === HUMAN) feel.light();
      else if (e.type === 'win') {
        if (e.playerId === HUMAN) {
          feel.success();
          if (e.bonus > 0) setTimeout(() => feel.light(), 450);
        } else feel.warning();
      }
    }
  }, [game.log]);

  useEffect(() => {
    if (game.phase !== 'complete') return;
    store.countHand();
    if (game.result) {
      if (game.result.winnerId === HUMAN) {
        store.recordWin(game.result.pot, !game.players[0].seen);
      } else {
        store.recordLoss();
      }
    }
    const a = setTimeout(() => {
      setShowResult(true);
      setBannerOn(true);
    }, 500);
    const b = setTimeout(() => setBannerOn(false), 3200);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [game.phase]);

  useEffect(() => {
    if (humanTurn && !dealing) feel.medium();
  }, [humanTurn, dealing]);

  const nextHand = () => {
    const humanChips = game.players[0].chips;
    if (humanChips < tier.minToSit) {
      router.back();
      return;
    }
    const bots = game.players.slice(1).map(p => (p.chips < tier.minToSit * 2 ? randomBotChips() : p.chips));
    const d = (dealer + 1) % seatCount;
    lastLogLen.current = 0;
    setDealer(d);
    setShowResult(false);
    setBannerOn(false);
    setDealing(true);
    setGame(startHand(config, makeSeats(humanChips, bots), d, Math.random));
    setHandNo(n => n + 1);
  };

  const leave = () => router.back();

  const onFeltLayout = (e: LayoutChangeEvent) => setFelt({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });

  const anchors = LAYOUT[seatCount];
  const dealerPt = { x: felt.w * 0.5, y: felt.h * 0.02 };
  const n = seatCount;
  const dealIndex = (seat: number, round: number) => round * n + ((seat - dealer - 1 + n) % n);

  let myHand: { label: string; third: GameState['centre'] } | null = null;
  if (human.seen && !human.folded) {
    if (mode === 'imaginary') {
      const c = bestImaginary(human.hole, config.imaginaryCompletion);
      myHand = { label: describeMade(c.made), third: c.card };
    } else if (game.centreOpen && game.centre) {
      myHand = { label: describeMade(evaluateThree([...human.hole, game.centre])), third: null };
    }
  }

  const result = game.result;
  const shownIds = new Set(result?.shown.map(h => h.playerId) ?? []);
  const banner = result ? winnerTitle(game, HUMAN) : null;

  return (
    <View style={styles.root}>
      <Image source={require('../../assets/casino-bg.jpg')} style={StyleSheet.absoluteFill} contentFit="cover" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.top}>
          <PressableScale onPress={leave} accessibilityLabel="Leave table">
            <View style={styles.iconBtn}>
              <Ionicons name="chevron-back" size={20} color={colors.ink} />
            </View>
          </PressableScale>
          <Text style={styles.word}>2 PATTI</Text>
          <View style={styles.balance}>
            <View style={styles.chipIcon} />
            <Text style={styles.balanceText}>{formatChips(human.chips)}</Text>
          </View>
          <PressableScale onPress={() => router.push('/rules')} accessibilityLabel="How to play">
            <View style={styles.iconBtn}>
              <Ionicons name="book-outline" size={18} color={colors.ink} />
            </View>
          </PressableScale>
        </View>

        <View style={styles.feltWrap}>
          <View style={styles.rail}>
            <LinearGradient colors={[colors.feltEdge, colors.feltHi, colors.felt, colors.feltEdge]} locations={[0, 0.35, 0.7, 1]} style={styles.felt} onLayout={onFeltLayout}>
              {felt.w > 0 && (
                <>
                  <View style={[styles.dealerTag, { left: dealerPt.x - 40, top: dealerPt.y }]}>
                    <Text style={styles.dealerText}>DEALER</Text>
                  </View>
                  <View style={[styles.centre, { left: felt.w / 2 - 60, top: felt.h * 0.25 }]}>
                    {mode === 'centre' && game.centre ? (
                      <PlayingCard
                        key={`c${handNo}`}
                        card={game.centre}
                        faceUp={game.centreOpen}
                        width={50}
                        slowFlip
                        dealFrom={{ x: 0, y: dealerPt.y - felt.h * 0.25 }}
                        dealDelay={n * 2 * DEAL_STEP}
                      />
                    ) : (
                      <View style={styles.imagCue}>
                        <Text style={styles.imagCueTitle}>IMAGINARY</Text>
                        <Text style={styles.imagCueSub}>Best third card is auto-picked</Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.potWrap, { left: felt.w / 2 - 100, top: felt.h * 0.39 }]}>
                    {!result && <ChipPile amount={game.pot} ante={config.ante} />}
                    <Text style={styles.ante}>ANTE {config.ante}  ·  BLIND {formatChips(game.currentBlind)}</Text>
                  </View>

                  {game.players.map((p, i) => {
                    const a = anchors[i];
                    const cx = a.x * felt.w;
                    const cy = a.y * felt.h;
                    const isMe = i === 0;
                    const cw = isMe ? 52 : 30;
                    const ch = Math.round(cw * 1.4);
                    const reveal = isMe ? p.seen || shownIds.has(p.id) : shownIds.has(p.id);
                    const shown = result?.shown.find(h => h.playerId === p.id);
                    const won = result?.winnerId === p.id;
                    const badge = p.folded ? 'Folded' : p.seen ? 'Seen' : 'Blind';
                    const extra = (shown?.imaginary || (isMe && !shown && myHand?.third)) ? 1 : 0;
                    const rowW = (2 + extra) * (cw + 3);
                    const leftSide = a.x <= 0.5;
                    const cardsLeft = isMe ? cx - rowW / 2 : leftSide ? cx + 34 : cx - 34 - rowW;
                    const cardsTop = isMe ? cy - 50 - ch - 2 : cy - 12;
                    return (
                      <View key={p.id} pointerEvents="none" style={StyleSheet.absoluteFill}>
                        <View style={{ position: 'absolute', left: cx - 46, top: cy - 50 }}>
                          <Seat
                            name={p.name}
                            isBot={p.isBot}
                            chips={p.chips}
                            badge={badge}
                            active={game.phase === 'betting' && game.turn === i && !dealing}
                            winner={!!won && showResult}
                            dim={p.folded}
                            lastAction={isMe ? null : actions[p.id]}
                            size={isMe ? 52 : 46}
                          />
                        </View>
                        <View style={{ position: 'absolute', left: cardsLeft, top: cardsTop, flexDirection: 'row', gap: 3 }}>
                          {p.hole.map((c, k) => (
                            <PlayingCard
                              key={`${handNo}-${p.id}-${k}`}
                              card={c}
                              faceUp={reveal}
                              width={cw}
                              dim={p.folded}
                              rotate={isMe ? (k === 0 ? -4 : 4) : 0}
                              dealFrom={{ x: dealerPt.x - cardsLeft, y: dealerPt.y - cardsTop }}
                              dealDelay={dealIndex(i, k) * DEAL_STEP}
                              onDealt={isMe ? () => feel.light() : undefined}
                            />
                          ))}
                          {shown?.imaginary && <PlayingCard card={shown.third} faceUp imaginary width={cw} />}
                          {isMe && !shown && myHand?.third && <PlayingCard card={myHand.third} faceUp imaginary width={cw} />}
                        </View>
                        {shown && (
                          <View style={[styles.madeTag, { left: cardsLeft + rowW / 2 - 60, top: isMe ? cardsTop - 20 : cardsTop + ch + 3 }, won && styles.madeWin]}>
                            <Text style={styles.madeText} numberOfLines={1}>
                              {describeMade(shown.made)}
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </>
              )}
            </LinearGradient>
          </View>
        </View>

        <View style={styles.bar}>
          {myHand && !result && <Text style={styles.myHand}>Your hand: {myHand.label}</Text>}
          {result ? null : dealing ? (
            <Text style={styles.status}>Dealing</Text>
          ) : humanTurn ? (
            <Animated.View entering={FadeInDown.duration(160)} style={{ gap: 8 }}>
              {legal.mustSee && <Text style={styles.status}>Blind limit reached. See your cards to keep playing.</Text>}
              <View style={styles.btnRow}>
                {legal.bets.map(b => (
                  <Button
                    key={b.raise ? 'r' : 'c'}
                    style={{ flex: 1 }}
                    label={b.raise ? 'RAISE' : 'BET'}
                    sub={formatChips(b.amount)}
                    onPress={() => apply({ type: 'bet', raise: b.raise })}
                    testID={b.raise ? 'raise' : 'bet'}
                  />
                ))}
              </View>
              <View style={styles.btnRow}>
                {legal.canSee && <Button style={{ flex: 1 }} label="SEE" sub="Free" tone="dark" onPress={() => apply({ type: 'see' })} testID="see" />}
                {legal.show && <Button style={{ flex: 1 }} label="SHOW" sub={formatChips(legal.show.amount)} onPress={() => apply({ type: 'show' })} testID="show" />}
                <Button style={{ flex: 1 }} label="FOLD" tone="wine" onPress={() => apply({ type: 'fold' })} testID="fold" />
              </View>
            </Animated.View>
          ) : human.folded ? (
            <Text style={styles.status}>You folded. The hand plays out.</Text>
          ) : (
            <View style={{ gap: 8 }}>
              <Text style={styles.status}>{game.players[game.turn].name} to act</Text>
              {!human.seen && (
                <Button label="SEE MY CARDS" sub="Free, switches you to seen stakes" tone="dark" onPress={() => setGame(g => seeCards(g, 0))} testID="see-early" />
              )}
            </View>
          )}
          {!result && <Text style={styles.footnote}>{activePlayers(game).length} in hand  ·  {CHIP_DISCLAIMER.split('.')[0]}</Text>}
        </View>
      </SafeAreaView>

      {result && showResult && bannerOn && banner && (
        <WinnerBanner title={banner.title} subtitle={banner.subtitle} pot={result.pot} bonus={result.bonus} big={banner.big} />
      )}
      {result && showResult && (
        <Animated.View entering={FadeIn.duration(200).delay(300)} style={styles.sheet}>
          <SafeAreaView edges={['bottom']}>
            {result.shown.length > 0 ? (
              <ScrollView style={{ maxHeight: 150 }}>
                {result.shown.map(h => {
                  const p = game.players.find(x => x.id === h.playerId)!;
                  return (
                    <View key={h.playerId} style={styles.resRow}>
                      <Text style={[styles.resName, h.playerId === result.winnerId && { color: colors.highlight }]}>
                        {h.playerId === result.winnerId ? '👑 ' : ''}
                        {p.name}
                      </Text>
                      <Text style={styles.resHand} numberOfLines={1}>
                        {describeMade(h.made)}
                        {h.imaginary ? ' (imaginary third card)' : ''}
                      </Text>
                    </View>
                  );
                })}
                {suitsDecided(game) && <Text style={styles.resNote}>Equal hands. Suits decided the winner: Spades, Hearts, Diamonds, Clubs.</Text>}
                {result.reason === 'potCap' && <Text style={styles.resNote}>Pot cap reached, so every hand was shown.</Text>}
              </ScrollView>
            ) : null}
            <View style={[styles.btnRow, { marginTop: 10 }]}>
              <Button style={{ flex: 1 }} label="LEAVE" tone="dark" onPress={leave} />
              <Button
                style={{ flex: 2 }}
                label={human.chips >= tier.minToSit ? 'NEXT HAND' : 'BACK TO LOBBY'}
                onPress={nextHand}
                testID="next-hand"
              />
            </View>
          </SafeAreaView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.charcoal },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(20,22,26,0.85)' },
  word: { flex: 1, fontFamily: fonts.black, fontSize: 22, color: colors.ink, letterSpacing: 1 },
  iconBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.panel, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.panelBorder },
  balance: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.panel, borderRadius: 19, paddingHorizontal: 12, height: 38, borderWidth: 1, borderColor: colors.panelBorder },
  chipIcon: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.felt, borderWidth: 3, borderColor: colors.goldSoft },
  balanceText: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink, fontVariant: ['tabular-nums'] },
  feltWrap: { flex: 1, paddingHorizontal: 8, paddingTop: 36, paddingBottom: 8 },
  rail: { flex: 1, borderRadius: 160, backgroundColor: colors.rail, padding: 10, shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
  felt: { flex: 1, borderRadius: 150, overflow: 'visible' },
  dealerTag: { position: 'absolute', width: 80, alignItems: 'center', paddingVertical: 3, borderRadius: 8, backgroundColor: 'rgba(20,22,26,0.7)', borderWidth: 1, borderColor: colors.gold },
  dealerText: { fontFamily: fonts.bold, fontSize: 11, color: colors.goldSoft, letterSpacing: 1.5 },
  centre: { position: 'absolute', width: 120, alignItems: 'center' },
  imagCue: { alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.goldSoft, backgroundColor: 'rgba(20,22,26,0.35)' },
  imagCueTitle: { fontFamily: fonts.bold, fontSize: 12, color: colors.goldSoft, letterSpacing: 1.5 },
  imagCueSub: { fontFamily: fonts.regular, fontSize: 10, color: colors.ink, textAlign: 'center' },
  potWrap: { position: 'absolute', width: 200, alignItems: 'center' },
  ante: { marginTop: 4, fontFamily: fonts.semibold, fontSize: 11, color: colors.ink, letterSpacing: 0.8, opacity: 0.85 },
  madeTag: { position: 'absolute', width: 120, alignItems: 'center', backgroundColor: 'rgba(20,22,26,0.85)', borderRadius: 8, paddingVertical: 2, paddingHorizontal: 4 },
  madeWin: { borderWidth: 1, borderColor: colors.highlight },
  madeText: { fontFamily: fonts.semibold, fontSize: 10, color: colors.ink },
  bar: { paddingHorizontal: 12, paddingBottom: 6, paddingTop: 4, gap: 8, minHeight: 150, justifyContent: 'flex-end' },
  btnRow: { flexDirection: 'row', gap: 8 },
  status: { fontFamily: fonts.semibold, fontSize: 15, color: colors.ink, textAlign: 'center' },
  myHand: { fontFamily: fonts.bold, fontSize: 15, color: colors.highlight, textAlign: 'center' },
  footnote: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, textAlign: 'center' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(20,22,26,0.97)', borderTopLeftRadius: 18, borderTopRightRadius: 18, borderWidth: 1, borderColor: colors.panelBorder, padding: 14 },
  resRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, gap: 10 },
  resName: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  resHand: { flex: 1, textAlign: 'right', fontFamily: fonts.medium, fontSize: 14, color: colors.warm },
  resNote: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 4 },
});
