import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePage } from "@inertiajs/react";

const dashboardPageName: Record<string, string> = {
  dashboard: "Dashboard",
  teams: "Equipes",
  properties: "Biens",
  buildings: "Bâtiments",
  tenants: "Locataires",
  finances: "Finances",
  contrats: "Contrats",
  maintenances: "Maintenance",
};

export function SiteHeader() {
  const url = usePage();
  const [pagName, setPageName] = useState("Dashboard");

  useEffect(() => {
    const createName = () => {
      let parts = url.url.split("/");
      parts = parts.filter((part) => part !== "");
    
      const pageId = parts[parts.length - 1];

      if (pageId in dashboardPageName) {
        setPageName(dashboardPageName[pageId]);
      }
      console.log(pageId);
    };
    createName();
  }, [url]);
  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{pagName}</h1>
      </div>
    </header>
  );
}
