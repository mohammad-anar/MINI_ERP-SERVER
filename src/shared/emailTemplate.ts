// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface OtpEmailValues {
  name: string;
  email: string;
  otp: number;
}

interface AdminSaleAlertValues {
  saleId: string;
  customerName: string;
  amount: string;
  currency?: string;
  date: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared layout
// ─────────────────────────────────────────────────────────────────────────────

const layout = (content: string, preheader = '') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    body { margin: 0; padding: 0; background-color: #0f0f14; font-family: 'Segoe UI', Roboto, Arial, sans-serif; }
    .wrapper { width: 100%; background-color: #0f0f14; padding: 40px 16px; box-sizing: border-box; }
    .card { max-width: 560px; margin: 0 auto; background: #1a1a24; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.4); }
    .header { background: linear-gradient(135deg, #6c47ff 0%, #3ecfcf 100%); padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
    .body { padding: 36px 40px; }
    .body p { color: #a0a0b8; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
    .body p.greeting { color: #e0e0f0; font-size: 17px; font-weight: 600; margin-bottom: 20px; }
    .otp-box { background: linear-gradient(135deg, #6c47ff22, #3ecfcf22); border: 1px solid #6c47ff55; border-radius: 12px; text-align: center; padding: 24px 16px; margin: 24px 0; }
    .otp-box .otp { font-size: 42px; font-weight: 800; letter-spacing: 10px; color: #ffffff; font-family: 'Courier New', monospace; }
    .otp-box .expiry { color: #a0a0b8; font-size: 13px; margin-top: 8px; }
    .info-row { display: flex; justify-content: space-between; border-bottom: 1px solid #2a2a38; padding: 10px 0; }
    .info-label { color: #6c6c88; font-size: 13px; }
    .info-value { color: #e0e0f0; font-size: 13px; font-weight: 600; }
    .badge { display: inline-block; background: linear-gradient(135deg, #6c47ff, #3ecfcf); border-radius: 999px; padding: 4px 14px; color: #fff; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 20px; }
    .footer { padding: 20px 40px; text-align: center; border-top: 1px solid #2a2a38; }
    .footer p { color: #4a4a60; font-size: 12px; margin: 0; line-height: 1.6; }
    .warning { background: #2d1a00; border-left: 3px solid #ff9800; border-radius: 6px; padding: 12px 16px; margin-top: 20px; }
    .warning p { color: #ffb74d; font-size: 13px; margin: 0; }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ''}
  <div class="wrapper">
    <div class="card">
      ${content}
    </div>
  </div>
</body>
</html>
`;

// ─────────────────────────────────────────────────────────────────────────────
// Templates
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Account verification email with OTP.
 */
const createAccount = (values: OtpEmailValues) => {
  const html = layout(
    `
    <div class="header">
      <h1>🚀 Welcome Aboard!</h1>
    </div>
    <div class="body">
      <span class="badge">Email Verification</span>
      <p class="greeting">Hey ${values.name}! 👋</p>
      <p>Thank you for signing up. Use the one-time code below to verify your email address and activate your account.</p>
      <div class="otp-box">
        <div class="otp">${values.otp}</div>
        <div class="expiry">⏱ This code expires in <strong>3 minutes</strong></div>
      </div>
      <p>Enter this code on the verification page to continue. If you didn't create an account, you can safely ignore this email.</p>
      <div class="warning">
        <p>⚠️ Never share this code with anyone. Our team will never ask for it.</p>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Mongoose Template. All rights reserved.</p>
    </div>
    `,
    `Your verification code is ${values.otp}`
  );

  return { to: values.email, subject: 'Verify your email address', html };
};

/**
 * Password reset OTP email.
 */
const resetPassword = (values: OtpEmailValues) => {
  const html = layout(
    `
    <div class="header">
      <h1>🔐 Password Reset</h1>
    </div>
    <div class="body">
      <span class="badge">Security</span>
      <p class="greeting">Hi ${values.name},</p>
      <p>We received a request to reset your password. Use the code below to proceed. This code is valid for <strong>3 minutes</strong>.</p>
      <div class="otp-box">
        <div class="otp">${values.otp}</div>
        <div class="expiry">⏱ Expires in <strong>3 minutes</strong></div>
      </div>
      <div class="warning">
        <p>⚠️ If you didn't request a password reset, please secure your account immediately. This code cannot be reused.</p>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Mongoose Template. All rights reserved.</p>
    </div>
    `,
    `Your password reset code is ${values.otp}`
  );

  return { to: values.email, subject: 'Reset your password', html };
};

/**
 * Admin sale alert notification email.
 * Sent to the admin when a new sale is generated.
 */
const adminSaleAlert = (values: AdminSaleAlertValues) => {
  const currency = values.currency ?? 'USD';
  const html = layout(
    `
    <div class="header">
      <h1>💰 New Sale Generated</h1>
    </div>
    <div class="body">
      <span class="badge">Admin Alert</span>
      <p class="greeting">A new sale has been recorded!</p>
      <p>Here are the details for your records:</p>

      <div style="background:#12121c; border-radius:10px; padding: 20px; margin: 20px 0;">
        <div class="info-row">
          <span class="info-label">Sale ID</span>
          <span class="info-value">#${values.saleId}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Customer</span>
          <span class="info-value">${values.customerName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Amount</span>
          <span class="info-value" style="color:#3ecfcf;">${currency} ${values.amount}</span>
        </div>
        <div class="info-row" style="border-bottom:none;">
          <span class="info-label">Date</span>
          <span class="info-value">${values.date}</span>
        </div>
      </div>

      <p style="color:#6c6c88; font-size:13px;">Log in to the admin panel to view full sale details and manage orders.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Mongoose Template · This is an automated admin alert.</p>
    </div>
    `,
    `New sale #${values.saleId} — ${currency} ${values.amount}`
  );

  return {
    subject: `💰 New Sale Alert — #${values.saleId} (${currency} ${values.amount})`,
    html,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const emailTemplate = {
  createAccount,
  resetPassword,
  adminSaleAlert,
};
