import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";

import DashboardLayout from "./DashboardLayout";

import data from "./data.json";
import { useEffect, useMemo, type ReactNode } from "react";
import { usePage } from "@inertiajs/react";
import { useTeamStore, type User } from "@/store/team-store";
import { useTenantStore, type Tenant } from "@/store/tenant-store";
import { usePropertyStore, type Property } from "@/store/property-store";
import { useContratStore, type Contrat } from "@/store/contrat-store";
import { useStatisticsStore } from "@/store/statistics-store";

function Index() {
    const page = usePage();

    // Initialisation des stores
    const initialUsers = useMemo(() => (page.props.users as User[]) || [], [page.props.users]);
    const initializeUsers = useTeamStore((state) => state.initializeUsers);
    useEffect(() => {
      initializeUsers(initialUsers);
    }, [initialUsers, initializeUsers]);

    const initialTenants = useMemo(() => (page.props.tenants as Tenant[]) || [], [page.props.tenants]);
    const initializeTenants = useTenantStore((state) => state.initializeTenants);
    useEffect(() => {
      initializeTenants(initialTenants);
    }, [initialTenants, initializeTenants]);

    const initialProperties = useMemo(() => (page.props.properties as Property[]) || [], [page.props.properties]);
    const initializeProperties = usePropertyStore((state) => state.initializeProperties);
    useEffect(() => {
      initializeProperties(initialProperties);
    }, [initialProperties, initializeProperties]);

    const initialContracts = useMemo(() => (page.props.contracts as Contrat[]) || [], [page.props.contracts]);
    const initializeContracts = useContratStore((state) => state.initializeContrats);
    useEffect(() => {
      initializeContracts(initialContracts);
    }, [initialContracts, initializeContracts]);

    const initialStatistics = useMemo(() => page.props.statistics, [page.props.statistics]);
    const initializeStatistics = useStatisticsStore((state) => state.initializeStatistics);
    useEffect(() => {
      initializeStatistics(initialStatistics);
    }, [initialStatistics, initializeStatistics]);
  
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
