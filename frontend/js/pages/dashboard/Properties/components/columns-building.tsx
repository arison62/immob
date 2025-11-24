
import { type ColumnDef } from "@tanstack/react-table"

import { Checkbox } from "@/components/ui/checkbox"

import { type Building } from "@/store/property-store"
import { DataTableColumnHeader } from "../../components/data-table-column-header"
import { DataTableRowActions } from "./building-table-row-actions"

export const columns: ColumnDef<Building>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
   
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom" />
    ),

  },
  {
    accessorKey: "city",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ville" />
    ),
  
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "street",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Quartier" />
    ),
  },
  {
    accessorKey: "floor_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre d'étages" />
    )
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
