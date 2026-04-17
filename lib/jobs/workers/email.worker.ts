import { sendInvoiceEmail, sendWelcomeEmail, sendPasswordResetEmail } from '@/lib/email';

export async function processEmailJob(payload: {
  template: 'welcome' | 'password_reset' | 'invoice';
  to: string;
  data: any;
}) {
  const { template, to, data } = payload;
  console.log(`[EmailWorker] Processing ${template} to ${to}...`);

  switch (template) {
    case 'invoice':
      return await sendInvoiceEmail({
        to,
        invoiceNumber: data.invoiceNumber,
        amount: data.amount,
        customerName: data.customerName,
        pdfBuffer: data.pdfBuffer ? Buffer.from(data.pdfBuffer, 'base64') : undefined,
      });

    case 'welcome':
      return await sendWelcomeEmail({
        to,
        userName: data.userName,
      });

    case 'password_reset':
      return await sendPasswordResetEmail({
        to,
        resetLink: data.resetLink,
      });

    default:
      throw new Error(`[EmailWorker] Unsupported template: ${template}`);
  }
}
