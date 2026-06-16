import React, { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BRAND } from '../constants/brand';
import { useApp } from '../context/AppContext';
import GoldButton from '../components/GoldButton';
import LuxuryScreen from '../components/LuxuryScreen';
import AnimatedGoldCard from '../components/AnimatedGoldCard';
import { api } from '../api/client';

export default function SignupScreen({ navigation }) {
  const { setCustomer } = useApp();
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', birthday: '', termsAccepted: false, otp: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoCode, setDemoCode] = useState('');

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const sendOtp = async () => {
    if (!form.fullName || !form.phone || !form.email || !form.birthday || !form.termsAccepted) {
      Alert.alert('Required', 'Please fill all fields and accept Terms & Privacy Policy.');
      return;
    }
    setLoading(true);
    try {
      const result = await api.requestOtp({ phone: form.phone, purpose: 'signup' });
      setOtpSent(true);
      setDemoCode(result.data?.demoCode || '');
      Alert.alert('OTP Sent', result.data?.demoCode ? `Demo OTP: ${result.data.demoCode}` : 'Please check your SMS/WhatsApp for the verification code.');
    } catch (error) {
      Alert.alert('OTP Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyAndSignup = async () => {
    if (!form.otp || form.otp.length !== 6) {
      Alert.alert('OTP Required', 'Enter the 6-digit verification code.');
      return;
    }
    setLoading(true);
    try {
      await api.verifyOtp({ phone: form.phone, code: form.otp, purpose: 'signup' });
      const created = await api.signup({
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        birthday: form.birthday,
        termsAccepted: form.termsAccepted,
      });
      const customer = created.data;
      setCustomer(current => ({
        ...current,
        uuid: customer.id,
        databaseId: customer.id,
        id: customer.customer_code,
        customerCode: customer.customer_code,
        fullName: customer.full_name,
        phone: customer.phone,
        email: customer.email,
        birthday: customer.birthday,
        referralCode: customer.referral_code,
        stamps: customer.stamps,
        points: customer.points,
        visits: customer.visits,
        currentStreak: customer.current_streak,
        longestStreak: customer.longest_streak,
      }));
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Signup Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LuxuryScreen contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(520)}>
        <Text style={styles.title}>Join The Club</Text>
        <Text style={styles.subtitle}>Males-only luxury grooming rewards.</Text>
      </Animated.View>
      <AnimatedGoldCard delay={90} glow>
        <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#777" value={form.fullName} onChangeText={v => update('fullName', v)} />
        <TextInput style={styles.input} placeholder="WhatsApp Phone Number" placeholderTextColor="#777" keyboardType="phone-pad" value={form.phone} onChangeText={v => update('phone', v)} />
        <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor="#777" keyboardType="email-address" value={form.email} onChangeText={v => update('email', v)} />
        <TextInput style={styles.input} placeholder="Birthday (YYYY-MM-DD)" placeholderTextColor="#777" value={form.birthday} onChangeText={v => update('birthday', v)} />
        {otpSent && <TextInput style={styles.input} placeholder="6-digit OTP" placeholderTextColor="#777" keyboardType="number-pad" maxLength={6} value={form.otp} onChangeText={v => update('otp', v)} />}
        {demoCode ? <Text style={styles.demo}>Demo OTP from backend: {demoCode}</Text> : null}
        <View style={styles.terms}>
          <Switch value={form.termsAccepted} onValueChange={v => update('termsAccepted', v)} thumbColor={form.termsAccepted ? BRAND.colors.gold : '#777'} />
          <Text style={styles.termsText}>I agree to Terms & Privacy Policy.</Text>
        </View>
        <GoldButton title={loading ? 'Please wait...' : otpSent ? 'Verify OTP & Create Account' : 'Send Real OTP'} onPress={otpSent ? verifyAndSignup : sendOtp} />
        <GoldButton title="Demo: Skip to App" outline onPress={() => navigation.replace('Main')} style={{ marginTop: 12 }} />
        <Text style={styles.note}>OTP uses backend provider: demo, Twilio SMS, or WhatsApp Cloud API.</Text>
      </AnimatedGoldCard>
    </LuxuryScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 22, paddingTop: 70 },
  title: { color: BRAND.colors.gold, fontSize: 34, fontWeight: '900', letterSpacing: 0.4 },
  subtitle: { color: BRAND.colors.muted, marginBottom: 26, marginTop: 6 },
  input: { backgroundColor: '#101010', borderColor: '#2A2415', borderWidth: 1, borderRadius: 14, color: BRAND.colors.white, padding: 14, marginBottom: 12 },
  demo: { color: BRAND.colors.gold, fontWeight: '900', marginBottom: 8 },
  terms: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  termsText: { color: BRAND.colors.white, marginLeft: 8 },
  note: { color: BRAND.colors.muted, marginTop: 16, textAlign: 'center' },
});
