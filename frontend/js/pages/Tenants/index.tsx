// frontend/js/pages/Tenants/index.tsx
import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/js/layouts/AuthenticatedLayout';
import { Tenant } from '@/js/types';
import { columns } from './columns';
import { DataTable } from './data-table';
import { UpsertTenantSheet } from './UpsertTenantSheet';

const TenantsPage = () => {
    const { tenants } = usePage<{ tenants: Tenant[] }>().props;

    return (
        <AuthenticatedLayout>
            <Head title="Gestion des Locataires" />
            <div className="container mx-auto py-10">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Gestion des Locataires</h1>
                    <UpsertTenantSheet />
                </div>
                <DataTable columns={columns} data={tenants} />
            </div>
        </AuthenticatedLayout>
    );
};

export default TenantsPage;
