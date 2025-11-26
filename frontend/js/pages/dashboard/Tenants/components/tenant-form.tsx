/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { useTenantStore, type Tenant } from "@/store/tenant-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TenantForm() {
  const { selectedTenant, addTenant, updateTenant, setFormOpen, clearSelection } = useTenantStore();

  const { data, setData, post, put, errors, processing, reset, wasSuccessful } = useForm({
    id: selectedTenant?.id,
    first_name: selectedTenant?.first_name || "",
    last_name: selectedTenant?.last_name || "",
    email: selectedTenant?.email || "",
    phone: selectedTenant?.phone || "",
    id_number: selectedTenant?.id_number || "",
    address: selectedTenant?.address || "",
    emergency_contact_name: selectedTenant?.emergency_contact_name || "",
    emergency_contact_phone: selectedTenant?.emergency_contact_phone || "",
  });

  const isEditing = !!selectedTenant;

  useEffect(() => {
    if (isEditing) {
      setData({
        // @ts-expect-error selectedTenant is checked by isEditing, but TS doesn't narrow it in the setData call
        id: selectedTenant.id,
        first_name: selectedTenant.first_name,
        last_name: selectedTenant.last_name,
        email: selectedTenant.email,
        phone: selectedTenant.phone,
        id_number: selectedTenant.id_number,
        address: selectedTenant.address,
        emergency_contact_name: selectedTenant.emergency_contact_name,
        emergency_contact_phone: selectedTenant.emergency_contact_phone,
      });
    } else {
      reset();
    }
  }, [selectedTenant, reset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const options = {
      preserveScroll: true,
      onSuccess: (page: any) => {
        const newOrUpdatedTenant = page.props.tenant as Tenant;
        if (isEditing) {
          updateTenant(newOrUpdatedTenant);
          toast.success("Locataire mis à jour avec succès.");
        } else {
          addTenant(newOrUpdatedTenant);
          toast.success("Locataire créé avec succès.");
        }
        setFormOpen(false);
        clearSelection();
      },
      onError: (errors: any) => {
        console.error("Form errors:", errors);
        toast.error("Une erreur est survenue.");
      },
    };

    if (isEditing) {
      put(`/dashboard/tenants/${data.id}`, options);
    } else {
      post("/dashboard/tenants/", options);
    }
  };

  useEffect(() => {
      if(wasSuccessful) {
        setFormOpen(false);
        clearSelection();
      }
  }, [wasSuccessful]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Modifier le locataire" : "Créer un nouveau locataire"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Modifiez les informations du locataire ci-dessous."
            : "Remplissez les informations pour créer un nouveau locataire."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="base-info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="base-info">Informations de base</TabsTrigger>
            <TabsTrigger value="emergency-contact">Contact d'urgence</TabsTrigger>
            </TabsList>
            <TabsContent value="base-info">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="first_name">Prénom</Label>
                        <Input id="first_name" value={data.first_name} onChange={(e) => setData("first_name", e.target.value)} />
                        {errors.first_name && <p className="text-red-500 text-xs">{errors.first_name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="last_name">Nom</Label>
                        <Input id="last_name" value={data.last_name} onChange={(e) => setData("last_name", e.target.value)} />
                        {errors.last_name && <p className="text-red-500 text-xs">{errors.last_name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input type="email" id="email" value={data.email} onChange={(e) => setData("email", e.target.value)} />
                        {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input type="tel" id="phone" value={data.phone} onChange={(e) => setData("phone", e.target.value)} />
                        {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="id_number">Numéro d'identification</Label>
                        <Input id="id_number" value={data.id_number} onChange={(e) => setData("id_number", e.target.value)} />
                        {errors.id_number && <p className="text-red-500 text-xs">{errors.id_number}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Adresse</Label>
                        <Input id="address" value={data.address} onChange={(e) => setData("address", e.target.value)} />
                        {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="emergency-contact">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="emergency_contact_name">Nom du contact d'urgence</Label>
                        <Input id="emergency_contact_name" value={data.emergency_contact_name} onChange={(e) => setData("emergency_contact_name", e.target.value)} />
                        {errors.emergency_contact_name && <p className="text-red-500 text-xs">{errors.emergency_contact_name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="emergency_contact_phone">Téléphone du contact d'urgence</Label>
                        <Input type="tel" id="emergency_contact_phone" value={data.emergency_contact_phone} onChange={(e) => setData("emergency_contact_phone", e.target.value)} />
                        {errors.emergency_contact_phone && <p className="text-red-500 text-xs">{errors.emergency_contact_phone}</p>}
                    </div>
                </div>
            </TabsContent>
        </Tabs>
      </form>
       <DialogFooter>
        <DialogClose asChild>
            <Button variant="outline" onClick={() => {
                setFormOpen(false);
                clearSelection();
            }}>
                Annuler
            </Button>
        </DialogClose>
        <Button onClick={handleSubmit} disabled={processing}>
          {processing ? "Sauvegarde..." : (isEditing ? "Mettre à jour" : "Sauvegarder")}
        </Button>
      </DialogFooter>
    </>
  );
}
