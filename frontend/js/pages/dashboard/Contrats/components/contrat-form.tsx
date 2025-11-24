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
      });
    } else {
        reset();
    }
  }, [selectedContrat]);

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
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
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
        <div className="space-y-2">
          <Label htmlFor="monthly_rent">Loyer Mensuel</Label>
          <Input type="number" id="monthly_rent" value={data.monthly_rent} onChange={(e) => setData("monthly_rent", parseFloat(e.target.value) || 0)} />
          {errors.monthly_rent && <p className="text-red-500 text-xs">{errors.monthly_rent}</p>}
        </div>
        <div className="md:col-span-2 space-y-2">
            <Label htmlFor="terms">Termes du contrat</Label>
            <Textarea id="terms" value={data.terms} onChange={(e) => setData("terms", e.target.value)} />
            {errors.terms && <p className="text-red-500 text-xs">{errors.terms}</p>}
        </div>
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
