// frontend/js/pages/Contrats/index.tsx
import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/js/layouts/AuthenticatedLayout';
import { Contrat } from '@/js/types';
import { columns } from './columns';
import { DataTable } from './data-table';
import { UpsertContratSheet } from './UpsertContratSheet';

const ContratsPage = () => {
    const { contrats } = usePage<{ contrats: Contrat[] }>().props;

    return (
        <AuthenticatedLayout>
            <Head title="Gestion des Contrats" />
            <div className="container mx-auto py-10">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Gestion des Contrats</h1>
                    <UpsertContratSheet />
                </div>
                <DataTable columns={columns} data={contrats} />
            </div>
        </AuthenticatedLayout>
    );
};

export default ContratsPage;
