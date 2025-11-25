import { create } from 'zustand';
import { type Payment, type Invoice } from '@/types';

interface FinanceState {
  payments: Payment[];
  invoices: Invoice[];
  totalPaid: number;
  totalPending: number;
  totalLate: number;
  setPayments: (payments: Payment[]) => void;
  setInvoices: (invoices: Invoice[]) => void;
  calculateTotals: () => void;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  payments: [],
  invoices: [],
  totalPaid: 0,
  totalPending: 0,
  totalLate: 0,

  setPayments: (payments) => {
    set({ payments });
    get().calculateTotals();
  },

  setInvoices: (invoices) => {
    set({ invoices });
  },

  calculateTotals: () => {
    const { payments } = get();
    const totalPaid = payments
      .filter((p) => p.status === 'PAID')
      .reduce((acc, p) => acc + p.amount, 0);
    const totalPending = payments
      .filter((p) => p.status === 'PENDING')
      .reduce((acc, p) => acc + p.amount, 0);
    const totalLate = payments
      .filter((p) => p.status === 'LATE')
      .reduce((acc, p) => acc + p.amount, 0);
    set({ totalPaid, totalPending, totalLate });
  },
}));
