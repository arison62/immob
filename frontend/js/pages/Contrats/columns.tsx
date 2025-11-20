// frontend/js/pages/Contrats/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Contrat } from "@/js/types";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/js/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/js/components/ui/dropdown-menu";

export const columns: ColumnDef<Contrat>[] = [
    {
        accessorKey: "contrat_number",
        header: "Numéro du Contrat",
    },
    {
        accessorKey: "tenant_id",
        header: "Locataire",
    },
    {
        accessorKey: "property_id",
        header: "Propriété",
    },
    {
        accessorKey: "start_date",
        header: "Date de Début",
    },
    {
        accessorKey: "end_date",
        header: "Date de Fin",
    },
    {
        accessorKey: "status",
        header: "Statut",
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const contrat = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Ouvrir le menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Voir les détails</DropdownMenuItem>
                        <DropdownMenuItem>Modifier</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
