import { BRAND } from '../constants/brand';
import { SERVICES } from '../data/services';
import { formatPkr } from './packageTotals';

function listCategory(category) {
  return SERVICES.filter(service => service.category.toLowerCase().includes(category.toLowerCase()))
    .map(service => `${service.name}: ${formatPkr(service.pricePkr)}`)
    .join('\n');
}

export function getAssistantReply(question) {
  const q = question.toLowerCase();

  if (q.includes('staff') || q.includes('barber') || q.includes('harry') || q.includes('wahid')) {
    return 'For staff or barber booking, please call the salon directly. The app does not select or name specific staff members.';
  }
  if (q.includes('hour') || q.includes('open') || q.includes('close') || q.includes('timing')) {
    return `We are open ${BRAND.operatingHours}. We are closed on ${BRAND.holidaysClosed.join(' and ')}.`;
  }
  if (q.includes('address') || q.includes('location') || q.includes('where')) {
    return `Our address is: ${BRAND.address}. You can call ${BRAND.phones.join(' or ')}.`;
  }
  if (q.includes('phone') || q.includes('call') || q.includes('contact')) {
    return `Please call ${BRAND.phones.join(' or ')} for booking and support.`;
  }
  if (q.includes('stamp') || q.includes('loyalty') || q.includes('free service')) {
    return `You earn 1 stamp per visit and ${BRAND.loyalty.pointsPerStamp} points per stamp. ${BRAND.loyalty.stampsNeeded} stamps unlock a ${BRAND.loyalty.rewardType}. Only 1 visit stamp can be added per day.`;
  }
  if (q.includes('streak')) {
    return 'Weekly visit streak rewards: 2 weeks = 50 points, 4 weeks = 100 points + 1 stamp, 6 weeks = 200 points + 2 stamps, 8 weeks = 500 points + 3 stamps, 10 weeks = FREE SERVICE.';
  }
  if (q.includes('refer') || q.includes('referral')) {
    return `Share your referral code with a friend. After their first eligible visit, you get +${BRAND.referral.referrerStamps} stamps and +${BRAND.referral.referrerPoints} points. Your friend gets ${BRAND.referral.friendDiscountPercent}% off the first visit.`;
  }
  if (q.includes('package') || q.includes('discount')) {
    return `Select any 2 or more services in Package Builder and the app automatically applies ${BRAND.packageBuilder.discountPercent}% discount.`;
  }
  if (q.includes('haircut') || q.includes('cut')) return listCategory('Haircuts');
  if (q.includes('beard') || q.includes('shave')) return listCategory('Beard');
  if (q.includes('facial')) return `${listCategory('Facials')}\n\nFacial massages are also available at separate listed prices.`;
  if (q.includes('massage')) return `${listCategory('Head Massages')}\n${listCategory('Facial Massages')}`;
  if (q.includes('price') || q.includes('service')) {
    return `We have ${SERVICES.length}+ services across haircuts, beard, hair polish, protein/keratin, manicure/pedicure, facials, massages, and add-ons. Open the Services tab for complete prices.`;
  }
  if (q.includes('history') || q.includes('pole')) {
    return 'Salon heritage comes from classic grooming traditions. The barber pole historically represents barber-surgeon colors: red for blood, white for bandages, and blue for veins in some modern traditions.';
  }

  return 'I can help with salon services, prices, location, hours, loyalty stamps, streaks, referrals, packages, and booking by phone. Please ask me anything about The Gents Studio & Spa.';
}
