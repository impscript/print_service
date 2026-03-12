import type { Database } from '@/types/database';

type PricingPackage = Database['public']['Tables']['pricing_packages']['Row'];
type PricingType = Database['public']['Enums']['pricing_type'];

export interface PricingCalculationInput {
  pricingPackage: PricingPackage;
  volumeBlack: number;
  volumeColor: number;
}

export interface PricingCalculationResult {
  baseAmount: number;
  excessAmountBlack: number;
  excessAmountColor: number;
  wastePaperDiscount: number;
  adjustedVolumeBlack: number;
  adjustedVolumeColor: number;
  total: number;
  details: {
    description: string;
    amount: number;
  }[];
}

export function calculatePricing(input: PricingCalculationInput): PricingCalculationResult {
  const pkg = input.pricingPackage;

  // Explicitly handle null values from database with defaults
  const wastePaperDiscount = pkg.waste_paper_discount || 0;
  const minGuaranteeVolume = pkg.min_guarantee_volume || 0;
  const minGuaranteePrice = pkg.min_guarantee_price || 0;
  const clickRateBlack = pkg.click_rate_black || 0;
  const clickRateColor = pkg.click_rate_color || 0;
  const baseMonthlyFee = pkg.base_monthly_fee || 0;
  const freeVolumeBlack = pkg.free_volume_black || 0;
  const freeVolumeColor = pkg.free_volume_color || 0;
  const excessRateBlack = pkg.excess_rate_black || 0;
  const excessRateColor = pkg.excess_rate_color || 0;
  const includesPaper = pkg.includes_paper || false;

  const result: PricingCalculationResult = {
    baseAmount: 0,
    excessAmountBlack: 0,
    excessAmountColor: 0,
    wastePaperDiscount: wastePaperDiscount,
    adjustedVolumeBlack: 0,
    adjustedVolumeColor: 0,
    total: 0,
    details: [],
  };

  // Apply waste paper discount
  const wasteDiscountFactor = 1 - (wastePaperDiscount / 100);
  result.adjustedVolumeBlack = Math.round(input.volumeBlack * wasteDiscountFactor);
  result.adjustedVolumeColor = Math.round(input.volumeColor * wasteDiscountFactor);

  switch (pkg.pricing_type) {
    case 'min_guarantee':
      // Minimum Guarantee: If usage < min, pay flat fee. If usage > min, pay per page
      const totalAdjustedVolume = result.adjustedVolumeBlack + result.adjustedVolumeColor;
      if (totalAdjustedVolume <= minGuaranteeVolume) {
        result.baseAmount = minGuaranteePrice;
        result.details.push({
          description: `การันตีขั้นต่ำ ${minGuaranteeVolume.toLocaleString()} แผ่น`,
          amount: minGuaranteePrice,
        });
      } else {
        const blackAmount = result.adjustedVolumeBlack * clickRateBlack;
        const colorAmount = result.adjustedVolumeColor * clickRateColor;
        result.baseAmount = blackAmount + colorAmount;
        result.excessAmountBlack = blackAmount;
        result.excessAmountColor = colorAmount;
        result.details.push({
          description: `ค่าแผ่นขาวดำ ${result.adjustedVolumeBlack.toLocaleString()} แผ่น x ${clickRateBlack} บาท`,
          amount: blackAmount,
        });
        if (result.adjustedVolumeColor > 0) {
          result.details.push({
            description: `ค่าแผ่นสี ${result.adjustedVolumeColor.toLocaleString()} แผ่น x ${clickRateColor} บาท`,
            amount: colorAmount,
          });
        }
      }
      break;

    case 'rental_click':
      // Rental + Click: Fixed monthly fee + per-page charges
      result.baseAmount = baseMonthlyFee;
      result.details.push({
        description: `ค่าเช่าเครื่องรายเดือน`,
        amount: baseMonthlyFee,
      });

      const rentalBlackAmount = result.adjustedVolumeBlack * clickRateBlack;
      const rentalColorAmount = result.adjustedVolumeColor * clickRateColor;
      result.excessAmountBlack = rentalBlackAmount;
      result.excessAmountColor = rentalColorAmount;

      if (rentalBlackAmount > 0) {
        result.details.push({
          description: `ค่าแผ่นขาวดำ ${result.adjustedVolumeBlack.toLocaleString()} แผ่น x ${clickRateBlack} บาท`,
          amount: rentalBlackAmount,
        });
      }
      if (rentalColorAmount > 0) {
        result.details.push({
          description: `ค่าแผ่นสี ${result.adjustedVolumeColor.toLocaleString()} แผ่น x ${clickRateColor} บาท`,
          amount: rentalColorAmount,
        });
      }
      break;

    case 'package_no_paper':
    case 'package_paper':
      // Package: Flat fee with free volume, excess charged
      result.baseAmount = baseMonthlyFee;
      const paperText = includesPaper ? 'รวมกระดาษ' : 'ไม่รวมกระดาษ';
      result.details.push({
        description: `ค่าบริการแพ็คเกจ ${paperText} (${freeVolumeBlack.toLocaleString()} แผ่นขาวดำ${freeVolumeColor > 0 ? ` + ${freeVolumeColor.toLocaleString()} แผ่นสี` : ''})`,
        amount: baseMonthlyFee,
      });

      // Calculate excess for black
      if (result.adjustedVolumeBlack > freeVolumeBlack) {
        const excessBlack = result.adjustedVolumeBlack - freeVolumeBlack;
        const excessBlackAmount = excessBlack * excessRateBlack;
        result.excessAmountBlack = excessBlackAmount;
        result.details.push({
          description: `ส่วนเกินขาวดำ ${excessBlack.toLocaleString()} แผ่น x ${excessRateBlack} บาท`,
          amount: excessBlackAmount,
        });
      }

      // Calculate excess for color
      if (result.adjustedVolumeColor > freeVolumeColor) {
        const excessColor = result.adjustedVolumeColor - freeVolumeColor;
        const excessColorAmount = excessColor * excessRateColor;
        result.excessAmountColor = excessColorAmount;
        result.details.push({
          description: `ส่วนเกินสี ${excessColor.toLocaleString()} แผ่น x ${excessRateColor} บาท`,
          amount: excessColorAmount,
        });
      }
      break;
  }

  // Add waste paper discount detail
  if (wastePaperDiscount > 0) {
    const savedBlack = input.volumeBlack - result.adjustedVolumeBlack;
    const savedColor = input.volumeColor - result.adjustedVolumeColor;
    result.details.push({
      description: `ส่วนลดกระดาษเสีย ${wastePaperDiscount}% (ประหยัด ${savedBlack + savedColor} แผ่น)`,
      amount: 0,
    });
  }

  result.total = result.baseAmount + result.excessAmountBlack + result.excessAmountColor;
  return result;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('th-TH').format(num);
}
