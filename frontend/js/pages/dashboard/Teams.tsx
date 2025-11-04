import DashboardLayout from "./DashboardLayout";
import { useEffect, useMemo, type ReactNode } from "react";
import { DataTable } from "./Teams/components/data-table";
import { columns } from "./Teams/components/columns";
import { usePage } from "@inertiajs/react";
import { useTeamStore, type User} from "./Teams/team-store";

function Teams() {
  const page = usePage();
  const initialUsers = useMemo(() => (page.props.users as User[]) || [], [page.props.users]);
  const initializeUsers = useTeamStore((state) => state.initializeUsers);
  const users = useTeamStore((state) => state.users);
  useEffect(() => {
    console.log("Initializing users in store:", initialUsers);
    initializeUsers(initialUsers as User[]);
  }, [initialUsers, initializeUsers]);

  return (
    <div className="h-full flex-1 flex-col gap-8 p-8 md:flex">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Votre équipe
          </h2>
          <p className="text-muted-foreground">
            Votre equipe et ses membres sont listés ci-dessous.
          </p>
        </div>
      
      </div>
      <DataTable data={users} columns={columns} />
    </div>
  );
}

Teams.layout = (page : ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
export default Teams;
