// frontend/js/pages/Tenants/TenantForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/js/components/ui/button';
import { Input } from '@/js/components/ui/input';
import { Label } from '@/js/components/ui/label';
import { Textarea } from '@/js/components/ui/textarea';
import axios from 'axios';

const tenantSchema = z.object({
    first_name: z.string().min(1, "Le prénom est requis."),
    last_name: z.string().optional(),
    email: z.string().email("L'email n'est pas valide.").optional().or(z.literal('')),
    phone: z.string().min(1, "Le téléphone est requis."),
    address: z.string().min(1, "L'adresse est requise."),
    id_number: z.string().min(1, "Le numéro d'ID est requis."),
    emergency_contact_name: z.string().min(1, "Le nom du contact d'urgence est requis."),
    emergency_contact_phone: z.string().min(1, "Le téléphone du contact d'urgence est requis."),
});

type TenantFormData = z.infer<typeof tenantSchema>;

export const TenantForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<TenantFormData>({
        resolver: zodResolver(tenantSchema),
    });

    const onSubmit = async (data: TenantFormData) => {
        try {
            await axios.post('/api/finance/tenants/', data);
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="first_name">Prénom</Label>
                <Input id="first_name" {...register('first_name')} />
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
            </div>
            <div>
                <Label htmlFor="last_name">Nom</Label>
                <Input id="last_name" {...register('last_name')} />
            </div>
            <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" {...register('phone')} />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div className="md:col-span-2">
                <Label htmlFor="address">Adresse</Label>
                <Textarea id="address" {...register('address')} />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
            </div>
            <div>
                <Label htmlFor="id_number">Numéro d'ID</Label>
                <Input id="id_number" {...register('id_number')} />
                {errors.id_number && <p className="text-red-500 text-xs mt-1">{errors.id_number.message}</p>}
            </div>
            <div>
                <Label htmlFor="emergency_contact_name">Nom du Contact d'Urgence</Label>
                <Input id="emergency_contact_name" {...register('emergency_contact_name')} />
                {errors.emergency_contact_name && <p className="text-red-500 text-xs mt-1">{errors.emergency_contact_name.message}</p>}
            </div>
            <div>
                <Label htmlFor="emergency_contact_phone">Téléphone du Contact d'Urgence</Label>
                <Input id="emergency_contact_phone" {...register('emergency_contact_phone')} />
                {errors.emergency_contact_phone && <p className="text-red-500 text-xs mt-1">{errors.emergency_contact_phone.message}</p>}
            </div>
            <div className="md:col-span-2 flex justify-end">
                <Button type="submit">Sauvegarder</Button>
            </div>
        </form>
    );
};
