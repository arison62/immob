import DashboardLayout from "./DashboardLayout";
import type { ReactNode } from "react";

function Buildings() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
     Buildings View
    </div>
  );
}

Buildings.layout = (page : ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
export default Buildings;
