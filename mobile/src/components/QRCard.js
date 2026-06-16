import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { BRAND } from '../constants/brand';

export function makeCustomerQrPayload(customer) {
  return JSON.stringify({
    type: 'GENTS_CUSTOMER',
    customerId: customer.uuid || customer.databaseId || undefined,
    customerCode: customer.customerCode || customer.customer_code || customer.id,
    app: BRAND.appName,
  });
}

export default function QRCard({ customer }) {
  const qrPayload = useMemo(() => makeCustomerQrPayload(customer), [customer]);
  const displayCode = customer.customerCode || customer.customer_code || customer.id;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Scannable Customer QR</Text>
      <View style={styles.qrWrap}>
        <QRCode
          value={qrPayload}
          size={180}
          color={BRAND.colors.black}
          backgroundColor="#FFFFFF"
          logoBackgroundColor="transparent"
        />
      </View>
      <Text style={styles.code}>{displayCode}</Text>
      <Text style={styles.note}>Staff scans this real QR to add a stamp</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#151515', borderColor: '#2A2415', borderWidth: 1, borderRadius: 20, padding: 16, alignItems: 'center' },
  label: { color: BRAND.colors.gold, fontSize: 18, fontWeight: '900', marginBottom: 12 },
  qrWrap: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 18, borderWidth: 3, borderColor: BRAND.colors.gold },
  code: { color: BRAND.colors.white, fontWeight: '800', marginTop: 10 },
  note: { color: BRAND.colors.muted, marginTop: 4 },
});
