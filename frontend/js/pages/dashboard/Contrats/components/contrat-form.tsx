/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { useContratStore, type Contrat } from "@/store/contrat-store";
import { useTenantStore } from "@/store/tenant-store";
import { usePropertyStore } from "@/store/property-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function ContratForm() {
  const { selectedContrat, addContrat, updateContrat, setFormOpen, clearSelection } = useContratStore();
  const { tenants } = useTenantStore();
  const { properties } = usePropertyStore();

  const { data, setData, post, put, errors, processing, reset, wasSuccessful } = useForm({
    id: selectedContrat?.id || "",
    property_id: selectedContrat?.property_id || "",
    tenant_id: selectedContrat?.tenant_id || "",
    start_date: selectedContrat?.start_date || "",
    end_date: selectedContrat?.end_date || "",
    monthly_rent: selectedContrat?.monthly_rent || 0,
    security_deposit: selectedContrat?.security_deposit || 0,
    charges: selectedContrat?.charges || 0,
    terms: selectedContrat?.terms || "",
    payment_frequency: selectedContrat?.payment_frequency || "MONTHLY",
    payment_method: selectedContrat?.payment_method || "BANK_TRANSFER",
  });

  const isEditing = !!selectedContrat;

  useEffect(() => {
    if (isEditing) {
      setData({
        id: selectedContrat.id,
        property_id: selectedContrat.property_id,
        tenant_id: selectedContrat.tenant_id,
        start_date: selectedContrat.start_date.split('T')[0],
        end_date: selectedContrat.end_date.split('T')[0],
        monthly_rent: selectedContrat.monthly_rent,
        security_deposit: selectedContrat.security_deposit ?? 0,
        charges: selectedContrat.charges ?? 0,
        terms: selectedContrat.terms ?? "",
        payment_frequency: selectedContrat.payment_frequency,
        payment_method: selectedContrat.payment_method,
      });
    } else {
        reset();
    }
  }, [selectedContrat]);

  useEffect(() => {
    const selectedProperty = properties.find(p => p.id === data.property_id);
    if (selectedProperty) {
      setData("monthly_rent", selectedProperty.monthly_rent);
    }
  }, [data.property_id, properties]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const options = {
      preserveScroll: true,
      onSuccess: (page: any) => {
        const newOrUpdatedContrat = page.props.contrat as Contrat;
        if (isEditing) {
          updateContrat(newOrUpdatedContrat);
          toast.success("Contrat mis à jour avec succès.");
        } else {
          addContrat(newOrUpdatedContrat);
          toast.success("Contrat créé avec succès.");
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
      put(`/dashboard/contrats/${data.id}`, options);
    } else {
      post("/dashboard/contrats/", options);
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
        <DialogTitle>{isEditing ? "Modifier le contrat" : "Créer un nouveau contrat"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Modifiez les informations du contrat ci-dessous."
            : "Remplissez les informations pour créer un nouveau contrat."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="base-info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="base-info">Informations de base</TabsTrigger>
            <TabsTrigger value="financial-info">Informations financières</TabsTrigger>
            </TabsList>
            <TabsContent value="base-info">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="property_id">Propriété</Label>
                        <Select value={data.property_id} onValueChange={(value) => setData("property_id", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez une propriété" />
                            </SelectTrigger>
                            <SelectContent>
                                {properties.map((prop) => (
                                    <SelectItem key={prop.id} value={prop.id}>
                                        {prop.name} ({prop.reference_code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.property_id && <p className="text-red-500 text-xs">{errors.property_id}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tenant_id">Locataire</Label>
                        <Select value={data.tenant_id} onValueChange={(value) => setData("tenant_id", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un locataire" />
                            </SelectTrigger>
                            <SelectContent>
                                {tenants.map((tenant) => (
                                    <SelectItem key={tenant.id} value={tenant.id}>
                                        {tenant.first_name} {tenant.last_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.tenant_id && <p className="text-red-500 text-xs">{errors.tenant_id}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="start_date">Date de début</Label>
                        <Input type="date" id="start_date" value={data.start_date} onChange={(e) => setData("start_date", e.target.value)} />
                        {errors.start_date && <p className="text-red-500 text-xs">{errors.start_date}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="end_date">Date de fin</Label>
                        <Input type="date" id="end_date" value={data.end_date} onChange={(e) => setData("end_date", e.target.value)} />
                        {errors.end_date && <p className="text-red-500 text-xs">{errors.end_date}</p>}
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="financial-info">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="monthly_rent">Loyer Mensuel</Label>
                        <Input type="number" id="monthly_rent" value={data.monthly_rent} disabled />
                        {errors.monthly_rent && <p className="text-red-500 text-xs">{errors.monthly_rent}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="payment_frequency">Fréquence de paiement</Label>
                        <Select value={data.payment_frequency} onValueChange={(value) => setData("payment_frequency", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez une fréquence" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MONTHLY">Mensuel</SelectItem>
                                <SelectItem value="QUARTERLY">Trimestriel</SelectItem>
                                <SelectItem value="ANNUALLY">Annuel</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.payment_frequency && <p className="text-red-500 text-xs">{errors.payment_frequency}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="payment_method">Méthode de paiement</Label>
                        <Select value={data.payment_method} onValueChange={(value) => setData("payment_method", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez une méthode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CASH">Espèces</SelectItem>
                                <SelectItem value="BANK_TRANSFER">Virement</SelectItem>
                                <SelectItem value="CHECK">Chèque</SelectItem>
                                <SelectItem value="CARD">Carte</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.payment_method && <p className="text-red-500 text-xs">{errors.payment_method}</p>}
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="terms">Termes du contrat</Label>
                        <Textarea id="terms" value={data.terms} onChange={(e) => setData("terms", e.target.value)} />
                        {errors.terms && <p className="text-red-500 text-xs">{errors.terms}</p>}
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
