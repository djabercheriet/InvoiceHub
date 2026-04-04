import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Register Cairo for Arabic support and premium look
Font.register({
  family: 'Cairo',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/cairo/v28/SLXVc1nY6HkvalvtsQMTGg.ttf', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/gh/googlefonts/cairo@master/fonts/ttf/Cairo-Bold.ttf', fontWeight: 700 }
  ]
});

const styles = StyleSheet.create({
 page: {
 padding: 40,
 fontFamily: 'Cairo',
 fontSize: 10,
 color: '#374151',
 },
 header: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 marginBottom: 40,
 borderBottomWidth: 1,
 borderBottomColor: '#e5e7eb',
 paddingBottom: 20,
 },
  logoPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
 infoSection: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 marginBottom: 30,
 },
 infoBox: {
 flexDirection: 'column',
 width: '45%',
 },
  infoLabel: {
    fontSize: 8,
    color: '#6b7280',
    fontWeight: 'bold',
    marginBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 2,
  },
 infoText: {
 fontSize: 10,
 marginBottom: 2,
 },
 table: {
 display: 'flex',
 width: 'auto',
 marginTop: 20,
 },
 tableHeader: {
 flexDirection: 'row',
 backgroundColor: '#f9fafb',
 borderBottomWidth: 1,
 borderBottomColor: '#e5e7eb',
 paddingVertical: 8,
 paddingHorizontal: 4,
 },
 tableRow: {
 flexDirection: 'row',
 borderBottomWidth: 0.5,
 borderBottomColor: '#f3f4f6',
 paddingVertical: 10,
 paddingHorizontal: 4,
 },
 col1: { width: '40%' },
 col2: { width: '15%', textAlign: 'center' },
 col3: { width: '15%', textAlign: 'center' },
 col4: { width: '15%', textAlign: 'center' },
 col5: { width: '15%', textAlign: 'right' },
  tableCellHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#4b5563',
  },
 tableCell: {
 fontSize: 9,
 },
 totalsSection: {
 flexDirection: 'row',
 justifyContent: 'flex-end',
 marginTop: 30,
 },
 totalsBox: {
 width: '40%',
 },
 totalRow: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 paddingVertical: 4,
 },
 grandTotal: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 marginTop: 8,
 paddingTop: 8,
 borderTopWidth: 2,
 borderTopColor: '#4f46e5',
 backgroundColor: '#f5f3ff',
 padding: 8,
 },
  totalLabel: {
    fontSize: 9,
    fontWeight: 'bold',
  },
 footer: {
 position: 'absolute',
 bottom: 30,
 left: 40,
 right: 40,
 borderTopWidth: 0.5,
 borderTopColor: '#e5e7eb',
 paddingTop: 10,
 textAlign: 'center',
 color: '#9ca3af',
 fontSize: 8,
 },
 badge: {
 fontSize: 7,
 padding: 2,
 backgroundColor: '#eef2ff',
 color: '#4f46e5',
 borderRadius: 2,
 textAlign: 'center',
 width: 40,
 marginTop: 4,
 }
});

export function InvoicePDF({ invoice, customer, items, company }: any) {
 const isSale = invoice?.invoice_type === 'sale';

 return (
 <Document>
  <Page size="A4" style={styles.page}>
  <View style={styles.header}>
  <View>
    <View style={styles.logoPlaceholder}>
      <Text style={styles.logoText}>XB</Text>
    </View>
    <Text style={styles.companyName}>{company?.name || 'Executive Hub'}</Text>
    <Text style={styles.infoText}>{company?.email}</Text>
    <Text style={styles.infoText}>{company?.address}</Text>
  </View>
  <View>
  <Text style={styles.invoiceTitle}>{isSale ? 'Invoice' : 'Purchase Order'}</Text>
  <Text style={{ textAlign: 'right', fontSize: 12, fontWeight: 'bold' }}>{invoice?.invoice_number}</Text>
  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
  <View style={{ marginRight: 20 }}>
  <Text style={styles.infoLabel}>Date Issued</Text>
  <Text style={styles.tableCell}>{invoice?.issue_date}</Text>
  </View>
  <View>
  <Text style={styles.infoLabel}>Due Date</Text>
  <Text style={[styles.tableCell, { color: '#ef4444' }]}>{invoice?.due_date}</Text>
  </View>
  </View>
  </View>
  </View>

 <View style={styles.infoSection}>
 <View style={styles.infoBox}>
 <Text style={styles.infoLabel}>{isSale ? 'Bill To' : 'Ordered From'}</Text>
 <Text style={[styles.tableCell, { fontWeight: 'bold', fontSize: 11 }]}>
 {isSale ? customer?.name : (invoice?.supplier_name || 'Global Vendor')}
 </Text>
 {isSale && (
 <>
 <Text style={styles.tableCell}>{customer?.email}</Text>
 <Text style={styles.tableCell}>{customer?.address}</Text>
 </>
 )}
 </View>
  <View style={styles.infoBox}>
  <Text style={styles.infoLabel}>Payment Status</Text>
  <View style={[styles.badge, invoice?.status === 'paid' ? { backgroundColor: '#ecfdf5', color: '#059669' } : {}]}>
  <Text style={{ fontWeight: 'bold' }}>{invoice?.status || 'PENDING'}</Text>
  </View>
  </View>
 </View>

 <View style={styles.table}>
 <View style={styles.tableHeader}>
 <View style={styles.col1}><Text style={styles.tableCellHeader}>Description</Text></View>
 <View style={styles.col2}><Text style={styles.tableCellHeader}>Qty</Text></View>
 <View style={styles.col3}><Text style={styles.tableCellHeader}>Unit</Text></View>
 <View style={styles.col4}><Text style={styles.tableCellHeader}>Price</Text></View>
 <View style={styles.col5}><Text style={styles.tableCellHeader}>Amount</Text></View>
 </View>
 
 {items?.map((item: any, i: number) => (
 <View key={i} style={styles.tableRow}>
 <View style={styles.col1}>
 <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{item.designation || item.products?.name}</Text>
 <Text style={{ fontSize: 7, color: '#9ca3af' }}>SKU: {item.products?.sku || 'N/A'}</Text>
 </View>
 <View style={styles.col2}><Text style={styles.tableCell}>{item.quantity}</Text></View>
 <View style={styles.col3}><Text style={styles.tableCell}>{item.unit_type || 'unit'}</Text></View>
 <View style={styles.col4}><Text style={styles.tableCell}>${item.unit_price?.toLocaleString()}</Text></View>
 <View style={styles.col5}><Text style={[styles.tableCell, { fontWeight: 'bold' }]}>${item.total?.toLocaleString()}</Text></View>
 </View>
 ))}
 </View>

 <View style={styles.totalsSection}>
 <View style={styles.totalsBox}>
 <View style={styles.totalRow}>
 <Text style={styles.totalLabel}>Subtotal</Text>
 <Text style={styles.tableCell}>${invoice?.total?.toLocaleString()}</Text>
 </View>
 <View style={styles.totalRow}>
 <Text style={styles.totalLabel}>Tax (0%)</Text>
 <Text style={styles.tableCell}>$0.00</Text>
 </View>
 <View style={styles.grandTotal}>
 <Text style={[styles.totalLabel, { color: '#4f46e5', fontSize: 11 }]}>Total Amount</Text>
 <Text style={[styles.totalLabel, { color: '#4f46e5', fontSize: 11 }]}>${invoice?.total?.toLocaleString()} {invoice?.currency || 'USD'}</Text>
 </View>
 </View>
 </View>

  <View style={{ marginTop: 40 }}>
  <Text style={styles.infoLabel}>Terms & Notes</Text>
  <Text style={{ fontSize: 8, color: '#6b7280' }}>
  {invoice?.notes || 'Please remit payment within the specified maturity date. Standard warranty applies to all items listed above.'}
  </Text>
  </View>

 <View style={styles.footer}>
 <Text>Generated by InvoiceHub Protocol — Authorized Platform Document</Text>
 </View>
 </Page>
 </Document>
 );
}


