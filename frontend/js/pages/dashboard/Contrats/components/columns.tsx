"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { type Contrat } from "@/store/contrat-store"
import { DataTableColumnHeader } from "../../components/data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

export const columns: ColumnDef<Contrat>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "contrat_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="N° Contrat" />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statut" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const variant = {
        ACTIVE: "success",
        DRAFT: "secondary",
        EXPIRED: "outline",
        TERMINATED: "destructive",
      }[status] ?? "default"

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return <Badge variant={variant as any}>{status}</Badge>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "start_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date de début" />
    ),
    cell: ({ row }) => new Date(row.getValue("start_date")).toLocaleDateString(),
  },
  {
    accessorKey: "end_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date de fin" />
    ),
    cell: ({ row }) => new Date(row.getValue("end_date")).toLocaleDateString(),
  },
  {
    accessorKey: "monthly_rent",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Loyer Mensuel" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("monthly_rent"))
      const formatted = new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "CFA",
      }).format(amount)
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
