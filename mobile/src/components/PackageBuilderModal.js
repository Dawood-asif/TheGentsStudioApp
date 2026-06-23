import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BRAND } from '../constants/brand';
import { formatPkr } from '../utils/packageTotals';
import GoldButton from './GoldButton';

export default function PackageBuilderModal({ visible, services, totals, onClose, onClear }) {
  const shareText = services.map(service => `${service.name} - ${formatPkr(service.pricePkr)}`).join('\n');

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Custom Package</Text>
            <Pressable onPress={onClose}><Text style={styles.close}>Close</Text></Pressable>
          </View>
          <ScrollView style={{ maxHeight: 300 }}>
            {services.map(service => (
              <View key={service.id} style={styles.item}>
                <Text style={styles.itemName}>{service.name}</Text>
                <Text style={styles.itemPrice}>{formatPkr(service.pricePkr)}</Text>
              </View>
            ))}
            {!services.length && <Text style={styles.empty}>Select services to build a package.</Text>}
          </ScrollView>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Subtotal</Text><Text style={styles.totalValue}>{formatPkr(totals.subtotal)}</Text></View>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Discount ({totals.discountPercent}%)</Text><Text style={styles.discount}>- {formatPkr(totals.discount)}</Text></View>
          <View style={styles.grandRow}><Text style={styles.grandLabel}>Total</Text><Text style={styles.grandValue}>{formatPkr(totals.total)}</Text></View>
          <GoldButton title="Use Package / Book by Phone" onPress={onClose} />
          <GoldButton title="Clear Package" outline onPress={onClear} style={{ marginTop: 10 }} />
          <Text style={styles.share}>WhatsApp share text ready:\n{shareText || 'No services selected'}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#101010', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, borderTopWidth: 1, borderColor: BRAND.colors.gold },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { color: BRAND.colors.gold, fontSize: 24, fontWeight: '900' },
  close: { color: BRAND.colors.white, fontWeight: '700' },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#252525' },
  itemName: { color: BRAND.colors.white, flex: 1 },
  itemPrice: { color: BRAND.colors.gold, fontWeight: '800' },
  empty: { color: BRAND.colors.muted, paddingVertical: 20, textAlign: 'center' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  totalLabel: { color: BRAND.colors.muted },
  totalValue: { color: BRAND.colors.white, fontWeight: '800' },
  discount: { color: BRAND.colors.gold, fontWeight: '800' },
  grandRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#333' },
  grandLabel: { color: BRAND.colors.white, fontSize: 18, fontWeight: '900' },
  grandValue: { color: BRAND.colors.gold, fontSize: 18, fontWeight: '900' },
  share: { color: BRAND.colors.muted, marginTop: 12, fontSize: 12 },
});
