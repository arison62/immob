// frontend/js/pages/Payments/PaymentForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/js/components/ui/button';
import { Input } from '@/js/components/ui/input';
import { Label } from '@/js/components/ui/label';
import axios from 'axios';

const paymentSchema = z.object({
    contrat_id: z.string().uuid("L'ID du contrat n'est pas valide."),
    amount: z.coerce.number().positive("Le montant doit être un nombre positif."),
    due_date: z.string().min(1, "La date d'échéance est requise."),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export const PaymentForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<PaymentFormData>({
        resolver: zodResolver(paymentSchema),
    });

    const onSubmit = async (data: PaymentFormData) => {
        try {
            await axios.post('/api/finance/payments/', data);
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="contrat_id">ID Contrat</Label>
                <Input id="contrat_id" {...register('contrat_id')} />
                {errors.contrat_id && <p className="text-red-500 text-xs mt-1">{errors.contrat_id.message}</p>}
            </div>
            <div>
                <Label htmlFor="amount">Montant</Label>
                <Input id="amount" type="number" {...register('amount')} />
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
            </div>
            <div>
                <Label htmlFor="due_date">Date d'Échéance</Label>
                <Input id="due_date" type="date" {...register('due_date')} />
                {errors.due_date && <p className="text-red-500 text-xs mt-1">{errors.due_date.message}</p>}
            </div>
            <div className="md:col-span-2 flex justify-end">
                <Button type="submit">Sauvegarder</Button>
            </div>
        </form>
    );
};
