import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BRAND } from '../constants/brand';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AnimatedGoldCard({ children, delay = 0, onPress, onPressIn, onPressOut, style, glow = false }) {
  const enter = useSharedValue(0);
  const pressed = useSharedValue(0);

  useEffect(() => {
    enter.value = withDelay(delay, withTiming(1, { duration: 520 }));
  }, [delay, enter]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      { translateY: interpolate(enter.value, [0, 1], [24, 0]) },
      { scale: interpolate(pressed.value, [0, 1], [1, 0.975]) },
    ],
    borderColor: glow ? `rgba(212,175,55,${interpolate(enter.value, [0, 1], [0.2, 0.95])})` : '#2A2415',
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { pressed.value = withSpring(1); onPressIn?.(); }}
      onPressOut={() => { pressed.value = withSpring(0); onPressOut?.(); }}
      style={[styles.card, glow && styles.glow, style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(21,21,21,0.94)',
    borderWidth: 1,
    borderColor: '#2A2415',
    borderRadius: 22,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  glow: {
    shadowColor: BRAND.colors.gold,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 10,
  },
});
