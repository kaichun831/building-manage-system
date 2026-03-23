import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendResetEmail(to: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const link = `${baseUrl}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"大廈管理系統" <${process.env.SMTP_USER}>`,
    to,
    subject: '密碼重設請求',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
        <h2 style="color:#1d4ed8;margin-bottom:8px;">密碼重設</h2>
        <p style="color:#374151;">您收到此信件是因為有人請求重設您的帳號密碼。</p>
        <p style="color:#374151;">請點擊下方按鈕在 <strong>1 小時內</strong>完成密碼重設：</p>
        <a href="${link}" style="display:inline-block;margin:16px 0;padding:10px 24px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">
          重設密碼
        </a>
        <p style="color:#6b7280;font-size:13px;">若您未提出此請求，請忽略此信件，密碼不會有任何變更。</p>
        <p style="color:#9ca3af;font-size:12px;margin-top:16px;">此連結將於 1 小時後失效。</p>
      </div>
    `,
  });
}
