import { type Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DataTableViewOptions } from "../../components/data-table-view-options";

import { DataTableFacetedFilter } from "../../components/data-table-faceted-filter";
import { propertyStatuses, propertyTypes } from "../data/data";
import { usePropertyStore } from "../property-store";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFormOpen = usePropertyStore((state) => state.isPropertyFormOpen);
  const setFormOpen = usePropertyStore((state) => state.setPropertyFormOpen);
  const clearSelection = usePropertyStore(
    (state) => state.clearPropertySelection
  );
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder="Rechercher une propriété..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {table.getColumn("type") && (
          <DataTableFacetedFilter
            column={table.getColumn("type")}
            title="type"
            options={propertyTypes}
          />
        )}

        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={propertyStatuses}
          />
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} />
        <Dialog
          open={isFormOpen}
          modal={true}
          onOpenChange={() => {
            setFormOpen(!isFormOpen);
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" onClick={clearSelection}>
              Ajouter une propriété
            </Button>
          </DialogTrigger>
          <DialogContent className="">
            Property creation Form
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
