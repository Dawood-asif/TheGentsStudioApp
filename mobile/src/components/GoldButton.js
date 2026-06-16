import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import HapticFeedback from 'react-native-haptic-feedback';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BRAND } from '../constants/brand';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const hapticOptions = { enableVibrateFallback: true, ignoreAndroidSystemSettings: false };

export default function GoldButton({ title, onPress, outline = false, style }) {
  const pressed = useSharedValue(0);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }), -1, false);
  }, [shimmer]);

  const handlePress = () => {
    HapticFeedback.trigger('impactLight', hapticOptions);
    onPress?.();
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.965]) }],
    shadowOpacity: outline ? interpolate(pressed.value, [0, 1], [0.15, 0.38]) : interpolate(pressed.value, [0, 1], [0.38, 0.72]),
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-170, 230]) }, { rotate: '18deg' }],
    opacity: outline ? 0.08 : interpolate(shimmer.value, [0, 0.5, 1], [0.04, 0.28, 0.04]),
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => { pressed.value = withSpring(1); }}
      onPressOut={() => { pressed.value = withSpring(0); }}
      style={[styles.button, outline && styles.outline, style, buttonStyle]}
    >
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
      </View>
      <Text style={[styles.text, outline && styles.outlineText]}>{title}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: BRAND.colors.gold,
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BRAND.colors.gold,
    overflow: 'hidden',
    shadowColor: BRAND.colors.gold,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  outline: {
    backgroundColor: 'rgba(21,21,21,0.72)',
  },
  shimmer: {
    position: 'absolute',
    top: -30,
    bottom: -30,
    width: 44,
    backgroundColor: '#FFFFFF',
  },
  text: {
    color: '#080808',
    fontWeight: '900',
    letterSpacing: 0.55,
  },
  outlineText: {
    color: BRAND.colors.gold,
  },
});
