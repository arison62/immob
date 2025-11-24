// frontend/js/pages/Payments/index.tsx
import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/js/layouts/AuthenticatedLayout';
import { Payment } from '@/js/types';
import { columns } from './columns';
import { DataTable } from './data-table';
import { UpsertPaymentSheet } from './UpsertPaymentSheet';

const PaymentsPage = () => {
    const { payments } = usePage<{ payments: Payment[] }>().props;

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
