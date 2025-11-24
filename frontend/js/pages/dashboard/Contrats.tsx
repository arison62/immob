import DashboardLayout from "./DashboardLayout";
import { type ReactNode, useEffect } from "react";
import { DataTable } from "./Contrats/components/data-table"; // Chemin corrigé
import { columns } from "./Contrats/components/columns"; // Chemin corrigé
import { useContratStore, Contrat } from "../../store/contrat-store"; // Import du store
import { usePage } from "@inertiajs/react";

// Interface pour les props venant d'Inertia
interface ContratsPageProps {
  contrats: Contrat[];
}

function Contrats() {
  const { props } = usePage<ContratsPageProps>();
  const { initializeContrats, contrats } = useContratStore((state) => ({
    initializeContrats: state.initializeContrats,
    contrats: state.contrats,
  }));

  // Hydrater le store avec les données initiales du serveur
  useEffect(() => {
    if (props.contrats) {
      initializeContrats(props.contrats);
    }
  }, [props.contrats, initializeContrats]);

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

Contrats.layout = (page : ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
export default Contrats;
