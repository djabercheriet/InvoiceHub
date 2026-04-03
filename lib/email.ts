import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Initialize real or mock service
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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
  console.log(`[EMAIL DISPATCH] To: ${to}, Invoice: ${invoiceNumber}`);

  // 1. If RESEND_API_KEY exists, use it
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'InvoiceHub <onboarding@resend.dev>',
        to: [to],
        subject: `Invoice ${invoiceNumber} from InvoiceHub`,
        text: `Dear ${customerName}, please find attached your invoice for $${amount.toLocaleString()}.`,
        attachments: pdfBuffer ? [
          {
            filename: `invoice-${invoiceNumber}.pdf`,
            content: pdfBuffer,
          }
        ] : [],
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error("Resend Error:", err);
      return { success: false, error: err.message };
    }
  }

  // 2. Otherwise use Ethereal (Free mock service with web preview)
  try {
    // Creating a test account or using existing one
    const testAccount = await nodemailer.createTestAccount();
    
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: '"InvoiceHub Mock" <system@invoicehub.to>',
      to: to,
      subject: `[PRO-DASHBOARD] Invoice ${invoiceNumber}`,
      text: `Dear ${customerName}, your invoice $${amount.toLocaleString()} is attached. (ID: ${invoiceNumber})`,
      attachments: pdfBuffer ? [
        {
          filename: `invoice-${invoiceNumber}.pdf`,
          content: pdfBuffer,
        }
      ] : [],
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[MOCK EMAIL SENT] View here: ${previewUrl}`);
    
    return { 
      success: true, 
      message: "Email sent (Simulated via Ethereal)", 
      previewUrl 
    };
  } catch (err: any) {
    console.error("Ethereal Error:", err);
    return { success: false, error: err.message };
  }
}
