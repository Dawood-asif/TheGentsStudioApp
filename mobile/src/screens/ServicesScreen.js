import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { BRAND } from '../constants/brand';
import { SERVICE_CATEGORIES } from '../data/services';
import { useApp } from '../context/AppContext';
import ServiceCard from '../components/ServiceCard';
import PackageBuilderModal from '../components/PackageBuilderModal';
import GoldButton from '../components/GoldButton';
import LuxuryScreen from '../components/LuxuryScreen';
import { formatPkr } from '../utils/packageTotals';

export default function ServicesScreen() {
  const { services, selectedServices, toggleService, clearPackage, packageTotals } = useApp();
  const [category, setCategory] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);

  const filtered = useMemo(() => category === 'All' ? services : services.filter(service => service.category === category), [category, services]);

  return (
    <View style={styles.container}>
      <LuxuryScreen contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(480)}>
          <Text style={styles.title}>Services</Text>
          <Text style={styles.subtitle}>{services.length}+ services with exact PKR prices</Text>
        </Animated.View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
          {['All', ...SERVICE_CATEGORIES].map((item, index) => (
            <Animated.View key={item} entering={FadeInUp.delay(index * 25).duration(360)}>
              <Pressable onPress={() => setCategory(item)} style={[styles.chip, category === item && styles.chipActive]}>
                <Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
        {filtered.map((service, index) => (
          <Animated.View key={service.id} entering={FadeInDown.delay(Math.min(index, 8) * 35).duration(380)}>
            <ServiceCard service={service} selected={selectedServices.some(item => item.id === service.id)} onPress={() => toggleService(service)} />
          </Animated.View>
        ))}
      </LuxuryScreen>

      {selectedServices.length > 0 && (
        <Animated.View entering={FadeInUp.duration(300)} style={styles.floatingBar}>
          <View>
            <Text style={styles.barTitle}>{selectedServices.length} selected</Text>
            <Text style={styles.barTotal}>{formatPkr(packageTotals.total)} after discount</Text>
          </View>
          <GoldButton title="Package" onPress={() => setModalVisible(true)} />
        </Animated.View>
      )}

      <PackageBuilderModal
        visible={modalVisible}
        services={selectedServices}
        totals={packageTotals}
        onClose={() => setModalVisible(false)}
        onClear={() => { clearPackage(); setModalVisible(false); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.colors.black },
  content: { paddingBottom: 120 },
  title: { color: BRAND.colors.gold, fontSize: 34, fontWeight: '900', letterSpacing: 0.4 },
  subtitle: { color: BRAND.colors.muted, marginBottom: 16, marginTop: 4 },
  categories: { marginBottom: 14 },
  chip: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 999, backgroundColor: 'rgba(21,21,21,0.92)', borderColor: '#252525', borderWidth: 1, marginRight: 8 },
  chipActive: { borderColor: BRAND.colors.gold, backgroundColor: '#1F1A0F', shadowColor: BRAND.colors.gold, shadowOpacity: 0.28, shadowRadius: 12, elevation: 5 },
  chipText: { color: BRAND.colors.muted, fontWeight: '800' },
  chipTextActive: { color: BRAND.colors.gold },
  floatingBar: { position: 'absolute', left: 14, right: 14, bottom: 12, backgroundColor: 'rgba(10,10,10,0.97)', borderRadius: 22, borderColor: BRAND.colors.gold, borderWidth: 1, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: BRAND.colors.gold, shadowOpacity: 0.36, shadowRadius: 18, elevation: 14 },
  barTitle: { color: BRAND.colors.white, fontWeight: '900' },
  barTotal: { color: BRAND.colors.gold, marginTop: 3, fontWeight: '800' },
});
