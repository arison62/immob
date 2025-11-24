import { type Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContratStore, type Contrat } from "@/store/contrat-store";
import { useForm } from "@inertiajs/react";
import { toast } from "sonner";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const { selectContrat, deleteContrat: deleteContratFromStore } = useContratStore();
  const contrat = row.original as Contrat;

  const { delete: inertiaDelete, processing } = useForm();

  const handleDelete = () => {
    inertiaDelete(`/dashboard/contrats/${contrat.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        deleteContratFromStore(contrat.id);
        toast.success("Contrat supprimé avec succès.");
      },
      onError: (errors) => {
        toast.error("Erreur lors de la suppression du contrat.");
        console.error("Delete errors:", errors);
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="data-[state=open]:bg-muted size-8"
        >
          <MoreHorizontal />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => selectContrat(contrat)}>
          Modifier
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={handleDelete}
          disabled={processing}
        >
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
