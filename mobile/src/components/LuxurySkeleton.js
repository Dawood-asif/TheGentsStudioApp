import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { BRAND } from '../constants/brand';

function SkeletonLine({ width = '100%', height = 16, radius = 10, style }) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1250, easing: Easing.inOut(Easing.quad) }), -1, false);
  }, [shimmer]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-180, 260]) }, { rotate: '16deg' }],
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.08, 0.34, 0.08]),
  }));

  return (
    <View style={[styles.line, { width, height, borderRadius: radius }, style]}>
      <Animated.View style={[styles.shimmer, shimmerStyle]} />
    </View>
  );
}

export default function LuxurySkeleton({ rows = 4 }) {
  return (
    <View style={styles.card}>
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonLine key={index} width={index % 2 ? '72%' : '94%'} style={{ marginTop: index ? 12 : 0 }} />
      ))}
    </View>
  );
}

export { SkeletonLine };

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(21,21,21,0.92)',
    borderColor: '#2A2415',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
  },
  line: {
    backgroundColor: '#242424',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 90,
    backgroundColor: BRAND.colors.gold,
  },
});
