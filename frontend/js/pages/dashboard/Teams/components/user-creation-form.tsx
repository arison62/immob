import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldDescription,
} from "@/components/ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useForm } from "@inertiajs/react";
import { useEffect, type FormEvent } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { useTeamStore, type User } from "../../../../store/team-store";

type UserFormData = {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  password: string;
  password_confirmation: string;
};

// Rôles définis dans accounts/models.py
const USER_ROLES = [
  { value: "MANAGER", label: "Gestionnaire" },
  { value: "VIEWER", label: "Consultant" },
];

export default function UserCreationForm() {
  const { selectedUser, addUser, updateUser, clearSelection } = useStore(
    useTeamStore,
    useShallow((state) => ({
      selectedUser: state.selectedUser,
      addUser: state.addUser,
      updateUser: state.updateUser,
      clearSelection: state.clearSelection,
    }))
  );
  const isEditing = !!selectedUser;
  const { data, setData, post, put, processing, errors, reset, clearErrors } =
    useForm<UserFormData>({
      id: undefined,
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "VIEWER",
      password: "",
      password_confirmation: "",
    });

  useEffect(() => {
    if (selectedUser) {
      // Mode Édition
      setData({
        first_name: selectedUser.first_name,
        last_name: selectedUser.last_name,
        email: selectedUser.email,
        id: selectedUser.id,
        role: selectedUser.role,
        phone: selectedUser.phone || "",
        password: "",
        password_confirmation: "",
      });
    } else {
      reset();
    }
    clearErrors();
  }, [selectedUser]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const method = isEditing ? put : post;
    method("", {
      preserveScroll: true,
      replace: false,
      except: ["users"],
      onSuccess: ({ props }) => {
        const updatedOrNewUser = props.user as User;
        
        if (isEditing) {
          updateUser(updatedOrNewUser);
        } else {
          addUser(updatedOrNewUser);
        }
        clearSelection();
        clearErrors();
        reset("password", "password_confirmation");
      },
      onError: (err) => {
        console.log("Error : ", err);
      },
    });
  };

  const validatePasswordMatch = () => {
    if (!data.password || !data.password_confirmation) {
      return false; // Ne pas valider si l'un des champs est vide
    }
    return data.password === data.password_confirmation;
  };

  return (
    <Card className="shadow-none border-none">
      <CardHeader>
        <CardTitle>
          {isEditing ? "Modifier l'utilisateur" : "Créer un nouvel utilisateur"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={submit}>
        <CardContent>
          <Tabs defaultValue="informations" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="informations">
                Informations personnelles
              </TabsTrigger>
              <TabsTrigger value="securite">Sécurité et accès</TabsTrigger>
            </TabsList>

            {/* Onglet Informations personnelles */}
            <TabsContent value="informations" className="space-y-4 pt-4">
              <FieldGroup>
                {/* Champ Prénom */}
                <Field
                  orientation="responsive"
                  data-invalid={!!errors.first_name}
                >
                  <FieldLabel htmlFor="first_name">Prénom</FieldLabel>
                  <FieldContent>
                    <Input
                      id="first_name"
                      type="text"
                      value={data.first_name}
                      onChange={(e) => setData("first_name", e.target.value)}
                      autoComplete="given-name"
                      disabled={processing}
                    />
                    <FieldError>{errors.first_name}</FieldError>
                  </FieldContent>
                </Field>

                {/* Champ Nom */}
                <Field
                  orientation="responsive"
                  data-invalid={!!errors.last_name}
                >
                  <FieldLabel htmlFor="last_name">Nom</FieldLabel>
                  <FieldContent>
                    <Input
                      id="last_name"
                      type="text"
                      value={data.last_name}
                      onChange={(e) => setData("last_name", e.target.value)}
                      autoComplete="family-name"
                      disabled={processing}
                    />
                    <FieldError>{errors.last_name}</FieldError>
                  </FieldContent>
                </Field>

                {/* Champ Email */}
                <Field orientation="responsive" data-invalid={!!errors.email}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <FieldContent>
                    <Input
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => setData("email", e.target.value)}
                      autoComplete="email"
                      disabled={processing}
                    />
                    <FieldError>{errors.email}</FieldError>
                  </FieldContent>
                </Field>

                {/* Champ Téléphone */}
                <Field orientation="responsive" data-invalid={!!errors.phone}>
                  <FieldLabel htmlFor="phone">Téléphone</FieldLabel>
                  <FieldContent>
                    <Input
                      id="phone"
                      type="text"
                      value={data.phone}
                      onChange={(e) => setData("phone", e.target.value)}
                      autoComplete="tel"
                      disabled={processing}
                    />
                    <FieldError>{errors.phone}</FieldError>
                  </FieldContent>
                </Field>
              </FieldGroup>
            </TabsContent>

            {/* Onglet Sécurité et accès */}
            <TabsContent value="securite" className="space-y-4 pt-4">
              <FieldGroup>
                {/* Champ Rôle */}
                <Field orientation="responsive" data-invalid={!!errors.role}>
                  <FieldLabel htmlFor="role">Rôle d'accès</FieldLabel>
                  <FieldContent>
                    <Select
                      value={data.role}
                      onValueChange={(value) => setData("role", value)}
                      disabled={processing}
                    >
                      <SelectTrigger id="role" className="w-full">
                        <SelectValue placeholder="Sélectionnez un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        {USER_ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Définit le niveau d'accès de l'utilisateur.
                    </FieldDescription>
                    <FieldError>{errors.role}</FieldError>
                  </FieldContent>
                </Field>

                {/* Section Mot de Passe - seulement en création */}
                {!isEditing && (
                  <FieldSet>
                    <FieldLegend>Définir le mot de passe</FieldLegend>
                    <FieldGroup>
                      <Field
                        orientation="responsive"
                        data-invalid={!!errors.password}
                      >
                        <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                        <FieldContent>
                          <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) =>
                              setData("password", e.target.value)
                            }
                            autoComplete="new-password"
                            disabled={processing}
                          />
                          <FieldError>{errors.password}</FieldError>
                        </FieldContent>
                      </Field>

                      <Field
                        orientation="responsive"
                        data-invalid={!!errors.password_confirmation}
                      >
                        <FieldLabel htmlFor="password_confirmation">
                          Confirmer mot de passe
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) =>
                              setData("password_confirmation", e.target.value)
                            }
                            autoComplete="new-password"
                            disabled={processing}
                          />
                          <FieldError>
                            {errors.password_confirmation}
                          </FieldError>
                        </FieldContent>
                      </Field>
                    </FieldGroup>
                  </FieldSet>
                )}
              </FieldGroup>
            </TabsContent>
          </Tabs>

          {/* Bouton de soumission en dehors des onglets */}
          <Field
            orientation="horizontal"
            className="justify-end mt-6 pt-4 border-t"
          >
            <Button
              type="submit"
              disabled={processing || (!isEditing && !validatePasswordMatch())}
            >
              {processing && <Spinner />}
              {processing
                ? isEditing
                  ? "Mise à jour..."
                  : "Création en cours..."
                : isEditing
                ? "Sauvegarder les modifications"
                : "Créer l'utilisateur"}
            </Button>
          </Field>
        </CardContent>
      </form>
    </Card>
  );
}
