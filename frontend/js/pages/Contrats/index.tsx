// frontend/js/pages/Contrats/index.tsx
import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/js/layouts/AuthenticatedLayout';
import { Contrat } from '@/js/types';
import { columns } from './columns';
import { DataTable } from './data-table';
import { UpsertContratSheet } from './UpsertContratSheet';
import axios from 'axios';

// Note: This is a placeholder. The actual implementation will need to fetch
// contracts based on a property or tenant, likely passed as a prop.
async function getContrats(): Promise<Contrat[]> {
    // This endpoint doesn't exist yet. We will need to create it.
    // const response = await axios.get('/api/finance/contrats/');
    // return response.data;
    return []; // Returning empty array for now
}

const ContratsPage = () => {
    const [contrats, setContrats] = useState<Contrat[]>([]);

    useEffect(() => {
        getContrats().then(setContrats);
    }, []);

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
