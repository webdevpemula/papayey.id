import { Resend } from 'resend';

interface SendDownloadEmailParams {
  buyerEmail: string;
  buyerName?: string | null;
  productTitle: string;
  orderCode: string;
  downloadToken: string;
  expiresAt: string;
}

export async function sendDownloadEmail(params: SendDownloadEmailParams): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const downloadUrl = `${appUrl}/download/${params.downloadToken}`;

  if (!apiKey || apiKey === 're_XXXXXX') {
    console.log(`📧 [DEV MOCK EMAIL] To: ${params.buyerEmail} | Order: ${params.orderCode} | Download Link: ${downloadUrl}`);
    return { success: true };
  }

  try {
    const resend = new Resend(apiKey);
    const fromAddress = process.env.EMAIL_FROM || 'papayey.id <onboarding@resend.dev>';

    await resend.emails.send({
      from: fromAddress,
      to: params.buyerEmail,
      subject: `Akses Unduhan Produk: ${params.productTitle} (${params.orderCode})`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-size: 24px; font-weight: 800; color: #4f46e5; margin: 0;">papayey.id</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Marketplace Produk Digital</p>
          </div>
          <div style="background-color: #ffffff; padding: 24px; border-radius: 10px; border: 1px solid #e2e8f0;">
            <h2 style="font-size: 18px; margin-top: 0; color: #0f172a;">Halo ${params.buyerName || 'Pelanggan'}, terima kasih atas pembelian Anda!</h2>
            <p style="line-height: 1.6; color: #334155;">
              Pembayaran untuk pesanan <strong>#${params.orderCode}</strong> telah kami terima. Produk digital Anda telah siap diunduh.
            </p>
            <div style="margin: 24px 0; padding: 16px; background-color: #f1f5f9; border-radius: 8px;">
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #64748b;">Produk yang dibeli:</p>
              <h3 style="margin: 0; color: #0f172a; font-size: 16px;">${params.productTitle}</h3>
            </div>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${downloadUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
                ⬇️ Unduh Produk Sekarang
              </a>
            </div>
            <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-bottom: 0;">
              * Link unduhan ini berlaku selama 7 hari dan dapat diakses maksimal 5 kali. Simpan file unduhan di perangkat Anda.
            </p>
          </div>
        </div>
      `,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Failed to send download email via Resend:', error);
    return { success: false, error: error.message };
  }
}
