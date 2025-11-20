// frontend/js/pages/Tenants/index.tsx
import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/js/layouts/AuthenticatedLayout';
import { Tenant } from '@/js/types';
import { columns } from './columns';
import { DataTable } from './data-table';
import { UpsertTenantSheet } from './UpsertTenantSheet';
import axios from 'axios';

async function getTenants(): Promise<Tenant[]> {
    const response = await axios.get('/api/finance/tenants/');
    return response.data;
}

const TenantsPage = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);

    useEffect(() => {
        getTenants().then(setTenants);
    }, []);

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
