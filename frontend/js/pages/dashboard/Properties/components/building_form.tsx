// frontend/js/Pages/Portfolio/components/BuildingForm.tsx
// (Assurez-vous que les imports de shadcn et des stores sont corrects)

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Ajout pour la description
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // Import des Tabs
import { useForm } from "@inertiajs/react";
import { useEffect, type FormEvent } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { usePropertyStore, type Building } from "../property-store";

// Type pour le formulaire, basé sur BuildingCreateDTO
type AddressFormData = {
  street: string;
  postal_code?: string;
  city: string;
  country: string;
};

type BuildingFormData = {
  formType: "building";
  id?: string;
  name: string;
  description: string;
  floor_count: string | number; // Utiliser string pour le champ de formulaire
  address: AddressFormData;
};

export default function BuildingForm() {
  const {
    selectedBuilding,
    addBuilding,
    updateBuilding,
    clearBuildingSelection,
  } = useStore(
    usePropertyStore,
    useShallow((state) => ({
      selectedBuilding: state.selectedBuilding,
      addBuilding: state.addBuilding,
      updateBuilding: state.updateBuilding,
      clearBuildingSelection: state.clearBuildingSelection,
    }))
  );

  const isEditing = !!selectedBuilding;

  const { data, setData, post, put, processing, errors, reset, clearErrors } =
    useForm<BuildingFormData>({
      formType: "building",
      id: undefined,
      name: "",
      description: "",
      floor_count: "",
      address: {
        street: "",
        postal_code: undefined,
        city: "",
        country: "Cameroon", // Valeur par défaut
      },
    });

  // Hydratation du formulaire en mode édition
  useEffect(() => {
    if (selectedBuilding) {
      // Mode Édition
      setData({
        id: selectedBuilding.id,
        name: selectedBuilding.name,
        description: selectedBuilding.description || "",
        floor_count: selectedBuilding.floor_count || "",
        address: {
          street: selectedBuilding.street,
          postal_code: selectedBuilding.postal_code,
          city: selectedBuilding.city,
          country: selectedBuilding.country,
        },
      });
    } else {
      // Mode Création
      reset();
    }
    clearErrors();
  }, [clearErrors, reset, selectedBuilding, setData]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const method = isEditing ? put : post;

    method("", {
      preserveScroll: true,
      replace: false,
      onSuccess: ({ props }) => {
        // Assumer que le backend renvoie le bâtiment mis à jour/créé
        const updatedOrNewBuilding = props.building as Building;

        if (isEditing) {
          updateBuilding(updatedOrNewBuilding);
        } else {
          addBuilding(updatedOrNewBuilding);
        }
        clearBuildingSelection(); // Ferme le formulaire/modale et reset la sélection
        clearErrors();
        reset();
      },
      onError: (err) => {
        console.log("Erreur de soumission du bâtiment: ", err);
      },
    });
  };

  return (
    <Card className="shadow-none border-none">
      <CardHeader>
        <CardTitle>
          {isEditing
            ? `Modifier l'immeuble : ${selectedBuilding?.name}`
            : "Créer un nouvel immeuble"}
        </CardTitle>
      </CardHeader>

      {/* Le formulaire englobe l'ensemble des onglets */}
      <form onSubmit={submit}>
        <Tabs defaultValue="info" className="w-full">
          <TabsList>
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="address">Adresse</TabsTrigger>
            <TabsTrigger value="photos" disabled={isEditing}>
              Photos
            </TabsTrigger>
            <TabsTrigger value="access" disabled={isEditing}>
              Accès
            </TabsTrigger>
          </TabsList>

          {/* Onglet 1: Informations Générales et Adresse */}
          <TabsContent value="info">
            <CardContent className="space-y-6 pt-6">
              <FieldSet>
                <FieldLegend>Informations Générales</FieldLegend>
                <FieldGroup>
                  <Field orientation="responsive" data-invalid={!!errors.name}>
                    <FieldLabel htmlFor="name">Nom de l'immeuble</FieldLabel>
                    <FieldContent>
                      <Input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        disabled={processing}
                      />
                      <FieldError>{errors.name}</FieldError>
                    </FieldContent>
                  </Field>
                  <Field
                    orientation="responsive"
                    data-invalid={!!errors.floor_count}
                  >
                    <FieldLabel htmlFor="floor_count">
                      Nombre d'étages
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="floor_count"
                        type="number"
                        value={data.floor_count}
                        onChange={(e) => setData("floor_count", e.target.value)}
                        disabled={processing}
                      />
                      <FieldError>{errors.floor_count}</FieldError>
                    </FieldContent>
                  </Field>
                  <Field
                    orientation="responsive"
                    data-invalid={!!errors.description}
                  >
                    <FieldLabel htmlFor="description">Description</FieldLabel>
                    <FieldContent>
                      <Textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                        disabled={processing}
                      />
                      <FieldError>{errors.description}</FieldError>
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </CardContent>
          </TabsContent>

          {/* Onglet 2: Adresse */}
          <TabsContent value="address">
            <CardContent className="space-y-6 pt-6">
              <FieldSet>
                <FieldLegend>Adresse</FieldLegend>
                <FieldGroup>
                  <Field
                    orientation="responsive"
                    data-invalid={!!errors["address.street"]}
                  >
                    <FieldLabel htmlFor="street">Rue</FieldLabel>
                    <FieldContent>
                      <Input
                        id="street"
                        type="text"
                        value={data.address.street}
                        onChange={(e) =>
                          setData("address.street", e.target.value)
                        }
                        disabled={processing}
                      />
                      <FieldError>{errors["address.street"]}</FieldError>
                    </FieldContent>
                  </Field>

                  <Field
                    orientation="responsive"
                    data-invalid={!!errors["address.postal_code"]}
                  >
                    <FieldLabel htmlFor="postal_code">Code Postal</FieldLabel>
                    <FieldContent>
                      <Input
                        id="postal_code"
                        type="text"
                        value={data.address.postal_code}
                        onChange={(e) =>
                          setData("address.postal_code", e.target.value)
                        }
                        disabled={processing}
                      />
                      <FieldError>{errors["address.postal_code"]}</FieldError>
                    </FieldContent>
                  </Field>

                  <Field
                    orientation="responsive"
                    data-invalid={!!errors["address.city"]}
                  >
                    <FieldLabel htmlFor="city">Ville</FieldLabel>
                    <FieldContent>
                      <Input
                        id="city"
                        type="text"
                        value={data.address.city}
                        onChange={(e) =>
                          setData("address.city", e.target.value)
                        }
                        disabled={processing}
                      />
                      <FieldError>{errors["address.city"]}</FieldError>
                    </FieldContent>
                  </Field>

                  <Field
                    orientation="responsive"
                    data-invalid={!!errors["address.country"]}
                  >
                    <FieldLabel htmlFor="country">Pays</FieldLabel>
                    <FieldContent>
                      <Input
                        id="country"
                        type="text"
                        value={data.address.country}
                        onChange={(e) =>
                          setData("address.country", e.target.value)
                        }
                        disabled={processing}
                      />
                      <FieldError>{errors["address.country"]}</FieldError>
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </CardContent>
          </TabsContent>

          {/* Onglet 2: Gestion des Photos (À implémenter) */}
          <TabsContent value="photos">
            <CardContent className="space-y-6 pt-6">
              <FieldSet>
                <FieldLegend>Gestion des Photos</FieldLegend>
                <p className="text-muted-foreground text-sm">
                  La gestion des photos sera disponible ici après la création de
                  l'immeuble. (Composant d'upload et de sélection de la photo
                  primaire à venir).
                </p>
              </FieldSet>
            </CardContent>
          </TabsContent>

          {/* Onglet 3: Gestion des Accès (À implémenter) */}
          <TabsContent value="access">
            <CardContent className="space-y-6 pt-6">
              <FieldSet>
                <FieldLegend>Gestion des Droits d'Accès</FieldLegend>
                <p className="text-muted-foreground text-sm">
                  La gestion des permissions (basée sur
                  `UserBuildingPermission`) sera disponible ici. (Composant de
                  recherche d'utilisateur et d'assignation de rôle à venir).
                </p>
              </FieldSet>
            </CardContent>
          </TabsContent>

          {/* Bouton de soumission (toujours visible) */}
          <CardContent>
            <Field orientation="horizontal" className="justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => clearBuildingSelection()}
                disabled={processing}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={processing}>
                {processing && <Spinner />}
                {processing
                  ? isEditing
                    ? "Mise à jour..."
                    : "Création en cours..."
                  : isEditing
                  ? "Sauvegarder les modifications"
                  : "Créer l'immeuble"}
              </Button>
            </Field>
          </CardContent>
        </Tabs>
      </form>
    </Card>
  );
}
