import { BRAND } from '../constants/brand';

export function calculatePackageTotals(services) {
  const subtotal = services.reduce((sum, service) => sum + Number(service.pricePkr || 0), 0);
  const discountPercent = services.length >= BRAND.packageBuilder.minimumServicesForDiscount ? BRAND.packageBuilder.discountPercent : 0;
  const discount = Math.round((subtotal * discountPercent) / 100);
  const total = subtotal - discount;
  return { subtotal, discountPercent, discount, total };
}

export function formatPkr(value) {
  return `PKR ${Number(value || 0).toLocaleString('en-PK')}`;
}
