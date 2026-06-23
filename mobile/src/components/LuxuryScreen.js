import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { BRAND } from '../constants/brand';

const PARTICLES = [
  { left: '8%', size: 4, delay: 0, duration: 5200, drift: 18 },
  { left: '22%', size: 3, delay: 500, duration: 6500, drift: -12 },
  { left: '38%', size: 5, delay: 1000, duration: 5900, drift: 10 },
  { left: '61%', size: 3, delay: 300, duration: 7000, drift: -18 },
  { left: '78%', size: 4, delay: 900, duration: 5600, drift: 14 },
  { left: '91%', size: 2, delay: 1400, duration: 6200, drift: -10 },
];

function GoldParticle({ left, size, delay, duration, drift }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }), -1, false),
    );
  }, [delay, duration, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.18, 0.82, 1], [0, 0.75, 0.55, 0]),
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [680, -80]) },
      { translateX: interpolate(progress.value, [0, 0.5, 1], [0, drift, 0]) },
      { scale: interpolate(progress.value, [0, 0.5, 1], [0.55, 1.25, 0.75]) },
    ],
  }));

  return <Animated.View pointerEvents="none" style={[styles.particle, { left, width: size, height: size, borderRadius: size / 2 }, style]} />;
}

function LuxuryBackdrop() {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 4400, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [pulse]);

  const topGlow = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.18, 0.45]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.92, 1.08]) }],
  }));

  const bottomGlow = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.08, 0.28]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1.08, 0.96]) }],
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.topGlow, topGlow]} />
      <Animated.View style={[styles.bottomGlow, bottomGlow]} />
      <View style={styles.vignette} />
      {PARTICLES.map((particle, index) => <GoldParticle key={index} {...particle} />)}
    </View>
  );
}

export default function LuxuryScreen({ children, scroll = true, contentContainerStyle, style }) {
  if (scroll) {
    return (
      <View style={[styles.container, style]}>
        <LuxuryBackdrop />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, contentContainerStyle]}>
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.staticContent, style]}>
      <LuxuryBackdrop />
      <View style={[styles.content, contentContainerStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.colors.black, overflow: 'hidden' },
  staticContent: { justifyContent: 'center' },
  content: { padding: 18, paddingTop: 52, paddingBottom: 34 },
  topGlow: {
    position: 'absolute',
    top: -150,
    right: -110,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(212,175,55,0.33)',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -160,
    left: -140,
    width: 330,
    height: 330,
    borderRadius: 165,
    backgroundColor: 'rgba(212,175,55,0.20)',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  particle: {
    position: 'absolute',
    backgroundColor: BRAND.colors.gold,
    shadowColor: BRAND.colors.gold,
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
});
