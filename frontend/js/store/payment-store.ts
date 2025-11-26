import { create } from "zustand";

// Based on the Payment model in Django
export type PaymentStatus = "PENDING" | "PAID" | "LATE" | "CANCELLED";

// Interface for a Payment, based on the data from the backend
export interface Payment {
  id: string; // UUID
  reference_number: string;
  contrat__contrat_number: string;
  contrat__tenant__first_name: string;
  contrat__tenant__last_name: string;
  amount: number; // Decimal will be a number in JS
  due_date: string; // date as string
  status: PaymentStatus;
}

interface PaymentState {
  payments: Payment[];
  initializePayments: (initialPayments: Payment[]) => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],

  // Initialize the store with data from Inertia props
  initializePayments: (initialPayments) => set({ payments: initialPayments }),
}));
