// frontend/js/pages/Payments/PaymentForm.tsx
import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/js/components/ui/button';
import { Input } from '@/js/components/ui/input';
import { Label } from '@/js/components/ui/label';
import { Payment } from '@/js/types';

interface PaymentFormProps {
    payment?: Payment;
    onClose: () => void;
}

export const PaymentForm = ({ payment, onClose }: PaymentFormProps) => {
    const { data, setData, post, put, errors, processing } = useForm({
        contrat_id: payment?.contrat_id || '',
        amount: payment?.amount || 0,
        due_date: payment?.due_date || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (payment) {
            put(`/payments`, {
                onSuccess: () => onClose(),
            });
        } else {
            post('/payments', {
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
                    {payment ? 'Mettre à jour' : 'Sauvegarder'}
                </Button>
            </div>
        </form>
    );
};
