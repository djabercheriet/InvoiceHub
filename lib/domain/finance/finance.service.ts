import { createClient } from '@/lib/supabase/client';
import type { ExpenseFormValues, TransactionRecord } from './finance.types';

export const financeService = {
  async addExpense(companyId: string, userId: string, data: ExpenseFormValues) {
    const supabase = createClient();
    const { data: expense, error } = await supabase.from('expenses').insert({
      company_id: companyId,
      created_by: userId,
      ...data
    }).select().single();

    if (error) throw error;
    return expense;
  },

  async deleteExpense(expenseId: string) {
    const supabase = createClient();
    const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
    if (error) throw error;
    return true;
  },

  async getTransactions(companyId: string): Promise<TransactionRecord[]> {
    const supabase = createClient();
    const transactions: TransactionRecord[] = [];

    // 1. Get Money IN: Paid Invoices
    const { data: invoices, error: invErr } = await supabase
      .from('invoices')
      .select('id, invoice_number, total, created_at, paid_at, customers(name)')
      .eq('company_id', companyId)
      .eq('status', 'paid');
    
    if (!invErr && invoices) {
      invoices.forEach((inv: any) => {
        transactions.push({
          id: `inv_${inv.id}`,
          date: inv.paid_at || inv.created_at,
          description: `Invoice Payment: ${inv.invoice_number} (${inv.customers?.name || 'Unknown'})`,
          amount: inv.total || 0,
          type: 'IN',
          source: 'invoice',
          source_id: inv.id,
          status: 'completed',
          category: 'Sales Revenue'
        });
      });
    }

    // 2. Get Money OUT: Expenses
    const { data: expenses, error: expErr } = await supabase
      .from('expenses')
      .select('*')
      .eq('company_id', companyId);
    
    if (!expErr && expenses) {
      expenses.forEach((exp: any) => {
        transactions.push({
          id: `exp_${exp.id}`,
          date: exp.date,
          description: exp.title,
          amount: exp.amount,
          type: 'OUT',
          source: 'expense',
          source_id: exp.id,
          status: 'completed',
          category: exp.category
        });
      });
    }

    // 3. Get Money OUT: COGS (Received Purchase Orders)
    const { data: pos, error: poErr } = await supabase
      .from('purchase_orders')
      .select('id, po_number, total, received_at, suppliers(name)')
      .eq('company_id', companyId)
      .eq('status', 'received');
      
    if (!poErr && pos) {
      pos.forEach((po: any) => {
        transactions.push({
          id: `po_${po.id}`,
          date: po.received_at,
          description: `Supplier Payout: ${po.po_number} (${po.suppliers?.name || 'Unknown'})`,
          amount: po.total || 0,
          type: 'OUT',
          source: 'purchase_order',
          source_id: po.id,
          status: 'completed',
          category: 'Cost of Goods Sold'
        });
      });
    }

    // Sort by date descending
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async getProfitAndLoss(companyId: string) {
    const transactions = await this.getTransactions(companyId);
    
    let revenue = 0;
    let expenses = 0;
    let cogs = 0;

    transactions.forEach(t => {
      if (t.type === 'IN') {
        revenue += t.amount;
      } else if (t.source === 'purchase_order') {
        cogs += t.amount;
      } else if (t.source === 'expense') {
        expenses += t.amount;
      }
    });

    const netProfit = revenue - expenses - cogs;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    return {
      revenue,
      expenses,
      cogs,
      netProfit,
      profitMargin
    };
  }
};
