import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Note: To support complex Arabic/RTL, react-pdf needs fonts loaded.
// Cairo font is imported from Google Fonts.
Font.register({
  family: 'Cairo',
  src: 'https://fonts.gstatic.com/s/cairo/v20/SLXVc1nY6HkvalvtsQMTGg.ttf' 
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Cairo',
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  invoiceInfo: {
    textAlign: 'right',
  },
  section: {
    marginBottom: 20,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 20,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 5,
  },
  tableCell: {
    fontSize: 10,
  },
  totals: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '40%',
    paddingVertical: 5,
  },
  bold: {
    fontWeight: 'bold',
  }
});

export function InvoicePDF({ invoice, customer, items, products }: any) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>INVOICE / فاتورة</Text>
            <Text>InvoiceHub Inc.</Text>
            <Text>hello@invoicehub.to</Text>
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.bold}>{invoice?.invoice_number || 'DRAFT'}</Text>
            <Text>Date: {invoice?.issue_date}</Text>
            <Text>Due: {invoice?.due_date}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>Bill To:</Text>
          <Text>{customer?.name}</Text>
          <Text>{customer?.email}</Text>
          <Text>{customer?.address}</Text>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCol, { width: '40%' }]}><Text style={styles.tableCell}>Item</Text></View>
            <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCell}>Qty</Text></View>
            <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCell}>Price</Text></View>
            <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCell}>Total</Text></View>
          </View>
          
          {items?.map((item: any, i: number) => {
            const product = products?.find((p: any) => p.id === item.product_id);
            return (
              <View key={i} style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '40%' }]}><Text style={styles.tableCell}>{product?.name || 'Unknown Item'}</Text></View>
                <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCell}>{item.quantity}</Text></View>
                <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCell}>${item.unit_price}</Text></View>
                <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCell}>${item.total}</Text></View>
              </View>
            )
          })}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.bold}>Total (USD):</Text>
            <Text style={styles.bold}>${invoice?.total || '0.00'}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
