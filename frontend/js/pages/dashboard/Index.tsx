import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";

import DashboardLayout from "./DashboardLayout";

import data from "./data.json";
import type { ReactNode } from "react";

function Index() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </div>
  );
}

Index.layout = (page : ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
export default Index;
