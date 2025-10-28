import DashboardLayout from "./DashboardLayout";
import type { ReactNode } from "react";

function Maintenances() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
     Maintenances View
    </div>
  );
}

Maintenances.layout = (page : ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
export default Maintenances;
