// frontend/js/pages/Tenants/TenantForm.tsx
import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/js/components/ui/button';
import { Input } from '@/js/components/ui/input';
import { Label } from '@/js/components/ui/label';
import { Textarea } from '@/js/components/ui/textarea';

export const TenantForm = () => {
    const { data, setData, post, errors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        id_number: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/tenants');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="first_name">Prénom</Label>
                <Input id="first_name" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} />
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
            </div>
            <div>
                <Label htmlFor="last_name">Nom</Label>
                <Input id="last_name" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} />
            </div>
            <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div className="md:col-span-2">
                <Label htmlFor="address">Adresse</Label>
                <Textarea id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
            <div>
                <Label htmlFor="id_number">Numéro d'ID</Label>
                <Input id="id_number" value={data.id_number} onChange={(e) => setData('id_number', e.target.value)} />
                {errors.id_number && <p className="text-red-500 text-xs mt-1">{errors.id_number}</p>}
            </div>
            <div>
                <Label htmlFor="emergency_contact_name">Nom du Contact d'Urgence</Label>
                <Input id="emergency_contact_name" value={data.emergency_contact_name} onChange={(e) => setData('emergency_contact_name', e.target.value)} />
                {errors.emergency_contact_name && <p className="text-red-500 text-xs mt-1">{errors.emergency_contact_name}</p>}
            </div>
            <div>
                <Label htmlFor="emergency_contact_phone">Téléphone du Contact d'Urgence</Label>
                <Input id="emergency_contact_phone" value={data.emergency_contact_phone} onChange={(e) => setData('emergency_contact_phone', e.target.value)} />
                {errors.emergency_contact_phone && <p className="text-red-500 text-xs mt-1">{errors.emergency_contact_phone}</p>}
            </div>
            <div className="md:col-span-2 flex justify-end">
                <Button type="submit">Sauvegarder</Button>
            </div>
        </form>
    );
};
