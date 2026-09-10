import React from 'react';

interface PaymentLogoProps {
  channel: 'bni' | 'mandiri' | 'bca' | 'bri' | 'permata' | 'qris' | 'gopay' | 'shopeepay' | 'dana';
  className?: string;
}

export function PaymentLogo({ channel, className = 'h-5 w-auto' }: PaymentLogoProps) {
  switch (channel) {
    case 'bni':
      return (
        <svg viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="BNI">
          <rect width="100" height="30" rx="4" fill="white" />
          <path d="M6 8H16C19.5 8 21.5 9.8 21.5 12.2C21.5 13.7 20.6 14.8 19.3 15.3C21 15.9 22.2 17.2 22.2 19C22.2 21.6 19.9 23.5 16 23.5H6V8ZM10.5 11.5V13.8H15.2C16.8 13.8 17.6 13.2 17.6 12.3C17.6 11.4 16.7 11.5 15.2 11.5H10.5ZM10.5 16.5V20H15.6C17.2 20 18.2 19.3 18.2 18.2C18.2 17.1 17.2 16.5 15.6 16.5H10.5Z" fill="#005E6A" />
          <path d="M25 8H29.5L37.5 18V8H42V23.5H37.5L29.5 13.5V23.5H25V8Z" fill="#005E6A" />
          <path d="M47 8H51.5V23.5H47V8Z" fill="#005E6A" />
          <path d="M57 16.5C57 12 60 8 65.5 8C71 8 74 12 74 16.5C74 21 71 24 65.5 24C60 24 57 21 57 16.5ZM69.5 16.5C69.5 13.5 68 11.5 65.5 11.5C63 11.5 61.5 13.5 61.5 16.5C61.5 19.5 63 20.5 65.5 20.5C68 20.5 69.5 19.5 69.5 16.5Z" fill="#F15A24" />
          <path d="M78 8L85 18H75V8H78Z" fill="#F15A24" />
          <path d="M85 8V23.5H81V18.5H75V15L85 8Z" fill="#F15A24" />
        </svg>
      );

    case 'mandiri':
      return (
        <svg viewBox="0 0 110 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Bank Mandiri">
          <rect width="110" height="30" rx="4" fill="white" />
          <text x="6" y="20" fontFamily="sans-serif" fontWeight="900" fontSize="16" fill="#003D79" letterSpacing="-0.5">mandırı</text>
          <path d="M75 14C83 11 92 10 102 12C96 17 88 20 78 18C74 17 72 15 75 14Z" fill="#F8A000" />
          <path d="M82 9C90 7 98 7 106 9C102 13 95 15 86 14C82 13 80 11 82 9Z" fill="#FFC933" />
        </svg>
      );

    case 'bca':
      return (
        <svg viewBox="0 0 80 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="BCA">
          <rect width="80" height="30" rx="4" fill="#0060AF" />
          <text x="40" y="21" textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontSize="17" fill="white" letterSpacing="1.5">BCA</text>
        </svg>
      );

    case 'bri':
      return (
        <svg viewBox="0 0 80 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="BRI">
          <rect width="80" height="30" rx="4" fill="#00529C" />
          <path d="M12 7H22C25 7 27 8.5 27 11C27 12.5 26 13.5 24.5 14C26.5 14.5 27.5 15.8 27.5 17.5C27.5 20 25.5 22 22 22H12V7ZM16 10V13H21C22 13 23 12.5 23 11.5C23 10.5 22 10 21 10H16ZM16 16V19H22C23 19 23.5 18.5 23.5 17.5C23.5 16.5 23 16 22 16H16Z" fill="white" />
          <text x="50" y="21" fontFamily="sans-serif" fontWeight="900" fontSize="16" fill="white" letterSpacing="0.5">BRI</text>
        </svg>
      );

    case 'permata':
      return (
        <svg viewBox="0 0 110 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Permata Bank">
          <rect width="110" height="30" rx="4" fill="white" />
          <path d="M14 8L18 15L14 22L10 15L14 8Z" fill="#ED1C24" />
          <path d="M18 15L25 11L21 18L18 15Z" fill="#00923F" />
          <path d="M10 15L3 11L7 18L10 15Z" fill="#0072BC" />
          <text x="32" y="19" fontFamily="sans-serif" fontWeight="800" fontSize="12" fill="#333333">Permata</text>
        </svg>
      );

    case 'qris':
      return (
        <svg viewBox="0 0 85 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="QRIS">
          <rect width="85" height="30" rx="4" fill="white" stroke="#E2E8F0" strokeWidth="1" />
          <path d="M10 7H17V14H10V7ZM12 9V12H15V9H12Z" fill="#000000" />
          <path d="M10 16H17V23H10V16ZM12 18V21H15V18H12Z" fill="#000000" />
          <path d="M19 7H26V14H19V7ZM21 9V12H24V9H21Z" fill="#000000" />
          <path d="M19 16H22V19H19V16Z" fill="#000000" />
          <path d="M23 16H26V23H23V16Z" fill="#000000" />
          <path d="M19 20H22V23H19V20Z" fill="#ED1C24" />
          <text x="32" y="21" fontFamily="sans-serif" fontWeight="900" fontSize="14" fill="#000000" letterSpacing="1">QRIS</text>
        </svg>
      );

    case 'gopay':
      return (
        <svg viewBox="0 0 95 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="GoPay">
          <rect width="95" height="30" rx="4" fill="white" />
          <circle cx="15" cy="15" r="7" fill="#00AED6" />
          <circle cx="15" cy="15" r="3" fill="white" />
          <text x="27" y="20" fontFamily="sans-serif" fontWeight="800" fontSize="15" fill="#00AED6" letterSpacing="-0.3">gopay</text>
        </svg>
      );

    case 'shopeepay':
      return (
        <svg viewBox="0 0 110 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="ShopeePay">
          <rect width="110" height="30" rx="4" fill="#EE4D2D" />
          <path d="M14 10C14 8.5 15.5 7 17 7C18.5 7 20 8.5 20 10V11H14V10Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="11" y="10.5" width="12" height="12" rx="2" fill="white" />
          <path d="M17 12C15.5 12 14.5 13 14.5 14C14.5 16 19.5 15.5 19.5 17.5C19.5 18.5 18.5 19.5 17 19.5C15.5 19.5 14.5 18.5 14.5 18.5" stroke="#EE4D2D" strokeWidth="1.2" strokeLinecap="round" />
          <text x="28" y="20" fontFamily="sans-serif" fontWeight="800" fontSize="12" fill="white" letterSpacing="0.2">ShopeePay</text>
        </svg>
      );

    case 'dana':
      return (
        <svg viewBox="0 0 85 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="DANA">
          <rect width="85" height="30" rx="4" fill="#118EEA" />
          <text x="42" y="21" textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontSize="15" fill="white" letterSpacing="1">DANA</text>
        </svg>
      );

    default:
      return null;
  }
}
