// frontend/js/pages/Tenants/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Tenant } from "@/js/types"; // Assurez-vous que le type Tenant est défini
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

export const columns: ColumnDef<Tenant>[] = [
    {
        accessorKey: "first_name",
        header: "Prénom",
    },
    {
        accessorKey: "last_name",
        header: "Nom",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "phone",
        header: "Téléphone",
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const tenant = row.original;

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
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(tenant.id)}
                        >
                            Copier l'ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Voir les détails</DropdownMenuItem>
                        <DropdownMenuItem>Modifier</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
