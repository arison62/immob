// frontend/js/types/index.ts

export type Tenant = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
};

export type Contrat = {
    id: string;
    contrat_number: string;
    tenant_id: string;
    property_id: string;
    start_date: string;
    end_date: string;
    monthly_rent: number;
    status: 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
    payment_frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
    security_deposit?: number;
};

export type Invoice = {
    id: string;
    payment_id: string;
    invoice_number: string;
    issue_date: string;
    total_amount: number;
    status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
};

export type Payment = {
    id: string;
    contrat_id: string;
    amount: number;
    due_date: string;
    status: 'PENDING' | 'PAID' | 'LATE' | 'CANCELLED';
    payment_method?: 'CASH' | 'BANK_TRANSFER' | 'CHECK' | 'CARD';
};
