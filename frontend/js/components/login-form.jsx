import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { EyeClosedIcon, EyeIcon, Lock, MailIcon } from "lucide-react";
import { Form, router, usePage } from "@inertiajs/react";

export function LoginForm({ className, ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Form
      method="POST"
      options={{
        forceFormData: true,
        preserveScroll: true,
        onSuccess: (page) => {
          console.log("Page : ", page);
        },
        onError: (erros) => {
          console.log("Errors : ", erros);
        },
      }}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      {({ processing, errors, hasErrors }) => (
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">
              Connectez-vous a votre compte
            </h1>
            <p className="text-muted-foreground text-sm text-balance">
              Entrez vos identifiants pour vous connecter
            </p>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <InputGroup>
              <InputGroupInput
                type="email"
                name="email"
                placeholder="m@exemple.com"
                required
              />
              <InputGroupAddon>
                <MailIcon />
              </InputGroupAddon>
            </InputGroup>
            <FieldDescription>
              {errors && errors.email && (
                <span className="text-destructive text-xs">{errors.email}</span>
              )}
            </FieldDescription>
          </Field>
          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
              <a
                href="#"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                Mot de passe oublie?
              </a>
            </div>

            <InputGroup>
              <InputGroupInput
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Entrez votre mot de passe"
                required
              />
              <InputGroupAddon>
                <Lock />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeIcon /> : <EyeClosedIcon />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <FieldDescription>
              {errors && errors.password && (
                <span className="text-destructive text-xs">{errors.password}</span>
              )}
            </FieldDescription>
          </Field>
          <Field>
            <Button type="submit">
              {processing && <Spinner />}
              {processing ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </Field>
          <FieldSeparator />
        </FieldGroup>
      )}
    </Form>
  );
}
