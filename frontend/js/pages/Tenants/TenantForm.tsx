// frontend/js/pages/Tenants/TenantForm.tsx
import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/js/components/ui/button';
import { Input } from '@/js/components/ui/input';
import { Label } from '@/js/components/ui/label';
import { Textarea } from '@/js/components/ui/textarea';
import { Tenant } from '@/js/types';

interface TenantFormProps {
    tenant?: Tenant;
    onClose: () => void;
}

export const TenantForm = ({ tenant, onClose }: TenantFormProps) => {
    const { data, setData, post, put, errors, processing } = useForm({
        first_name: tenant?.first_name || '',
        last_name: tenant?.last_name || '',
        email: tenant?.email || '',
        phone: tenant?.phone || '',
        address: tenant?.address || '',
        id_number: tenant?.id_number || '',
        emergency_contact_name: tenant?.emergency_contact_name || '',
        emergency_contact_phone: tenant?.emergency_contact_phone || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tenant) {
            put(`/tenants`, {
                onSuccess: () => onClose(),
            });
        } else {
            post('/tenants', {
                onSuccess: () => onClose(),
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fields remain the same, just controlled by Inertia's useForm */}
            {/* ... all the input fields ... */}
            <div className="md:col-span-2 flex justify-end">
                <Button type="submit" disabled={processing}>
                    {tenant ? 'Mettre à jour' : 'Sauvegarder'}
                </Button>
            </div>
        </form>
    );
};
