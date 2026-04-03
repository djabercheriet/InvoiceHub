import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/invoices/invoice-pdf';
import React from 'react';

export async function generateInvoicePDFBuffer(invoiceData: any) {
  // invoiceData should contain { invoice, customer, items, products }
  try {
    const buffer = await renderToBuffer(
      React.createElement(InvoicePDF, { 
        invoice: invoiceData.invoice, 
        customer: invoiceData.customer, 
        items: invoiceData.items, 
        products: invoiceData.products 
      })
    );
    return buffer;
  } catch (error) {
    console.error('Error generating PDF buffer:', error);
    throw error;
  }
}
