import DashboardLayout from "./DashboardLayout";
import { type ReactNode} from "react";
import { DataTable } from "./Tenants/components/data-table";
import { columns } from "./Tenants/components/columns";
import { useTenantStore } from "@/store/tenant-store";

function Tenants() {
  const tenants  = useTenantStore((state) => state.tenants);

  return (
    <div className="h-full flex-1 flex-col gap-8 p-8 md:flex">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Gestion des Locataires
          </h2>
          <p className="text-muted-foreground">
            La liste de vos locataires est affichée ci-dessous.
          </p>
        </div>
      </div>
      <DataTable data={tenants} columns={columns} />
    </div>
  );
}

Tenants.layout = (page : ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
export default Tenants;
