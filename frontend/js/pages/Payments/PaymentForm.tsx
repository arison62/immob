// frontend/js/pages/Payments/PaymentForm.tsx
import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/js/components/ui/button';
import { Input } from '@/js/components/ui/input';
import { Label } from '@/js/components/ui/label';

export const PaymentForm = () => {
    const { data, setData, post, errors } = useForm({
        contrat_id: '',
        amount: 0,
        due_date: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/payments');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="contrat_id">ID Contrat</Label>
                <Input id="contrat_id" value={data.contrat_id} onChange={(e) => setData('contrat_id', e.target.value)} />
                {errors.contrat_id && <p className="text-red-500 text-xs mt-1">{errors.contrat_id}</p>}
            </div>
            <div>
                <Label htmlFor="amount">Montant</Label>
                <Input id="amount" type="number" value={data.amount} onChange={(e) => setData('amount', Number(e.target.value))} />
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            </div>
            <div>
                <Label htmlFor="due_date">Date d'Échéance</Label>
                <Input id="due_date" type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} />
                {errors.due_date && <p className="text-red-500 text-xs mt-1">{errors.due_date}</p>}
            </div>
            <div className="md:col-span-2 flex justify-end">
                <Button type="submit">Sauvegarder</Button>
            </div>
        </form>
    );
};
