import { type Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DataTableViewOptions } from "../../components/data-table-view-options";

import { roles } from "../data/data";
import { DataTableFacetedFilter } from "../../components/data-table-faceted-filter";
import UserCreationForm from "./user-creation-form";
import { useTeamStore } from "../../../../store/team-store";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFormOpen = useTeamStore((state) => state.isFormOpen);
  const setFormOpen = useTeamStore((state) => state.setFormOpen);
  const clearSelection = useTeamStore((state) => state.clearSelection);
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder="Rechercher un utilisateur..."
          value={
            (table.getColumn("fullName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("fullName")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {table.getColumn("role") && (
          <DataTableFacetedFilter
            column={table.getColumn("role")}
            title="Role"
            options={roles}
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
            <Button size="sm" onClick={clearSelection}>Ajouter un utilisateur</Button>
          </DialogTrigger>
          <DialogContent className="min-w-fit">
            <UserCreationForm />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
