import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BRAND } from '../constants/brand';
import { useApp } from '../context/AppContext';
import GoldButton from '../components/GoldButton';
import LuxuryScreen from '../components/LuxuryScreen';
import AnimatedGoldCard from '../components/AnimatedGoldCard';

export default function ProfileScreen() {
  const { customer } = useApp();
  const shareText = `Join The Gents Studio & Spa with my referral code ${customer.referralCode} and get ${BRAND.referral.friendDiscountPercent}% off your first visit.`;

  return (
    <LuxuryScreen contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(480)}>
        <Text style={styles.title}>Profile</Text>
      </Animated.View>
      <AnimatedGoldCard delay={80} glow style={styles.card}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{customer.fullName?.slice(0, 1) || 'G'}</Text></View>
        <Text style={styles.name}>{customer.fullName}</Text>
        <Text style={styles.info}>{customer.phone}</Text>
        <Text style={styles.info}>{customer.email}</Text>
        <Text style={styles.info}>Customer ID: {customer.id}</Text>
      </AnimatedGoldCard>
      <View style={styles.statsGrid}>
        <AnimatedGoldCard delay={120} style={styles.stat}><Text style={styles.statValue}>{customer.stamps}</Text><Text style={styles.statLabel}>Stamps</Text></AnimatedGoldCard>
        <AnimatedGoldCard delay={170} style={styles.stat}><Text style={styles.statValue}>{customer.points}</Text><Text style={styles.statLabel}>Points</Text></AnimatedGoldCard>
        <AnimatedGoldCard delay={220} style={styles.stat}><Text style={styles.statValue}>{customer.visits}</Text><Text style={styles.statLabel}>Visits</Text></AnimatedGoldCard>
        <AnimatedGoldCard delay={270} style={styles.stat}><Text style={styles.statValue}>{customer.longestStreak}</Text><Text style={styles.statLabel}>Best Streak</Text></AnimatedGoldCard>
      </View>
      <AnimatedGoldCard delay={330} glow style={styles.referralCard}>
        <Text style={styles.refTitle}>Referral Code</Text>
        <Text style={styles.refCode}>{customer.referralCode}</Text>
        <Text style={styles.refInfo}>You get +{BRAND.referral.referrerStamps} stamps and +{BRAND.referral.referrerPoints} points. Friend gets {BRAND.referral.friendDiscountPercent}% off first visit.</Text>
        <GoldButton title="Share via WhatsApp" onPress={() => {}} />
        <Text style={styles.shareText}>{shareText}</Text>
      </AnimatedGoldCard>
      <AnimatedGoldCard delay={390} style={styles.rules}>
        <Text style={styles.rulesTitle}>Rules</Text>
        <Text style={styles.rule}>• 1 stamp per visit; max 1 visit stamp per day.</Text>
        <Text style={styles.rule}>• {BRAND.loyalty.stampsNeeded} stamps = free service reward.</Text>
        <Text style={styles.rule}>• No online cancellation; please call the salon.</Text>
        <Text style={styles.rule}>• Staff selection is by phone only.</Text>
      </AnimatedGoldCard>
    </LuxuryScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40 },
  title: { color: BRAND.colors.gold, fontSize: 34, fontWeight: '900', marginBottom: 16, letterSpacing: 0.4 },
  card: { alignItems: 'center', marginBottom: 14 },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: BRAND.colors.gold, alignItems: 'center', justifyContent: 'center', marginBottom: 10, backgroundColor: '#1F1A0F' },
  avatarText: { color: BRAND.colors.gold, fontSize: 28, fontWeight: '900' },
  name: { color: BRAND.colors.gold, fontSize: 24, fontWeight: '900' },
  info: { color: BRAND.colors.white, marginTop: 7 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: { width: '48%', padding: 16 },
  statValue: { color: BRAND.colors.gold, fontSize: 24, fontWeight: '900' },
  statLabel: { color: BRAND.colors.muted, marginTop: 4 },
  referralCard: { backgroundColor: 'rgba(31,26,15,0.97)', marginTop: 14 },
  refTitle: { color: BRAND.colors.white, fontWeight: '800' },
  refCode: { color: BRAND.colors.gold, fontSize: 28, fontWeight: '900', marginVertical: 8, letterSpacing: 1.1 },
  refInfo: { color: BRAND.colors.white, marginBottom: 12 },
  shareText: { color: BRAND.colors.muted, marginTop: 10, fontSize: 12 },
  rules: { marginTop: 14 },
  rulesTitle: { color: BRAND.colors.gold, fontSize: 18, fontWeight: '900', marginBottom: 8 },
  rule: { color: BRAND.colors.white, marginTop: 5 },
});
