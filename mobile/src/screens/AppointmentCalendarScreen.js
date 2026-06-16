import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BRAND } from '../constants/brand';
import { useApp } from '../context/AppContext';
import GoldButton from '../components/GoldButton';
import LuxuryScreen from '../components/LuxuryScreen';
import AnimatedGoldCard from '../components/AnimatedGoldCard';
import LuxurySkeleton from '../components/LuxurySkeleton';
import { api } from '../api/client';
import { formatPkr } from '../utils/packageTotals';

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function formatSlot(slot) {
  return new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function AppointmentCalendarScreen() {
  const { customer, selectedServices, packageTotals } = useApp();
  const [date, setDate] = useState(todayString());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Select services, choose a slot, then request booking. Final confirmation is by phone.');

  const loadSlots = async () => {
    setLoading(true);
    try {
      const result = await api.calendarSlots(date);
      setSlots(result.data || []);
      setStatus(result.note || 'Slots loaded.');
    } catch (error) {
      setStatus(error.message);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSlots(); }, []);

  const book = async () => {
    if (!selectedSlot) {
      Alert.alert('Choose Time', 'Please select a slot.');
      return;
    }
    if (!selectedServices.length) {
      Alert.alert('Choose Services', 'Please select services from Services tab first.');
      return;
    }

    setLoading(true);
    try {
      await api.createAppointment({
        customerId: customer.uuid || customer.databaseId || null,
        customerName: customer.fullName,
        phone: customer.phone,
        appointmentAt: selectedSlot,
        serviceIds: [],
        packageSubtotal: packageTotals.subtotal,
        packageDiscount: packageTotals.discount,
        packageTotal: packageTotals.total,
        notes: `Requested services: ${selectedServices.map(service => service.name).join(', ')}. Customer must call for final confirmation.`,
      });
      setStatus('Booking request created. Please call salon to confirm staff and final timing.');
      Alert.alert('Booking Requested', `Your request is saved for ${formatSlot(selectedSlot)}. Please call ${BRAND.phones[0]} to confirm.`);
      loadSlots();
    } catch (error) {
      setStatus(error.message);
      Alert.alert('Booking Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LuxuryScreen contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(480)}>
        <Text style={styles.title}>Booking Calendar</Text>
        <Text style={styles.subtitle}>Request a time slot. Staff selection and final confirmation are by phone.</Text>
      </Animated.View>
      <AnimatedGoldCard delay={80} style={styles.card}>
        <Text style={styles.label}>Date</Text>
        <View style={styles.row}>
          <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor="#777" />
          <GoldButton title={loading ? '...' : 'Load'} onPress={loadSlots} />
        </View>
      </AnimatedGoldCard>

      <AnimatedGoldCard delay={130} style={styles.card}>
        <Text style={styles.label}>Selected Package</Text>
        {selectedServices.length ? selectedServices.map(service => (
          <Text key={service.id} style={styles.service}>• {service.name} — {formatPkr(service.pricePkr)}</Text>
        )) : <Text style={styles.muted}>No services selected. Go to Services tab and add items.</Text>}
        <Text style={styles.total}>Total: {formatPkr(packageTotals.total)}</Text>
      </AnimatedGoldCard>

      {loading ? <LuxurySkeleton rows={5} /> : (
        <AnimatedGoldCard delay={180} style={styles.card} glow>
          <Text style={styles.label}>Available Slots</Text>
          <View style={styles.slotGrid}>
            {slots.map((item, index) => (
              <Animated.View key={item.slot} entering={FadeInDown.delay(index * 18).duration(240)}>
                <Pressable
                  disabled={!item.available}
                  onPress={() => setSelectedSlot(item.slot)}
                  style={[styles.slot, selectedSlot === item.slot && styles.slotActive, !item.available && styles.slotDisabled]}
                >
                  <Text style={[styles.slotText, selectedSlot === item.slot && styles.slotTextActive, !item.available && styles.slotTextDisabled]}>{formatSlot(item.slot)}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </AnimatedGoldCard>
      )}

      <GoldButton title="Request Booking" onPress={book} />
      <Text style={styles.status}>{status}</Text>
    </LuxuryScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40 },
  title: { color: BRAND.colors.gold, fontSize: 31, fontWeight: '900', letterSpacing: 0.4 },
  subtitle: { color: BRAND.colors.muted, marginTop: 4, marginBottom: 14 },
  card: { marginBottom: 14 },
  label: { color: BRAND.colors.gold, fontWeight: '900', fontSize: 17, marginBottom: 10 },
  row: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, backgroundColor: '#0d0d0d', color: BRAND.colors.white, borderRadius: 14, paddingHorizontal: 14, borderColor: '#252525', borderWidth: 1 },
  service: { color: BRAND.colors.white, marginBottom: 4 },
  muted: { color: BRAND.colors.muted },
  total: { color: BRAND.colors.gold, fontWeight: '900', marginTop: 10 },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: { borderWidth: 1, borderColor: '#333', backgroundColor: '#0d0d0d', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 999 },
  slotActive: { borderColor: BRAND.colors.gold, backgroundColor: '#1F1A0F', shadowColor: BRAND.colors.gold, shadowOpacity: 0.34, shadowRadius: 10, elevation: 4 },
  slotDisabled: { opacity: 0.35 },
  slotText: { color: BRAND.colors.white, fontWeight: '800' },
  slotTextActive: { color: BRAND.colors.gold },
  slotTextDisabled: { color: BRAND.colors.muted },
  status: { color: BRAND.colors.muted, marginTop: 12, lineHeight: 20 },
});
