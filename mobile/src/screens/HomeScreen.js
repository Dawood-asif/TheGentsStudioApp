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

export default function HomeScreen({ navigation }) {
  const { customer, darkMode, toggleDarkMode } = useApp();
  return (
    <LuxuryScreen contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(520)} style={styles.header}>
        <View>
          <Text style={styles.hello}>Welcome back,</Text>
          <Text style={styles.name}>{customer.fullName}</Text>
          <Text style={styles.tagline}>Your luxury grooming rewards are waiting.</Text>
        </View>
        <GoldButton title={darkMode ? '☾' : '☀'} onPress={toggleDarkMode} style={styles.modeButton} />
      </Animated.View>

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
  statsRow: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, alignItems: 'center', padding: 14 },
  statValue: { color: BRAND.colors.gold, fontSize: 22, fontWeight: '900' },
  statLabel: { color: BRAND.colors.muted, marginTop: 4, fontSize: 12, textAlign: 'center' },
  actions: { marginTop: 4, padding: 14 },
  infoCard: { padding: 16 },
  infoTitle: { color: BRAND.colors.gold, fontSize: 18, fontWeight: '900', marginBottom: 6 },
  info: { color: BRAND.colors.white, marginTop: 4 },
});
