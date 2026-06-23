import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { BRAND } from '../constants/brand';
import { formatPkr } from '../utils/packageTotals';
import AnimatedGoldCard from './AnimatedGoldCard';

export default function ServiceCard({ service, selected, onPress }) {
  const pressed = useSharedValue(0);

  const priceStyle = useAnimatedStyle(() => ({
    color: interpolateColor(pressed.value || (selected ? 1 : 0), [0, 1], [BRAND.colors.gold, '#FFFFFF']),
  }));

  return (
    <AnimatedGoldCard
      onPress={onPress}
      glow={selected}
      style={[styles.card, selected && styles.selected]}
      onPressIn={() => { pressed.value = withSpring(1); }}
      onPressOut={() => { pressed.value = withSpring(0); }}
    >
      <View style={styles.inner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{service.name}</Text>
          <Text style={styles.category}>{service.category}</Text>
        </View>
        <Animated.Text style={[styles.price, priceStyle]}>{formatPkr(service.pricePkr)}</Animated.Text>
      </View>
    </AnimatedGoldCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 10, padding: 14, borderRadius: 18 },
  inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selected: { backgroundColor: 'rgba(31,26,15,0.96)' },
  name: { color: BRAND.colors.white, fontSize: 16, fontWeight: '900' },
  category: { color: BRAND.colors.muted, marginTop: 4 },
  price: { color: BRAND.colors.gold, fontWeight: '900' },
});
