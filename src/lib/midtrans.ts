import crypto from 'crypto';

interface CreateSnapParams {
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

interface SnapResponse {
  token: string;
  redirect_url: string;
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

export function verifyMidtransSignature(params: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
}): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
  if (!serverKey) return true; // Allow testing in dev if no server key

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
