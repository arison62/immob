import DashboardLayout from "./DashboardLayout";
import { type ReactNode } from "react";
import { DataTable } from "./Contrats/components/data-table"; // Chemin corrigé
import { columns } from "./Contrats/components/columns"; // Chemin corrigé
import { useContratStore } from "@/store/contrat-store"; // Import du store

function Contrats() {
  const contrats = useContratStore((state) => state.contrats);

  console.log(contrats);
  return (
    <div className="h-full flex-1 flex-col gap-8 p-8 md:flex">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Gestion des Contrats
          </h2>
          <p className="text-muted-foreground">
            La liste de vos contrats est affichée ci-dessous.
          </p>
        </div>
        {/* Le bouton d'ajout sera géré dans la DataTableToolbar */}
      </div>
      <DataTable data={contrats} columns={columns} />
    </div>
  );
}

Contrats.layout = (page: ReactNode) => (
  <DashboardLayout>{page}</DashboardLayout>
);
export default Contrats;
