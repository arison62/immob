// frontend/js/pages/Contrats/ContratForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/js/components/ui/button';
import { Input } from '@/js/components/ui/input';
import { Label } from '@/js/components/ui/label';
import { Textarea } from '@/js/components/ui/textarea';
import axios from 'axios';

const contratSchema = z.object({
    property_id: z.string().uuid("L'ID de la propriété n'est pas valide."),
    tenant_id: z.string().uuid("L'ID du locataire n'est pas valide."),
    start_date: z.string().min(1, "La date de début est requise."),
    end_date: z.string().min(1, "La date de fin est requise."),
    monthly_rent: z.coerce.number().positive("Le loyer mensuel doit être un nombre positif."),
    security_deposit: z.coerce.number().positive("Le dépôt de garantie doit être un nombre positif.").optional(),
    charges: z.coerce.number().positive("Les charges doivent être un nombre positif.").optional(),
    terms: z.string().optional(),
});

type ContratFormData = z.infer<typeof contratSchema>;

export const ContratForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<ContratFormData>({
        resolver: zodResolver(contratSchema),
    });

    const onSubmit = async (data: ContratFormData) => {
        try {
            await axios.post('/api/finance/contrats/', data);
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="property_id">ID Propriété</Label>
                <Input id="property_id" {...register('property_id')} />
                {errors.property_id && <p className="text-red-500 text-xs mt-1">{errors.property_id.message}</p>}
            </div>
            <div>
                <Label htmlFor="tenant_id">ID Locataire</Label>
                <Input id="tenant_id" {...register('tenant_id')} />
                {errors.tenant_id && <p className="text-red-500 text-xs mt-1">{errors.tenant_id.message}</p>}
            </div>
            <div>
                <Label htmlFor="start_date">Date de Début</Label>
                <Input id="start_date" type="date" {...register('start_date')} />
                {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>}
            </div>
            <div>
                <Label htmlFor="end_date">Date de Fin</Label>
                <Input id="end_date" type="date" {...register('end_date')} />
                {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date.message}</p>}
            </div>
            <div>
                <Label htmlFor="monthly_rent">Loyer Mensuel</Label>
                <Input id="monthly_rent" type="number" {...register('monthly_rent')} />
                {errors.monthly_rent && <p className="text-red-500 text-xs mt-1">{errors.monthly_rent.message}</p>}
            </div>
            <div>
                <Label htmlFor="security_deposit">Dépôt de Garantie</Label>
                <Input id="security_deposit" type="number" {...register('security_deposit')} />
            </div>
            <div>
                <Label htmlFor="charges">Charges</Label>
                <Input id="charges" type="number" {...register('charges')} />
            </div>
            <div className="md:col-span-2">
                <Label htmlFor="terms">Termes du Contrat</Label>
                <Textarea id="terms" {...register('terms')} />
            </div>
            <div className="md:col-span-2 flex justify-end">
                <Button type="submit">Sauvegarder</Button>
            </div>
        </form>
    );
};
