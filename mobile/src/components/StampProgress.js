import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BRAND } from '../constants/brand';

function Spark({ index, active }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (active) progress.value = withDelay(index * 120, withRepeat(withTiming(1, { duration: 1300, easing: Easing.out(Easing.quad) }), -1, false));
  }, [active, index, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: active ? interpolate(progress.value, [0, 0.4, 1], [0, 1, 0]) : 0,
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [12, -28 - index * 3]) },
      { translateX: interpolate(progress.value, [0, 1], [0, (index % 2 ? 1 : -1) * (10 + index * 2)]) },
      { scale: interpolate(progress.value, [0, 0.35, 1], [0.4, 1.2, 0.2]) },
    ],
  }));

  return <Animated.View style={[styles.spark, { right: 20 + index * 18 }, style]} />;
}

export default function StampProgress({ stamps }) {
  const needed = BRAND.loyalty.stampsNeeded;
  const current = stamps % needed;
  const percent = Math.min(100, (current / needed) * 100);
  const fill = useSharedValue(0);
  const pulse = useSharedValue(0);
  const nearReward = current >= needed - 2 || current === 0;

  useEffect(() => {
    fill.value = withSpring(percent, { damping: 18, stiffness: 90 });
  }, [fill, percent]);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [pulse]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value}%` }));
  const cardStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(pulse.value, [0, 1], nearReward ? [0.22, 0.62] : [0.12, 0.28]),
  }));

  return (
    <Animated.View style={[styles.wrap, cardStyle]}>
      {[0, 1, 2, 3].map(index => <Spark key={index} index={index} active={nearReward} />)}
      <View style={styles.row}>
        <Text style={styles.title}>{stamps} Stamps</Text>
        <Text style={styles.remaining}>{needed - current} needed</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]}>
          <View style={styles.fillGlow} />
        </Animated.View>
      </View>
      <View style={styles.stampDots}>
        {Array.from({ length: needed }).map((_, index) => (
          <View key={index} style={[styles.dot, index < current && styles.dotActive]} />
        ))}
      </View>
      <Text style={styles.caption}>{needed} stamps unlock a free service reward.</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'rgba(21,21,21,0.95)',
    borderColor: '#2A2415',
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    shadowColor: BRAND.colors.gold,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  title: { color: BRAND.colors.gold, fontSize: 22, fontWeight: '900' },
  remaining: { color: BRAND.colors.white, fontWeight: '800' },
  track: { height: 14, borderRadius: 999, backgroundColor: '#2A2A2A', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: BRAND.colors.gold, borderRadius: 999, overflow: 'hidden' },
  fillGlow: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 44, backgroundColor: 'rgba(255,255,255,0.28)' },
  stampDots: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: '#403923', backgroundColor: '#111' },
  dotActive: { backgroundColor: BRAND.colors.gold, shadowColor: BRAND.colors.gold, shadowOpacity: 0.8, shadowRadius: 8, elevation: 4 },
  caption: { marginTop: 8, color: BRAND.colors.muted },
  spark: { position: 'absolute', top: 44, width: 5, height: 5, borderRadius: 2.5, backgroundColor: BRAND.colors.gold },
});
