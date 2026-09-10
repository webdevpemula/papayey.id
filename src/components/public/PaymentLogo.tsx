import React from 'react';

export type PaymentChannelType =
  | 'bni'
  | 'mandiri'
  | 'bca'
  | 'bri'
  | 'permata'
  | 'qris'
  | 'gopay'
  | 'shopeepay'
  | 'shopee-pay'
  | 'dana'
  | 'bank-bjb'
  | 'bjb'
  | 'ovo'
  | 'linkaja'
  | string;

interface PaymentLogoProps {
  channel: PaymentChannelType;
  className?: string;
  alt?: string;
}

interface LogoMetadata {
  src: string;
  alt: string;
}

const LOGO_CONFIGS: Record<string, LogoMetadata> = {
  bni: { src: '/payment-logos/bni.svg', alt: 'BNI' },
  mandiri: { src: '/payment-logos/mandiri.svg', alt: 'Bank Mandiri' },
  bca: { src: '/payment-logos/bca.svg', alt: 'BCA' },
  bri: { src: '/payment-logos/bri-old.svg', alt: 'Bank BRI' },
  permata: { src: '/payment-logos/permata.svg', alt: 'Permata Bank' },
  qris: { src: '/payment-logos/qris.svg', alt: 'QRIS' },
  gopay: { src: '/payment-logos/gopay.svg', alt: 'GoPay' },
  shopeepay: { src: '/payment-logos/shopee-pay.svg', alt: 'ShopeePay' },
  dana: { src: '/payment-logos/dana.svg', alt: 'DANA' },
  'bank-bjb': { src: '/payment-logos/bank-bjb.svg', alt: 'Bank BJB' },
  ovo: { src: '/payment-logos/ovo.svg', alt: 'OVO' },
  linkaja: { src: '/payment-logos/linkaja.svg', alt: 'LinkAja' },
};

function normalizeChannel(rawChannel: string): string {
  const c = (rawChannel || '').toLowerCase().trim();
  if (c.includes('bni')) return 'bni';
  if (c.includes('mandiri')) return 'mandiri';
  if (c.includes('bca')) return 'bca';
  if (c.includes('bri')) return 'bri';
  if (c.includes('permata')) return 'permata';
  if (c.includes('qris')) return 'qris';
  if (c.includes('gopay')) return 'gopay';
  if (c.includes('shopee')) return 'shopeepay';
  if (c.includes('dana')) return 'dana';
  if (c.includes('bjb')) return 'bank-bjb';
  if (c.includes('ovo')) return 'ovo';
  if (c.includes('linkaja')) return 'linkaja';
  return c;
}

export function PaymentLogo({
  channel,
  className = 'h-6 w-auto object-contain',
  alt,
}: PaymentLogoProps) {
  const key = normalizeChannel(channel);
  const logo = LOGO_CONFIGS[key] || {
    src: `/payment-logos/${key}.svg`,
    alt: alt || channel.toUpperCase(),
  };

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={logo.src}
      alt={alt || logo.alt}
      className={className}
      loading="eager"
    />
  );
}

export default PaymentLogo;
