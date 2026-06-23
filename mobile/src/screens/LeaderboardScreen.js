import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BRAND } from '../constants/brand';
import { useApp } from '../context/AppContext';
import LuxuryScreen from '../components/LuxuryScreen';
import AnimatedGoldCard from '../components/AnimatedGoldCard';

const demoNames = ['Boss', 'Ali', 'Ahmed', 'Usman', 'Bilal', 'Hamza', 'Zain', 'Danish', 'Omer', 'Saad'];

export default function LeaderboardScreen() {
  const { customer } = useApp();
  const [period, setPeriod] = useState('All Time');
  const rows = demoNames.map((name, index) => ({ name, points: Math.max(0, customer.points + 900 - index * 140), streak: Math.max(1, 10 - index), vip: index < 3 }));

  return (
    <LuxuryScreen>
      <Animated.View entering={FadeInDown.duration(480)}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Luxury rankings powered by loyalty points.</Text>
      </Animated.View>
      <View style={styles.filters}>
        {['Today', 'This Week', 'This Month', 'All Time'].map((item, index) => (
          <Animated.View key={item} entering={FadeInDown.delay(index * 45).duration(320)}>
            <Pressable onPress={() => setPeriod(item)} style={[styles.filter, period === item && styles.filterActive]}>
              <Text style={[styles.filterText, period === item && styles.filterTextActive]}>{item}</Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>
      <AnimatedGoldCard delay={100} glow style={styles.rankCard}>
        <Text style={styles.rankLabel}>Your Rank</Text>
        <Text style={styles.rankValue}>#1 • {customer.points} points</Text>
        <Text style={styles.rankHint}>Keep visiting weekly to protect your streak.</Text>
      </AnimatedGoldCard>
      {rows.map((row, index) => (
        <AnimatedGoldCard key={row.name} delay={140 + index * 45} style={[styles.row, index === 0 && styles.firstRow]} glow={index === 0}>
          <Text style={styles.position}>#{index + 1}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.customerName}>{row.vip ? '👑 ' : ''}{row.name}</Text>
            <Text style={styles.streak}>{row.streak} week streak</Text>
          </View>
          <Text style={styles.points}>{row.points}</Text>
        </AnimatedGoldCard>
      ))}
    </LuxuryScreen>
  );
}

const styles = StyleSheet.create({
  title: { color: BRAND.colors.gold, fontSize: 34, fontWeight: '900', letterSpacing: 0.4 },
  subtitle: { color: BRAND.colors.muted, marginTop: 4 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 16 },
  filter: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: 'rgba(21,21,21,0.92)', borderRadius: 999, borderColor: '#252525', borderWidth: 1 },
  filterActive: { borderColor: BRAND.colors.gold, backgroundColor: '#1F1A0F', shadowColor: BRAND.colors.gold, shadowOpacity: 0.26, shadowRadius: 10, elevation: 4 },
  filterText: { color: BRAND.colors.muted, fontWeight: '800' },
  filterTextActive: { color: BRAND.colors.gold },
  rankCard: { marginBottom: 14, backgroundColor: 'rgba(31,26,15,0.97)' },
  rankLabel: { color: BRAND.colors.muted, fontWeight: '700' },
  rankValue: { color: BRAND.colors.gold, fontSize: 24, fontWeight: '900', marginTop: 4 },
  rankHint: { color: BRAND.colors.white, marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 10 },
  firstRow: { backgroundColor: 'rgba(31,26,15,0.96)' },
  position: { color: BRAND.colors.gold, width: 48, fontWeight: '900', fontSize: 18 },
  customerName: { color: BRAND.colors.white, fontWeight: '900', fontSize: 16 },
  streak: { color: BRAND.colors.muted, marginTop: 4 },
  points: { color: BRAND.colors.gold, fontWeight: '900' },
});
