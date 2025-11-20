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
import { router } from '@inertiajs/react';

export const columns: ColumnDef<Payment>[] = [
    {
        accessorKey: "reference_number",
        header: "Référence",
    },
    // ... other columns
    {
        id: "actions",
        cell: ({ row }) => {
            const payment = row.original;

            const handleDelete = () => {
                if (confirm("Êtes-vous sûr de vouloir supprimer ce paiement ?")) {
                    router.delete('/payments', { data: { id: payment.id } });
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
                            onClick={() => router.get(`/payments/${payment.id}/edit`)}
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
