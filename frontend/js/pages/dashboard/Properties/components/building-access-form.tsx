import * as React from "react";
import { useShallow } from "zustand/shallow";
import { useTeamStore } from "../../../../store/team-store";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldContent, FieldError } from "@/components/ui/field";
import { PlusIcon, XIcon, UserIcon, LockIcon } from "lucide-react";
import { cn } from "@/lib/utils";
export interface PermissionAssignment {
  user_id: string;
  permission_name: "VIEW" | "CREATE" | "UPDATE" | "DELETE";
}

const PERMISSION_LEVELS = [
  { value: "VIEW", label: "Consultation (Voir les détails)" },
  { value: "CREATE", label: "Création (Ajouter des propriétés)" },
  { value: "UPDATE", label: "Modification (Éditer les données)" },
  { value: "DELETE", label: "Administration (Suppression, Gestion des accès)" },
];


interface BuildingAccessFormProps {
  // Le tableau de permissions actuel (fourni par le parent)
  value: PermissionAssignment[];
  // Callback pour notifier le formulaire parent
  onChange: (permissions: PermissionAssignment[]) => void;
  // Les erreurs d'Inertia (ex: errors['permissions.0.user_id'])
  errors?: Record<string, string>;
  disabled?: boolean;
}

let nextId = 0;
type InternalAssignment = PermissionAssignment & { internalId: number };

export default function BuildingAccessForm({
  value,
  onChange,
  errors = {},
  disabled = false,
}: BuildingAccessFormProps) {
  // 1. Récupération des utilisateurs disponibles
  const availableUsers = useTeamStore(
    useShallow((state) => state.users.filter((u) => u.role !== "OWNER"))
  );

  // 2. Initialisation de l'état interne avec les IDs temporaires
  const [assignments, setAssignments] = React.useState<InternalAssignment[]>(
    () => {
      // Assigner un internalId unique si l'état initial est vide ou chargé
      return value.map((item) => ({ ...item, internalId: nextId++ }));
    }
  );

  // Mise à jour de l'état interne si la prop 'value' change (ex: mode édition)
  React.useEffect(() => {
    setAssignments(value.map((item) => ({ ...item, internalId: nextId++ })));
  }, [value]);

  // 3. Gestion des changements
  const handleUpdate = (
    id: number,
    field: keyof PermissionAssignment,
    newValue: string
  ) => {
    const newAssignments = assignments.map((item) =>
      item.internalId === id ? { ...item, [field]: newValue } : item
    ) as InternalAssignment[];

    setAssignments(newAssignments);
    // Notifie le formulaire parent
    onChange(newAssignments.map(({ internalId, ...rest }) => rest));
  };
  // 4. Ajout d'une ligne
  const handleAddAssignment = () => {
    // Trouver le premier utilisateur qui n'a pas encore de permission
    const assignedUserIds = assignments.map((a) => a.user_id);
    const unassignedUser = availableUsers.find(
      (u) => !assignedUserIds.includes(u.id)
    );

    if (!unassignedUser) {
      // Optionnel : Afficher un message si tous les utilisateurs sont déjà assignés
      alert("Tous les utilisateurs sont déjà assignés à une permission.");
      return;
    }

    const newAssignment: InternalAssignment = {
      internalId: nextId++,
      user_id: unassignedUser.id, // Choisir le premier utilisateur non assigné par défaut
      permission_name: "VIEW", // Permission VIEW par défaut
    };

    const newAssignments = [...assignments, newAssignment];
    setAssignments(newAssignments);
    onChange(newAssignments.map(({ internalId, ...rest }) => rest));
  };

  // 5. Suppression d'une ligne
  const handleRemoveAssignment = (id: number) => {
    const newAssignments = assignments.filter((item) => item.internalId !== id);
    setAssignments(newAssignments);
    onChange(newAssignments.map(({ internalId, ...rest }) => rest));
  };

  // Les IDs des utilisateurs déjà sélectionnés pour désactiver les options dans les autres selects
  const selectedUserIds = assignments.map((a) => a.user_id);

  return (
    <div className="space-y-4">
      {/* En-tête des colonnes */}
      <div className="grid grid-cols-[3fr_2fr_50px] gap-4 font-semibold text-sm text-muted-foreground">
        <div>Utilisateur</div>
        <div>Permission</div>
        <div className="w-full"></div>
      </div>

      {/* Liste des assignments */}
      <div className="space-y-3">
        {assignments.map((assignment, index) => {
          // Gestion des erreurs spécifiques à la ligne d'index
          const userError = errors[`permissions.${index}.user_id`];
          const permissionError =
            errors[`permissions.${index}.permission_name`];

          return (
            <div
              key={assignment.internalId}
              className="grid grid-cols-[3fr_2fr_50px] gap-4 items-start"
            >
              {/* SELECT Utilisateur */}
              <Field data-invalid={!!userError}>
                <FieldContent>
                  <Select
                    value={assignment.user_id}
                    onValueChange={(value) =>
                      handleUpdate(assignment.internalId, "user_id", value)
                    }
                    disabled={disabled || availableUsers.length === 0}
                  >
                    <SelectTrigger
                      className={cn(
                        "w-full",
                        userError && "border-destructive"
                      )}
                    >
                      <UserIcon className="size-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Sélectionnez un utilisateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem
                          key={user.id}
                          value={user.id}
                          // Désactiver si cet utilisateur est déjà sélectionné AILLEURS
                          disabled={
                            selectedUserIds.includes(user.id) &&
                            user.id !== assignment.user_id
                          }
                        >
                          {user.first_name} {user.last_name} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {userError && <FieldError>{userError}</FieldError>}
                </FieldContent>
              </Field>

              {/* SELECT Permission */}
              <Field data-invalid={!!permissionError}>
                <FieldContent>
                  <Select
                    value={assignment.permission_name}
                    onValueChange={(value) =>
                      handleUpdate(
                        assignment.internalId,
                        "permission_name",
                        value
                      )
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger
                      className={cn(
                        "w-full",
                        permissionError && "border-destructive"
                      )}
                    >
                      <LockIcon className="size-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Niveau de permission" />
                    </SelectTrigger>
                    <SelectContent>
                      {PERMISSION_LEVELS.map((perm) => (
                        <SelectItem key={perm.value} value={perm.value}>
                          {perm.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {permissionError && (
                    <FieldError>{permissionError}</FieldError>
                  )}
                </FieldContent>
              </Field>

              {/* Bouton Supprimer */}
              <div className="flex items-center h-full pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveAssignment(assignment.internalId)}
                  disabled={disabled}
                  aria-label="Supprimer la permission"
                >
                  <XIcon className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bouton Ajouter */}
      <Button
        type="button"
        variant="outline"
        onClick={handleAddAssignment}
        disabled={disabled || assignments.length >= availableUsers.length}
        className="mt-4"
      >
        <PlusIcon className="size-4 mr-2" />
        Ajouter une permission
      </Button>
    </div>
  );
}