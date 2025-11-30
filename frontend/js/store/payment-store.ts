import { create } from 'zustand';
import { type Payment } from '@/types';

interface PaymentState {
  payments: Payment[];
  totalPaid: number;
  totalPending: number;
  totalLate: number;
  initializePayments: (payments: Payment[]) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (payment: Payment) => void;
  removePayment: (paymentId: string) => void;
  calculateTotals: () => void;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  payments: [],
  totalPaid: 0,
  totalPending: 0,
  totalLate: 0,

  initializePayments: (payments) => {
    set({ payments });
    get().calculateTotals();
  },

  addPayment: (payment) => {
    set((state) => ({
      payments: [...state.payments, payment],
    }));
    get().calculateTotals();
  },

  updatePayment: (payment) => {
    set((state) => ({
      payments: state.payments.map((p) => (p.id === payment.id ? payment : p)),
    }));
    get().calculateTotals();
  },

  removePayment: (paymentId) => {
    set((state) => ({
      payments: state.payments.filter((p) => p.id !== paymentId),
    }));
    get().calculateTotals();
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
