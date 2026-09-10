import crypto from 'crypto';

export interface CreateSnapParams {
  orderCode: string;
  grossAmount: number;
  buyerEmail: string;
  buyerName?: string | null;
  itemDetails: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
}

export interface SnapResponse {
  token: string;
  redirect_url: string;
}

export interface ChargeParams {
  orderCode: string;
  grossAmount: number;
  buyerEmail: string;
  buyerName?: string | null;
  paymentMethod: string;
  itemDetails: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
}

export interface NormalizedPaymentDetails {
  payment_method: string;
  channel_name: string;
  channel_type: 'va' | 'qris' | 'bill' | 'ewallet';
  va_number?: string;
  bank?: string;
  biller_code?: string;
  bill_key?: string;
  qr_url?: string;
  qr_string?: string;
  deeplink_url?: string;
  expiry_time?: string;
  gross_amount: number;
  order_code: string;
}

export async function createSnapTransaction(params: CreateSnapParams): Promise<SnapResponse> {
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
  
  if (!serverKey) {
    console.warn('⚠️ MIDTRANS_SERVER_KEY is not configured. Falling back to mock token.');
    return {
      token: 'MOCK-SNAP-TOKEN-' + Date.now(),
      redirect_url: `/order/${params.orderCode}/status`,
    };
  }

  const endpoint = isProduction
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

  const authHeader = 'Basic ' + Buffer.from(serverKey + ':').toString('base64');

  const payload = {
    transaction_details: {
      order_id: params.orderCode,
      gross_amount: params.grossAmount,
    },
    customer_details: {
      email: params.buyerEmail,
      first_name: params.buyerName || 'Pelanggan',
    },
    item_details: params.itemDetails,
    credit_card: {
      secure: true,
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Midtrans Snap API Error (${response.status}): ${errorBody}`);
  }

  return response.json();
}

/**
 * Midtrans Core API (Direct Charge) for Custom Native UI
 * Generates Virtual Account numbers, QRIS codes, or E-wallet deeplinks directly
 * without any popup modal or floating iframe.
 */
export async function createChargeTransaction(params: ChargeParams): Promise<NormalizedPaymentDetails> {
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';

  const method = params.paymentMethod || 'qris';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!serverKey) {
    console.warn('⚠️ MIDTRANS_SERVER_KEY is not configured. Using realistic mock payment details.');
    return generateMockPaymentDetails(params);
  }

  const endpoint = isProduction
    ? 'https://api.midtrans.com/v2/charge'
    : 'https://api.sandbox.midtrans.com/v2/charge';

  const authHeader = 'Basic ' + Buffer.from(serverKey + ':').toString('base64');

  let chargePayload: any = {
    transaction_details: {
      order_id: params.orderCode,
      gross_amount: params.grossAmount,
    },
    customer_details: {
      email: params.buyerEmail,
      first_name: params.buyerName || 'Pelanggan',
    },
    item_details: params.itemDetails,
  };

  let channelType: 'va' | 'qris' | 'bill' | 'ewallet' = 'va';
  let channelName = 'Pembayaran';

  switch (method) {
    case 'bni_va':
      channelType = 'va';
      channelName = 'Bank Negara Indonesia (BNI Virtual Account)';
      chargePayload.payment_type = 'bank_transfer';
      chargePayload.bank_transfer = { bank: 'bni' };
      break;

    case 'mandiri_bill':
      channelType = 'bill';
      channelName = 'Bank Mandiri (Mandiri Bill Payment)';
      chargePayload.payment_type = 'echannel';
      chargePayload.echannel = {
        bill_info1: 'Pembayaran:',
        bill_info2: 'papayey.id',
      };
      break;

    case 'bca_va':
      channelType = 'va';
      channelName = 'BCA Virtual Account';
      chargePayload.payment_type = 'bank_transfer';
      chargePayload.bank_transfer = { bank: 'bca' };
      break;

    case 'bri_va':
      channelType = 'va';
      channelName = 'BRI Virtual Account';
      chargePayload.payment_type = 'bank_transfer';
      chargePayload.bank_transfer = { bank: 'bri' };
      break;

    case 'permata_va':
      channelType = 'va';
      channelName = 'Permata Virtual Account';
      chargePayload.payment_type = 'bank_transfer';
      chargePayload.bank_transfer = { bank: 'permata' };
      break;

    case 'qris':
      channelType = 'qris';
      channelName = 'QRIS (GoPay, OVO, DANA, ShopeePay, Semua m-Banking)';
      chargePayload.payment_type = 'qris';
      chargePayload.qris = { acquirer: 'gopay' };
      break;

    case 'gopay':
      channelType = 'ewallet';
      channelName = 'GoPay / GoPay Later';
      chargePayload.payment_type = 'gopay';
      break;

    case 'shopeepay':
      channelType = 'ewallet';
      channelName = 'ShopeePay';
      chargePayload.payment_type = 'shopeepay';
      chargePayload.shopeepay = {
        callback_url: `${appUrl}/order/${params.orderCode}/status`,
      };
      break;

    default:
      channelType = 'qris';
      channelName = 'QRIS';
      chargePayload.payment_type = 'qris';
      break;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(chargePayload),
  });

  const data = await response.json();

  if (!response.ok || (data.status_code && !['200', '201'].includes(data.status_code))) {
    console.error('Midtrans Charge API error:', data);
    throw new Error(data.status_message || `Gagal memproses pembayaran via Midtrans (${data.status_code || response.status})`);
  }

  // Normalize response
  const details: NormalizedPaymentDetails = {
    payment_method: method,
    channel_name: channelName,
    channel_type: channelType,
    gross_amount: params.grossAmount,
    order_code: params.orderCode,
    expiry_time: data.expiry_time,
  };

  if (channelType === 'va') {
    if (data.va_numbers && data.va_numbers.length > 0) {
      details.va_number = data.va_numbers[0].va_number;
      details.bank = data.va_numbers[0].bank;
    } else if (data.permata_va_number) {
      details.va_number = data.permata_va_number;
      details.bank = 'permata';
    }
  } else if (channelType === 'bill') {
    details.biller_code = data.biller_code || '70012';
    details.bill_key = data.bill_key;
    details.bank = 'mandiri';
  } else if (channelType === 'qris') {
    details.qr_string = data.qr_string;
    const qrAction = data.actions?.find((a: any) => a.name === 'generate-qr-code' || a.name === 'generate-qr-code-v2');
    details.qr_url = qrAction?.url || data.actions?.[0]?.url;
  } else if (channelType === 'ewallet') {
    const deeplink = data.actions?.find((a: any) => a.name === 'deeplink-redirect');
    const qrAction = data.actions?.find((a: any) => a.name === 'generate-qr-code');
    details.deeplink_url = deeplink?.url;
    details.qr_url = qrAction?.url;
  }

  return details;
}

function generateMockPaymentDetails(params: ChargeParams): NormalizedPaymentDetails {
  const method = params.paymentMethod;
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);

  if (method === 'bni_va') {
    return {
      payment_method: method,
      channel_name: 'Bank Negara Indonesia (BNI Virtual Account)',
      channel_type: 'va',
      va_number: '988568' + Math.floor(1000000000 + Math.random() * 9000000000),
      bank: 'bni',
      gross_amount: params.grossAmount,
      order_code: params.orderCode,
      expiry_time: expiry,
    };
  } else if (method === 'mandiri_bill') {
    return {
      payment_method: method,
      channel_name: 'Bank Mandiri (Mandiri Bill Payment)',
      channel_type: 'bill',
      biller_code: '70012',
      bill_key: '' + Math.floor(100000000000 + Math.random() * 900000000000),
      bank: 'mandiri',
      gross_amount: params.grossAmount,
      order_code: params.orderCode,
      expiry_time: expiry,
    };
  } else if (method === 'bca_va') {
    return {
      payment_method: method,
      channel_name: 'BCA Virtual Account',
      channel_type: 'va',
      va_number: '56869' + Math.floor(100000000000 + Math.random() * 900000000000),
      bank: 'bca',
      gross_amount: params.grossAmount,
      order_code: params.orderCode,
      expiry_time: expiry,
    };
  } else if (method === 'bri_va') {
    return {
      payment_method: method,
      channel_name: 'BRI Virtual Account',
      channel_type: 'va',
      va_number: '56869' + Math.floor(100000000000 + Math.random() * 900000000000),
      bank: 'bri',
      gross_amount: params.grossAmount,
      order_code: params.orderCode,
      expiry_time: expiry,
    };
  } else if (method === 'permata_va') {
    return {
      payment_method: method,
      channel_name: 'Permata Virtual Account',
      channel_type: 'va',
      va_number: '8528' + Math.floor(100000000000 + Math.random() * 900000000000),
      bank: 'permata',
      gross_amount: params.grossAmount,
      order_code: params.orderCode,
      expiry_time: expiry,
    };
  } else if (method === 'gopay') {
    return {
      payment_method: method,
      channel_name: 'GoPay / GoPay Later',
      channel_type: 'ewallet',
      deeplink_url: 'https://simulator.sandbox.midtrans.com/gopay/partner/app/payment-pin',
      qr_url: 'https://api.sandbox.midtrans.com/v2/qris/sample/qr-code',
      gross_amount: params.grossAmount,
      order_code: params.orderCode,
      expiry_time: expiry,
    };
  } else if (method === 'shopeepay') {
    return {
      payment_method: method,
      channel_name: 'ShopeePay',
      channel_type: 'ewallet',
      deeplink_url: 'https://simulator.sandbox.midtrans.com/shopeepay/payment-pin',
      gross_amount: params.grossAmount,
      order_code: params.orderCode,
      expiry_time: expiry,
    };
  }

  // Default QRIS
  return {
    payment_method: 'qris',
    channel_name: 'QRIS (GoPay, OVO, DANA, ShopeePay, Semua m-Banking)',
    channel_type: 'qris',
    qr_url: 'https://api.sandbox.midtrans.com/v2/qris/sample/qr-code',
    qr_string: '00020101021226620014COM.GO-JEK.WWW011993600914375205686950210M7520568690303UKE51440014ID.CO.QRIS.WWW',
    gross_amount: params.grossAmount,
    order_code: params.orderCode,
    expiry_time: expiry,
  };
}

export function verifyMidtransSignature(params: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
}): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
  if (!serverKey) return true;

  const rawString = params.orderId + params.statusCode + params.grossAmount + serverKey;
  const computedHash = crypto.createHash('sha512').update(rawString).digest('hex');

  return computedHash.toLowerCase() === params.signatureKey.toLowerCase();
}

export async function checkMidtransStatus(orderId: string): Promise<any> {
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';

  const endpoint = isProduction
    ? `https://api.midtrans.com/v2/${orderId}/status`
    : `https://api.sandbox.midtrans.com/v2/${orderId}/status`;

  const authHeader = 'Basic ' + Buffer.from(serverKey + ':').toString('base64');

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: authHeader,
    },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to query Midtrans status: ${err}`);
  }

  return response.json();
}
