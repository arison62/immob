import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";

import DashboardLayout from "./DashboardLayout";

import data from "./data.json";
import { useEffect, useMemo, type ReactNode } from "react";
import { usePage } from "@inertiajs/react";
import { useTeamStore, type User } from "@/store/team-store";

function Index() {
    const page = usePage();
    const initialUsers = useMemo(() => (page.props.users as User[]) || [], [page.props.users]);
    const initializeUsers = useTeamStore((state) => state.initializeUsers);
    useEffect(() => {
      initializeUsers(initialUsers as User[]);
      console.log(page.props)
    }, [initialUsers, initializeUsers]);
  
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
