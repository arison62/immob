import { type Table } from "@tanstack/react-table";
import { Button } from "@/js/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/js/components/ui/dialog";
import { DataTableViewOptions } from "../../components/data-table-view-options";
import ContratForm from "./contrat-form"; // Le formulaire de contrat
import { useContratStore } from "../../../../store/contrat-store"; // Le store de contrat

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const { isFormOpen, setFormOpen, clearSelection } = useContratStore();

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        {/* Des filtres pourront être ajoutés ici, par exemple: */}
        {/* <Input placeholder="Rechercher un contrat..." /> */}
      </div>
      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} />
        <Dialog
          open={isFormOpen}
          modal={true}
          onOpenChange={(isOpen) => {
            setFormOpen(isOpen);
            if (!isOpen) {
              clearSelection(); // Effacer la sélection à la fermeture
            }
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setFormOpen(true)}>Ajouter un contrat</Button>
          </DialogTrigger>
          <DialogContent className="min-w-fit">
            <ContratForm />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
