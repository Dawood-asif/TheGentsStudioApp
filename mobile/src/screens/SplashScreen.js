import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BRAND } from '../constants/brand';

const GOLD_DUST = Array.from({ length: 18 }).map((_, index) => ({
  id: index,
  left: `${8 + ((index * 13) % 84)}%`,
  top: `${18 + ((index * 19) % 58)}%`,
  size: 2 + (index % 4),
  delay: index * 95,
}));

function Dust({ left, top, size, delay }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }), -1, true));
  }, [delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5, 1], [0.12, 1, 0.18]),
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [14, -18]) },
      { scale: interpolate(progress.value, [0, 0.5, 1], [0.55, 1.35, 0.7]) },
    ],
  }));

  return <Animated.View style={[styles.dust, { left, top, width: size, height: size, borderRadius: size / 2 }, style]} />;
}

export default function SplashScreen({ navigation }) {
  const logo = useSharedValue(0);
  const shimmer = useSharedValue(0);
  const ring = useSharedValue(0);

  useEffect(() => {
    logo.value = withSequence(withTiming(0.78, { duration: 260 }), withSpring(1, { damping: 9, stiffness: 90 }));
    shimmer.value = withRepeat(withTiming(1, { duration: 1450, easing: Easing.inOut(Easing.quad) }), -1, false);
    ring.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.out(Easing.quad) }), -1, false);
    const timer = setTimeout(() => navigation.replace('Signup'), 1900);
    return () => clearTimeout(timer);
  }, [logo, navigation, ring, shimmer]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logo.value,
    transform: [{ scale: interpolate(logo.value, [0, 1], [0.72, 1]) }, { rotate: `${interpolate(logo.value, [0, 1], [-8, 0])}deg` }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-170, 180]) }, { rotate: '18deg' }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ring.value, [0, 0.7, 1], [0.8, 0.25, 0]),
    transform: [{ scale: interpolate(ring.value, [0, 1], [0.82, 1.65]) }],
  }));

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        <View style={styles.bigGlow} />
        {GOLD_DUST.map(dust => <Dust key={dust.id} {...dust} />)}
      </View>

      <Animated.View style={[styles.ring, ringStyle]} />
      <Animated.View style={[styles.logo, logoStyle]}>
        <Text style={styles.logoText}>GS</Text>
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
      </Animated.View>

      <Text style={styles.title}>{BRAND.appName}</Text>
      <View style={styles.titleUnderline}>
        <Animated.View style={[styles.underlineShimmer, shimmerStyle]} />
      </View>
      <Text style={styles.subtitle}>Luxury Grooming • Rewards • AI</Text>
      <ActivityIndicator color={BRAND.colors.gold} size="large" style={{ marginTop: 30 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.colors.black, justifyContent: 'center', alignItems: 'center', padding: 24, overflow: 'hidden' },
  bigGlow: { position: 'absolute', top: 80, width: 420, height: 420, borderRadius: 210, backgroundColor: 'rgba(212,175,55,0.16)', alignSelf: 'center' },
  dust: { position: 'absolute', backgroundColor: BRAND.colors.gold, shadowColor: BRAND.colors.gold, shadowOpacity: 1, shadowRadius: 8, elevation: 6 },
  ring: { position: 'absolute', width: 170, height: 170, borderRadius: 85, borderWidth: 1, borderColor: BRAND.colors.gold },
  logo: { width: 128, height: 128, borderRadius: 64, borderWidth: 2, borderColor: BRAND.colors.gold, alignItems: 'center', justifyContent: 'center', shadowColor: BRAND.colors.gold, shadowOpacity: 0.95, shadowRadius: 26, elevation: 14, overflow: 'hidden', backgroundColor: 'rgba(10,10,10,0.84)' },
  shimmer: { position: 'absolute', top: -40, bottom: -40, width: 42, backgroundColor: 'rgba(255,255,255,0.32)' },
  logoText: { color: BRAND.colors.gold, fontSize: 42, fontWeight: '900', letterSpacing: 4 },
  title: { color: BRAND.colors.gold, fontSize: 29, fontWeight: '900', marginTop: 24, textAlign: 'center', letterSpacing: 0.6 },
  titleUnderline: { width: 250, height: 3, backgroundColor: '#2A2415', marginTop: 10, borderRadius: 999, overflow: 'hidden' },
  underlineShimmer: { width: 92, height: 3, backgroundColor: BRAND.colors.gold, borderRadius: 999 },
  subtitle: { color: BRAND.colors.white, marginTop: 12, letterSpacing: 1.2 },
});
