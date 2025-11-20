// frontend/js/pages/Contrats/ContratForm.tsx
import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/js/components/ui/button';
import { Input } from '@/js/components/ui/input';
import { Label } from '@/js/components/ui/label';
import { Textarea } from '@/js/components/ui/textarea';

export const ContratForm = () => {
    const { data, setData, post, errors } = useForm({
        property_id: '',
        tenant_id: '',
        start_date: '',
        end_date: '',
        monthly_rent: 0,
        security_deposit: 0,
        charges: 0,
        terms: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/contrats');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="property_id">ID Propriété</Label>
                <Input id="property_id" value={data.property_id} onChange={(e) => setData('property_id', e.target.value)} />
                {errors.property_id && <p className="text-red-500 text-xs mt-1">{errors.property_id}</p>}
            </div>
            <div>
                <Label htmlFor="tenant_id">ID Locataire</Label>
                <Input id="tenant_id" value={data.tenant_id} onChange={(e) => setData('tenant_id', e.target.value)} />
                {errors.tenant_id && <p className="text-red-500 text-xs mt-1">{errors.tenant_id}</p>}
            </div>
            <div>
                <Label htmlFor="start_date">Date de Début</Label>
                <Input id="start_date" type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} />
                {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
            </div>
            <div>
                <Label htmlFor="end_date">Date de Fin</Label>
                <Input id="end_date" type="date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} />
                {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
            </div>
            <div>
                <Label htmlFor="monthly_rent">Loyer Mensuel</Label>
                <Input id="monthly_rent" type="number" value={data.monthly_rent} onChange={(e) => setData('monthly_rent', Number(e.target.value))} />
                {errors.monthly_rent && <p className="text-red-500 text-xs mt-1">{errors.monthly_rent}</p>}
            </div>
            <div>
                <Label htmlFor="security_deposit">Dépôt de Garantie</Label>
                <Input id="security_deposit" type="number" value={data.security_deposit} onChange={(e) => setData('security_deposit', Number(e.target.value))} />
            </div>
            <div>
                <Label htmlFor="charges">Charges</Label>
                <Input id="charges" type="number" value={data.charges} onChange={(e) => setData('charges', Number(e.target.value))} />
            </div>
            <div className="md:col-span-2">
                <Label htmlFor="terms">Termes du Contrat</Label>
                <Textarea id="terms" value={data.terms} onChange={(e) => setData('terms', e.target.value)} />
            </div>
            <div className="md:col-span-2 flex justify-end">
                <Button type="submit">Sauvegarder</Button>
            </div>
        </form>
    );
};
