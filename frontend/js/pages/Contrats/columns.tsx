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
import { router } from '@inertiajs/react';

export const columns: ColumnDef<Contrat>[] = [
    {
        accessorKey: "contrat_number",
        header: "Numéro du Contrat",
    },
    // ... other columns
    {
        id: "actions",
        cell: ({ row }) => {
            const contrat = row.original;

            const handleDelete = () => {
                if (confirm("Êtes-vous sûr de vouloir supprimer ce contrat ?")) {
                    router.delete('/contrats', { data: { id: contrat.id } });
                }
            };

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
                            onClick={() => router.get(`/contrats/${contrat.id}/edit`)}
                        >
                            Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                            Supprimer
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
