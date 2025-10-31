import DashboardLayout from "./DashboardLayout";
import type { ReactNode } from "react";
import { DataTable } from "./Teams/components/data-table";
import { columns } from "./Teams/components/columns";
import { UserNav } from "./Teams/components/user-nav";
import { usePage } from "@inertiajs/react";
import type { User } from "./Teams/data/schema";

function Teams() {
  const users = usePage().props.users as User[] || [];
  

  return (
    <div className="h-full flex-1 flex-col gap-8 p-8 md:flex">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Welcome back!
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s a list of your tasks for this month.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <UserNav />
        </div>
      </div>
      <DataTable data={users} columns={columns} />
    </div>
  );
}

Teams.layout = (page : ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
export default Teams;
