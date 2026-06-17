import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BRAND } from '../constants/brand';
import { useApp } from '../context/AppContext';
import GoldButton from '../components/GoldButton';
import LuxuryScreen from '../components/LuxuryScreen';
import AnimatedGoldCard from '../components/AnimatedGoldCard';
import { api } from '../api/client';
import { getAchievements, getVipProgress } from '../utils/vipTiers';

export default function ProfileScreen() {
  const { customer, setCustomer, vipTiers } = useApp();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const vip = getVipProgress(customer.points, vipTiers);
  const achievements = getAchievements(customer);
  const unlockedCount = achievements.filter(item => item.unlocked).length;
  const shareText = `Join The Gents Studio & Spa with my referral code ${customer.referralCode} and get ${BRAND.referral.friendDiscountPercent}% off your first visit.`;

  const chooseProfilePhoto = async () => {
    const customerId = customer.uuid || customer.databaseId;
    if (!customerId) {
      Alert.alert('Account Required', 'Please create an account before adding a profile photo.');
      return;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: true,
        maxWidth: 520,
        maxHeight: 520,
        quality: 0.58,
        selectionLimit: 1,
      });

      if (result.didCancel) return;
      const asset = result.assets?.[0];
      if (!asset?.base64) throw new Error('Could not read selected image.');

      const type = asset.type || 'image/jpeg';
      const imageData = `data:${type};base64,${asset.base64}`;

      setUploadingPhoto(true);
      const response = await api.updateProfileImage(customerId, imageData);
      const savedImage = response.data?.profile_image_url || imageData;
      setCustomer(current => ({ ...current, profileImageUrl: savedImage }));
      Alert.alert('Photo Updated', 'Your profile photo is now visible to admin with your name.');
    } catch (error) {
      Alert.alert('Photo Error', error.message || 'Could not update profile photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <LuxuryScreen contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(480)}>
        <Text style={styles.title}>Profile</Text>
      </Animated.View>
      <AnimatedGoldCard delay={80} glow style={styles.card}>
        <View style={styles.avatar}>
          {customer.profileImageUrl ? (
            <Image source={{ uri: customer.profileImageUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{customer.fullName?.slice(0, 1) || 'G'}</Text>
          )}
        </View>
        <View style={[styles.tierPill, { borderColor: vip.current.color }]}>
          <Text style={[styles.tierPillText, { color: vip.current.color }]}>{vip.current.name} VIP</Text>
        </View>
        <GoldButton title={uploadingPhoto ? 'Uploading...' : customer.profileImageUrl ? 'Change Photo' : 'Add Profile Photo'} onPress={chooseProfilePhoto} outline style={styles.photoButton} />
        <Text style={styles.name}>{customer.fullName}</Text>
        <Text style={styles.info}>{customer.phone}</Text>
        <Text style={styles.info}>{customer.email}</Text>
        <Text style={styles.info}>Customer ID: {customer.id}</Text>
      </AnimatedGoldCard>

      <AnimatedGoldCard delay={110} glow style={styles.vipCard}>
        <View style={styles.vipHeader}>
          <Text style={styles.vipTitle}>Status Progress</Text>
          <Text style={[styles.vipTitle, { color: vip.current.color }]}>{vip.current.name}</Text>
        </View>
        <View style={styles.vipTrack}>
          <View style={[styles.vipFill, { width: `${vip.progress}%`, backgroundColor: vip.current.color }]} />
        </View>
        <Text style={styles.vipHint}>{vip.next ? `${vip.pointsNeeded} points to ${vip.next.name}` : 'Diamond VIP unlocked â€” top TGSS status.'}</Text>
        <View style={styles.benefitsWrap}>
          {vip.current.benefits.map(benefit => <Text key={benefit} style={styles.benefit}>â€¢ {benefit}</Text>)}
        </View>
      </AnimatedGoldCard>

      <View style={styles.statsGrid}>
        <AnimatedGoldCard delay={120} style={styles.stat}><Text style={styles.statValue}>{customer.stamps}</Text><Text style={styles.statLabel}>Stamps</Text></AnimatedGoldCard>
        <AnimatedGoldCard delay={170} style={styles.stat}><Text style={styles.statValue}>{customer.points}</Text><Text style={styles.statLabel}>Points</Text></AnimatedGoldCard>
        <AnimatedGoldCard delay={220} style={styles.stat}><Text style={styles.statValue}>{customer.visits}</Text><Text style={styles.statLabel}>Visits</Text></AnimatedGoldCard>
        <AnimatedGoldCard delay={270} style={styles.stat}><Text style={styles.statValue}>{customer.longestStreak}</Text><Text style={styles.statLabel}>Best Streak</Text></AnimatedGoldCard>
      </View>

      <AnimatedGoldCard delay={300} style={styles.achievementsCard}>
        <Text style={styles.rulesTitle}>Achievements {unlockedCount}/{achievements.length}</Text>
        <View style={styles.achievementGrid}>
          {achievements.map(item => (
            <View key={item.id} style={[styles.achievement, item.unlocked && styles.achievementUnlocked]}>
              <Text style={[styles.achievementTitle, item.unlocked && styles.achievementTitleUnlocked]}>{item.title}</Text>
              <Text style={styles.achievementDesc}>{item.description}</Text>
            </View>
          ))}
        </View>
      </AnimatedGoldCard>

      <AnimatedGoldCard delay={330} glow style={styles.referralCard}>
        <Text style={styles.refTitle}>Referral Code</Text>
        <Text style={styles.refCode}>{customer.referralCode}</Text>
        <Text style={styles.refInfo}>You get +{BRAND.referral.referrerStamps} stamps and +{BRAND.referral.referrerPoints} points. Friend gets {BRAND.referral.friendDiscountPercent}% off first visit.</Text>
        <GoldButton title="Share via WhatsApp" onPress={() => {}} />
        <Text style={styles.shareText}>{shareText}</Text>
      </AnimatedGoldCard>
      <AnimatedGoldCard delay={390} style={styles.rules}>
        <Text style={styles.rulesTitle}>Rules</Text>
        <Text style={styles.rule}>â€¢ 1 stamp per visit; max 1 visit stamp per day.</Text>
        <Text style={styles.rule}>â€¢ {BRAND.loyalty.stampsNeeded} stamps = free service reward.</Text>
        <Text style={styles.rule}>â€¢ No online cancellation; please call the salon.</Text>
        <Text style={styles.rule}>â€¢ Staff selection is by phone only.</Text>
      </AnimatedGoldCard>
    </LuxuryScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40 },
  title: { color: BRAND.colors.gold, fontSize: 34, fontWeight: '900', marginBottom: 16, letterSpacing: 0.4 },
  card: { alignItems: 'center', marginBottom: 14 },
  avatar: { width: 86, height: 86, borderRadius: 43, borderWidth: 2, borderColor: BRAND.colors.gold, alignItems: 'center', justifyContent: 'center', marginBottom: 10, backgroundColor: '#1F1A0F', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%', borderRadius: 43 },
  avatarText: { color: BRAND.colors.gold, fontSize: 30, fontWeight: '900' },
  tierPill: { borderWidth: 1, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12, marginBottom: 10, backgroundColor: 'rgba(10,10,10,0.55)' },
  tierPillText: { fontWeight: '900', letterSpacing: 0.8 },
  photoButton: { marginBottom: 12, paddingVertical: 10 },
  name: { color: BRAND.colors.gold, fontSize: 24, fontWeight: '900' },
  info: { color: BRAND.colors.white, marginTop: 7 },
  vipCard: { marginBottom: 14, backgroundColor: 'rgba(31,26,15,0.92)' },
  vipHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vipTitle: { color: BRAND.colors.gold, fontWeight: '900', fontSize: 16 },
  vipTrack: { height: 10, borderRadius: 999, backgroundColor: '#262626', marginTop: 12, overflow: 'hidden' },
  vipFill: { height: '100%', borderRadius: 999 },
  vipHint: { color: BRAND.colors.muted, marginTop: 9, fontWeight: '700' },
  benefitsWrap: { marginTop: 8 },
  benefit: { color: BRAND.colors.white, marginTop: 3 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: { width: '48%', padding: 16 },
  statValue: { color: BRAND.colors.gold, fontSize: 24, fontWeight: '900' },
  statLabel: { color: BRAND.colors.muted, marginTop: 4 },
  achievementsCard: { marginTop: 14 },
  achievementGrid: { gap: 8, marginTop: 8 },
  achievement: { borderWidth: 1, borderColor: '#2A2415', borderRadius: 14, padding: 12, backgroundColor: 'rgba(10,10,10,0.45)', opacity: 0.55 },
  achievementUnlocked: { opacity: 1, borderColor: BRAND.colors.gold, backgroundColor: 'rgba(31,26,15,0.86)' },
  achievementTitle: { color: BRAND.colors.muted, fontWeight: '900' },
  achievementTitleUnlocked: { color: BRAND.colors.gold },
  achievementDesc: { color: BRAND.colors.white, marginTop: 3, fontSize: 12 },
  referralCard: { backgroundColor: 'rgba(31,26,15,0.97)', marginTop: 14 },
  refTitle: { color: BRAND.colors.white, fontWeight: '800' },
  refCode: { color: BRAND.colors.gold, fontSize: 28, fontWeight: '900', marginVertical: 8, letterSpacing: 1.1 },
  refInfo: { color: BRAND.colors.white, marginBottom: 12 },
  shareText: { color: BRAND.colors.muted, marginTop: 10, fontSize: 12 },
  rules: { marginTop: 14 },
  rulesTitle: { color: BRAND.colors.gold, fontSize: 18, fontWeight: '900', marginBottom: 8 },
  rule: { color: BRAND.colors.white, marginTop: 5 },
});
