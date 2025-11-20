import React from 'react';
import { useForm } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CreateTenantFormProps {
  setOpen: (open: boolean) => void;
}

const CreateTenantForm: React.FC<CreateTenantFormProps> = ({ setOpen }) => {
  const { data, setData, post, processing, errors, reset } = useForm({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    id_number: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/dashboard/tenants/', {
      onSuccess: () => {
        setOpen(false);
        reset();
      },
    });
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="first_name" className="text-right">First Name</Label>
          <Input id="first_name" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} className="col-span-3" />
          {errors.first_name && <p className="col-span-4 text-red-500 text-xs text-right">{errors.first_name}</p>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="last_name" className="text-right">Last Name</Label>
          <Input id="last_name" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} className="col-span-3" />
          {errors.last_name && <p className="col-span-4 text-red-500 text-xs text-right">{errors.last_name}</p>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">Email</Label>
          <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="col-span-3" />
          {errors.email && <p className="col-span-4 text-red-500 text-xs text-right">{errors.email}</p>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="phone" className="text-right">Phone</Label>
          <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="col-span-3" />
          {errors.phone && <p className="col-span-4 text-red-500 text-xs text-right">{errors.phone}</p>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="id_number" className="text-right">ID Number</Label>
          <Input id="id_number" value={data.id_number} onChange={(e) => setData('id_number', e.target.value)} className="col-span-3" />
          {errors.id_number && <p className="col-span-4 text-red-500 text-xs text-right">{errors.id_number}</p>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="address" className="text-right">Address</Label>
          <Textarea id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} className="col-span-3" />
          {errors.address && <p className="col-span-4 text-red-500 text-xs text-right">{errors.address}</p>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="emergency_contact_name" className="text-right">Emergency Contact Name</Label>
          <Input id="emergency_contact_name" value={data.emergency_contact_name} onChange={(e) => setData('emergency_contact_name', e.target.value)} className="col-span-3" />
          {errors.emergency_contact_name && <p className="col-span-4 text-red-500 text-xs text-right">{errors.emergency_contact_name}</p>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="emergency_contact_phone" className="text-right">Emergency Contact Phone</Label>
          <Input id="emergency_contact_phone" value={data.emergency_contact_phone} onChange={(e) => setData('emergency_contact_phone', e.target.value)} className="col-span-3" />
          {errors.emergency_contact_phone && <p className="col-span-4 text-red-500 text-xs text-right">{errors.emergency_contact_phone}</p>}
        </div>
      </div>
      <Button type="submit" disabled={processing}>Create Tenant</Button>
    </form>
  );
};

export default CreateTenantForm;
