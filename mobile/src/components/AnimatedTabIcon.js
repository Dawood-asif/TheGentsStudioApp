import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { BRAND } from '../constants/brand';

export default function AnimatedTabIcon({ children, color, focused }) {
  const active = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    active.value = focused ? withSpring(1, { damping: 12 }) : withTiming(0, { duration: 180 });
  }, [active, focused]);

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(active.value, [0, 1], [0, -5]) }, { scale: interpolate(active.value, [0, 1], [1, 1.16]) }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(active.value, [0, 1], [0, 0.55]),
    transform: [{ scale: interpolate(active.value, [0, 1], [0.4, 1]) }],
  }));

  return (
    <Animated.View style={[styles.wrap, wrapStyle]}>
      <Animated.View style={[styles.glow, glowStyle]} />
      <Text style={[styles.icon, { color }]}>{children}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 34, height: 30, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 28, height: 28, borderRadius: 14, backgroundColor: BRAND.colors.gold },
  icon: { fontSize: 18, fontWeight: '900' },
});
