import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Initialize real or mock service
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const getWelcomeEmailHtml = (userName: string, dashboardUrl: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #fbfbfe; color: #0f172a; margin: 0; padding: 0; }
        .wrapper { width: 100%; table-layout: fixed; padding: 40px 0; }
        .container { max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background-color: #4f46e5; padding: 40px; text-align: center; }
        .logo { background-color: rgba(255, 255, 255, 0.2); width: 48px; height: 48px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; }
        .content { padding: 40px; }
        h1 { font-size: 24px; font-weight: 800; margin: 0 0 16px; letter-spacing: -0.025em; }
        p { font-size: 16px; line-height: 24px; color: #475569; margin: 0 0 24px; }
        .button { display: inline-block; background-color: #4f46e5; color: #ffffff !important; padding: 16px 32px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 14px; letter-spacing: 0.025em; transition: background-color 0.2s; }
        .footer { padding: 40px; text-align: center; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header"><div class="logo">BT</div></div>
            <div class="content">
                <h1>Welcome to Bntec!</h1>
                <p>Hello ${userName},</p>
                <p>Your executive portal account has been successfully initialized. You now have full access to view invoices, manage payments, and track your business relationships.</p>
                <div style="text-align: center;">
                    <a href="${dashboardUrl}" class="button">Access Your Dashboard</a>
                </div>
            </div>
            <div class="footer">&copy; ${new Date().getFullYear()} Bntec Dynamics HQ.</div>
        </div>
    </div>
</body>
</html>
`;

const getPasswordResetHtml = (resetLink: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #fbfbfe; color: #0f172a; margin: 0; padding: 0; }
        .wrapper { width: 100%; table-layout: fixed; padding: 40px 0; }
        .container { max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background-color: #ef4444; padding: 40px; text-align: center; }
        .logo { background-color: rgba(255, 255, 255, 0.2); width: 48px; height: 48px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; }
        .content { padding: 40px; }
        h1 { font-size: 24px; font-weight: 800; margin: 0 0 16px; letter-spacing: -0.025em; }
        p { font-size: 16px; line-height: 24px; color: #475569; margin: 0 0 24px; }
        .alert-box { background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 20px; margin-bottom: 24px; color: #be123c; font-size: 14px; }
        .button { display: inline-block; background-color: #ef4444; color: #ffffff !important; padding: 16px 32px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 14px; letter-spacing: 0.025em; }
        .footer { padding: 40px; text-align: center; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header"><div class="logo">BT</div></div>
            <div class="content">
                <h1>Security Protocol: Password Reset</h1>
                <p>A request was received to reset the password for your Bntec account.</p>
                <div class="alert-box">If you did not initiate this request, you can safely ignore this email. Your account remains secure.</div>
                <div style="text-align: center;">
                    <a href="${resetLink}" class="button">Reset Your Password</a>
                </div>
                <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">This link will expire in 1 hour.</p>
            </div>
            <div class="footer">&copy; ${new Date().getFullYear()} Bntec Security Systems.</div>
        </div>
    </div>
</body>
</html>
`;

const getEmailHtml = (customerName: string, invoiceNumber: string, amount: number) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #fbfbfe; color: #0f172a; margin: 0; padding: 0; }
        .wrapper { width: 100%; table-layout: fixed; padding: 40px 0; }
        .container { max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background-color: #4f46e5; padding: 40px; text-align: center; }
        .logo { background-color: rgba(255, 255, 255, 0.2); width: 48px; height: 48px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; }
        .content { padding: 40px; }
        h1 { font-size: 24px; font-weight: 800; margin: 0 0 16px; letter-spacing: -0.025em; }
        p { font-size: 16px; line-height: 24px; color: #475569; margin: 0 0 24px; }
        .invoice-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 32px; }
        .label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
        .value { font-size: 18px; font-weight: 700; color: #0f172a; }
        .button { display: inline-block; background-color: #4f46e5; color: #ffffff !important; padding: 16px 32px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 14px; letter-spacing: 0.025em; transition: background-color 0.2s; }
        .footer { padding: 40px; text-align: center; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header"><div class="logo">BT</div></div>
            <div class="content">
                <p class="label">Priority Notification</p>
                <h1>Bntec — Invoice Document Released</h1>
                <p>Dear ${customerName},</p>
                <p>A new financial manifest has been generated for your Bntec account. Please find the details summarized below and the full document attached.</p>
                <div class="invoice-card">
                    <table width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                            <td width="50%">
                                <div class="label">Manifest ID</div>
                                <div class="value">${invoiceNumber}</div>
                            </td>
                            <td width="50%">
                                <div class="label">Total Valuation</div>
                                <div class="value">$${amount.toLocaleString()}</div>
                            </td>
                        </tr>
                    </table>
                </div>
                <div style="text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/dashboard" class="button">View Invoice Online</a>
                </div>
            </div>
            <div class="footer">&copy; ${new Date().getFullYear()} Bntec Dynamics. Platform Protocol.</div>
        </div>
    </div>
</body>
</html>
`;

export async function sendInvoiceEmail({
  to,
  invoiceNumber,
  amount,
  customerName,
  pdfBuffer
}: {
  to: string;
  invoiceNumber: string;
  amount: number;
  customerName: string;
  pdfBuffer?: Buffer;
}) {
  const html = getEmailHtml(customerName, invoiceNumber, amount);
  return sendRawEmail({
    to,
    subject: `Invoice ${invoiceNumber} | Bntec Dynamics`,
    html,
    attachments: pdfBuffer ? [{ filename: `invoice-${invoiceNumber}.pdf`, content: pdfBuffer }] : []
  });
}

export async function sendWelcomeEmail({ to, userName }: { to: string; userName: string }) {
  const html = getWelcomeEmailHtml(userName, `${process.env.NEXT_PUBLIC_APP_URL}/portal/login`);
  return sendRawEmail({ to, subject: 'Welcome to Bntec Dynamics', html });
}

export async function sendPasswordResetEmail({ to, resetLink }: { to: string; resetLink: string }) {
  const html = getPasswordResetHtml(resetLink);
  return sendRawEmail({ to, subject: 'Action Required: Reset Your Password', html });
}

async function sendRawEmail({ to, subject, html, attachments = [] }: {
  to: string;
  subject: string;
  html: string;
  attachments?: any[]
}) {
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: `${process.env.RESEND_FROM_NAME ?? 'Bntec Dynamics'} <${process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'}>`,
        to: [to],
        subject,
        html,
        attachments,
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error("Resend Error:", err);
      return { success: false, error: err.message };
    }
  }

  // Fallback to Ethereal
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });

    const info = await transporter.sendMail({
      from: '"Bntec Dynamics" <system@bntec.app>',
      to: to,
      subject,
      html,
      attachments,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[MOCK EMAIL SENT] View here: ${previewUrl}`);
    return { success: true, previewUrl };
  } catch (err: any) {
    console.error("Ethereal Error:", err);
    return { success: false, error: err.message };
  }
}
