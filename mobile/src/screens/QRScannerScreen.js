import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BRAND } from '../constants/brand';
import GoldButton from '../components/GoldButton';
import LuxuryScreen from '../components/LuxuryScreen';
import AnimatedGoldCard from '../components/AnimatedGoldCard';
import { api } from '../api/client';

const KEY = 'staff_device_api_key';

function parseQrValue(value) {
  try {
    const parsed = JSON.parse(value);
    if (parsed.type === 'GENTS_CUSTOMER') return parsed;
  } catch (_) {
    // Plain customer code fallback
  }
  return { customerCode: value };
}

export default function QRScannerScreen() {
  const device = useCameraDevice('back');
  const [permission, setPermission] = useState('not-determined');
  const [staffKey, setStaffKey] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [lastScan, setLastScan] = useState('');
  const [status, setStatus] = useState('Enter staff device key, then scan customer QR.');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Camera.getCameraPermissionStatus().then(setPermission);
    AsyncStorage.getItem(KEY).then(value => value && setStaffKey(value));
  }, []);

  const requestPermission = async () => {
    const next = await Camera.requestCameraPermission();
    setPermission(next);
  };

  const saveKey = async () => {
    await AsyncStorage.setItem(KEY, staffKey);
    Alert.alert('Saved', 'Staff device key saved on this tablet.');
  };

  const addStampFromValue = async value => {
    if (busy || !value || value === lastScan) return;
    if (!staffKey) {
      setStatus('Staff device key is required.');
      return;
    }

    setBusy(true);
    setLastScan(value);
    setStatus('QR detected. Adding stamp...');
    try {
      const payload = parseQrValue(value);
      const body = {
        ...(payload.customerId ? { customerId: payload.customerId } : {}),
        ...(payload.customerCode ? { customerCode: payload.customerCode } : {}),
        note: 'Staff tablet QR scan',
      };
      const result = await api.staffAddStamp(body, staffKey);
      setStatus(`Stamp added for ${result.data.customer.full_name}. Total stamps: ${result.data.customer.stamps}`);
      Alert.alert('Stamp Added', result.data.rewardMessage || 'Customer stamp added successfully.');
    } catch (error) {
      setStatus(error.message);
      Alert.alert('Scan Error', error.message);
    } finally {
      setTimeout(() => {
        setBusy(false);
        setLastScan('');
      }, 2500);
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      const value = codes[0]?.value;
      if (value) addStampFromValue(value);
    },
  });

  return (
    <LuxuryScreen contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(480)}>
        <Text style={styles.title}>Staff QR Scanner</Text>
        <Text style={styles.subtitle}>Real camera scanner for adding loyalty stamps.</Text>
      </Animated.View>

      <AnimatedGoldCard delay={80} style={styles.panel}>
        <View style={styles.keyRow}>
          <TextInput
            style={styles.input}
            placeholder="Staff Device API Key"
            placeholderTextColor="#777"
            secureTextEntry
            value={staffKey}
            onChangeText={setStaffKey}
          />
          <GoldButton title="Save" onPress={saveKey} />
        </View>
        {permission !== 'granted' && <GoldButton title="Allow Camera Permission" onPress={requestPermission} />}
      </AnimatedGoldCard>

      <AnimatedGoldCard delay={130} glow style={styles.cameraBox}>
        {permission === 'granted' && device ? (
          <Camera style={StyleSheet.absoluteFill} device={device} isActive={!busy} codeScanner={codeScanner} />
        ) : (
          <Text style={styles.cameraText}>{device ? 'Camera permission required.' : 'No back camera found.'}</Text>
        )}
      </AnimatedGoldCard>

      <AnimatedGoldCard delay={180} style={styles.panel}>
        <View style={styles.keyRow}>
          <TextInput
            style={styles.input}
            placeholder="Manual customer code fallback"
            placeholderTextColor="#777"
            value={manualCode}
            onChangeText={setManualCode}
          />
          <GoldButton title="Add" outline onPress={() => addStampFromValue(manualCode)} />
        </View>
        <Text style={styles.status}>{status}</Text>
        <Text style={styles.note}>Security: scanner uses x-staff-device-key and backend anti-cheat still allows only 1 visit stamp per day.</Text>
      </AnimatedGoldCard>
    </LuxuryScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40 },
  title: { color: BRAND.colors.gold, fontSize: 31, fontWeight: '900', letterSpacing: 0.4 },
  subtitle: { color: BRAND.colors.muted, marginTop: 4, marginBottom: 14 },
  panel: { marginBottom: 12 },
  keyRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: { flex: 1, backgroundColor: '#151515', color: BRAND.colors.white, borderRadius: 14, paddingHorizontal: 14, borderColor: '#252525', borderWidth: 1 },
  cameraBox: { marginVertical: 14, padding: 0, borderRadius: 24, overflow: 'hidden', borderWidth: 2, borderColor: BRAND.colors.gold, backgroundColor: '#050505', height: 390, alignItems: 'center', justifyContent: 'center' },
  cameraText: { color: BRAND.colors.muted },
  status: { color: BRAND.colors.gold, fontWeight: '800', marginTop: 4 },
  note: { color: BRAND.colors.muted, marginTop: 8, lineHeight: 20 },
});
