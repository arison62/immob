import DashboardLayout from "./DashboardLayout";
import type { ReactNode } from "react";

function Tenants() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
     Tenants View
    </div>
  );
}

Tenants.layout = (page : ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
export default Tenants;
