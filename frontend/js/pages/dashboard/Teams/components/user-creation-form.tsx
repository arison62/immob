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
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { useForm } from "@inertiajs/react";
import type { FormEvent } from "react";
import { Spinner } from "@/components/ui/spinner";

type UserFormData = {
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

export default function UserCreationForm({
  initialData = {},
}: {
  initialData?: Partial<UserFormData>;
}) {
  const { data, setData, post, processing, errors, reset } = useForm({
    first_name: initialData.first_name || "",
    last_name: initialData.last_name || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    role: initialData.role || "MANAGER", // Rôle par défaut MANAGER ou à définir
    password: "",
    password_confirmation: "",
  });

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    post("", {
      preserveScroll: true,
      replace: false,
      onSuccess: () => reset("password", "password_confirmation"),
      
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
        <CardTitle>Créer un nouvel utilisateur</CardTitle>
      </CardHeader>
      <form onSubmit={submit}>
        <CardContent className="space-y-6">
          <FieldGroup>
            {/* Champ Prénom */}
            <Field orientation="responsive" data-invalid={!!errors.first_name}>
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
            <Field orientation="responsive" data-invalid={!!errors.last_name}>
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
          </FieldGroup>

          {/* Section Mot de Passe */}
          <FieldSet>
            <FieldLegend>Définir le mot de passe</FieldLegend>
            <FieldGroup>
              <Field orientation="responsive" data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                <FieldContent>
                  <Input
                    id="password"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData("password", e.target.value)}
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
                  <FieldError>{errors.password_confirmation}</FieldError>
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal" className="justify-end">
            <Button type="submit" disabled={processing || !validatePasswordMatch()}>
              {processing && <Spinner />}
              {processing ? "Création en cours..." : "Créer l'utilisateur"}
            </Button>
          </Field>
        </CardContent>
      </form>
    </Card>
  );
}
