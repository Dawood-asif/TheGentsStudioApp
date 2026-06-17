import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BRAND } from '../constants/brand';
import { useApp } from '../context/AppContext';
import GoldButton from '../components/GoldButton';
import StampProgress from '../components/StampProgress';
import QRCard from '../components/QRCard';
import LuxuryScreen from '../components/LuxuryScreen';
import AnimatedGoldCard from '../components/AnimatedGoldCard';
import { getVipProgress } from '../utils/vipTiers';

export default function HomeScreen({ navigation }) {
  const { customer, darkMode, toggleDarkMode, vipTiers } = useApp();
  const vip = getVipProgress(customer.points, vipTiers);

  return (
    <LuxuryScreen contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(520)} style={styles.header}>
        <View>
          <Text style={styles.hello}>Welcome back,</Text>
          <Text style={styles.name}>{customer.fullName}</Text>
          <Text style={styles.tagline}>Your luxury grooming rewards are waiting.</Text>
        </View>
        <GoldButton title={darkMode ? 'â˜¾' : 'â˜€'} onPress={toggleDarkMode} style={styles.modeButton} />
      </Animated.View>

      <AnimatedGoldCard delay={70} glow style={styles.vipCard}>
        <View style={styles.vipHeader}>
          <View>
            <Text style={styles.vipLabel}>VIP Status</Text>
            <Text style={[styles.vipTier, { color: vip.current.color }]}>{vip.current.name}</Text>
          </View>
          <Text style={styles.vipPoints}>{customer.points} pts</Text>
        </View>
        <View style={styles.vipTrack}>
          <View style={[styles.vipFill, { width: `${vip.progress}%`, backgroundColor: vip.current.color }]} />
        </View>
        <Text style={styles.vipHint}>
          {vip.next ? `${vip.pointsNeeded} points to ${vip.next.name}` : 'Diamond status unlocked â€” ultimate TGSS VIP.'}
        </Text>
      </AnimatedGoldCard>

      <StampProgress stamps={customer.stamps} />

      <View style={styles.statsRow}>
        <AnimatedGoldCard delay={100} style={styles.stat} glow><Text style={styles.statValue}>{customer.points}</Text><Text style={styles.statLabel}>Points</Text></AnimatedGoldCard>
        <AnimatedGoldCard delay={180} style={styles.stat}><Text style={styles.statValue}>{customer.visits}</Text><Text style={styles.statLabel}>Visits</Text></AnimatedGoldCard>
        <AnimatedGoldCard delay={260} style={styles.stat}><Text style={styles.statValue}>{customer.currentStreak}</Text><Text style={styles.statLabel}>Week Streak</Text></AnimatedGoldCard>
      </View>

      <Animated.View entering={FadeInDown.delay(180).duration(540)}>
        <QRCard customer={customer} />
      </Animated.View>

      <AnimatedGoldCard delay={260} style={styles.actions}>
        <GoldButton title="View Services" onPress={() => navigation.navigate('Services')} />
        <GoldButton title="Request Booking" outline onPress={() => navigation.navigate('Book')} style={{ marginTop: 10 }} />
        <GoldButton title="Ask AI Assistant" outline onPress={() => navigation.navigate('AI')} style={{ marginTop: 10 }} />
      </AnimatedGoldCard>

      <AnimatedGoldCard delay={320} style={styles.infoCard}>
        <Text style={styles.infoTitle}>Salon Info</Text>
        <Text style={styles.info}>{BRAND.operatingHours}</Text>
        <Text style={styles.info}>{BRAND.address}</Text>
        <Text style={styles.info}>Call: {BRAND.phones.join(' / ')}</Text>
      </AnimatedGoldCard>
    </LuxuryScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hello: { color: BRAND.colors.muted, fontWeight: '700' },
  name: { color: BRAND.colors.gold, fontSize: 31, fontWeight: '900', letterSpacing: 0.4 },
  tagline: { color: BRAND.colors.white, marginTop: 4, maxWidth: 250 },
  modeButton: { width: 52, paddingHorizontal: 0 },
  vipCard: { padding: 16, backgroundColor: 'rgba(31,26,15,0.92)' },
  vipHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vipLabel: { color: BRAND.colors.muted, fontWeight: '800' },
  vipTier: { fontSize: 27, fontWeight: '900', marginTop: 2, letterSpacing: 0.7 },
  vipPoints: { color: BRAND.colors.white, fontWeight: '900' },
  vipTrack: { height: 10, borderRadius: 999, backgroundColor: '#262626', marginTop: 12, overflow: 'hidden' },
  vipFill: { height: '100%', borderRadius: 999 },
  vipHint: { color: BRAND.colors.muted, marginTop: 9, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, alignItems: 'center', padding: 14 },
  statValue: { color: BRAND.colors.gold, fontSize: 22, fontWeight: '900' },
  statLabel: { color: BRAND.colors.muted, marginTop: 4, fontSize: 12, textAlign: 'center' },
  actions: { marginTop: 4, padding: 14 },
  infoCard: { padding: 16 },
  infoTitle: { color: BRAND.colors.gold, fontSize: 18, fontWeight: '900', marginBottom: 6 },
  info: { color: BRAND.colors.white, marginTop: 4 },
});
