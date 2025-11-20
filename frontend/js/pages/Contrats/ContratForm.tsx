// frontend/js/pages/Contrats/ContratForm.tsx
import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/js/components/ui/button';
import { Input } from '@/js/components/ui/input';
import { Label } from '@/js/components/ui/label';
import { Textarea } from '@/js/components/ui/textarea';
import { Contrat } from '@/js/types';

interface ContratFormProps {
    contrat?: Contrat;
    onClose: () => void;
}

export const ContratForm = ({ contrat, onClose }: ContratFormProps) => {
    const { data, setData, post, put, errors, processing } = useForm({
        property_id: contrat?.property_id || '',
        tenant_id: contrat?.tenant_id || '',
        start_date: contrat?.start_date || '',
        end_date: contrat?.end_date || '',
        monthly_rent: contrat?.monthly_rent || 0,
        security_deposit: contrat?.security_deposit || 0,
        charges: contrat?.charges || 0,
        terms: contrat?.terms || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (contrat) {
            put(`/contrats`, {
                onSuccess: () => onClose(),
            });
        } else {
            post('/contrats', {
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
                    {contrat ? 'Mettre à jour' : 'Sauvegarder'}
                </Button>
            </div>
        </form>
    );
};
