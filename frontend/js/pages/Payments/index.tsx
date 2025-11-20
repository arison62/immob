// frontend/js/pages/Payments/index.tsx
import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/js/layouts/AuthenticatedLayout';
import { Payment } from '@/js/types';
import { columns } from './columns';
import { DataTable } from './data-table';
import { UpsertPaymentSheet } from './UpsertPaymentSheet';
import axios from 'axios';

// Note: This is a placeholder. The actual implementation will need to fetch
// payments based on a contract, likely passed as a prop.
async function getPayments(): Promise<Payment[]> {
    // This endpoint should be something like /api/finance/contrats/{contrat_id}/payments/
    // const response = await axios.get('/api/finance/payments/');
    // return response.data;
    return []; // Returning empty array for now
}

const PaymentsPage = () => {
    const [payments, setPayments] = useState<Payment[]>([]);

    useEffect(() => {
        getPayments().then(setPayments);
    }, []);

    return (
        <AuthenticatedLayout>
            <Head title="Gestion des Paiements" />
            <div className="container mx-auto py-10">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Gestion des Paiements</h1>
                    <UpsertPaymentSheet />
                </div>
                <DataTable columns={columns} data={payments} />
            </div>
        </AuthenticatedLayout>
    );
};

export default PaymentsPage;
