// frontend/js/pages/Payments/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Payment } from "@/js/types";
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

export const columns: ColumnDef<Payment>[] = [
    {
        accessorKey: "reference_number",
        header: "Référence",
    },
    {
        accessorKey: "contrat_id",
        header: "Contrat",
    },
    {
        accessorKey: "amount",
        header: "Montant",
    },
    {
        accessorKey: "due_date",
        header: "Date d'Échéance",
    },
    {
        accessorKey: "status",
        header: "Statut",
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const payment = row.original;

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
                        <DropdownMenuItem>Marquer comme Payé</DropdownMenuItem>
                        <DropdownMenuItem>Modifier</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
