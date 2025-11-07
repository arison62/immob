import * as React from "react";
import {
  Building2,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
  InboxIcon,
  NotebookIcon,
  LandmarkIcon,
  ConstructionIcon,
} from "lucide-react";

import { NavLocations } from "@/components/nav-location";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "@inertiajs/react";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard/",
      icon: LayoutDashboardIcon,
      access: {
        role: "OWNER",
      },
    },
    {
      title: "Equipes",
      url: "/dashboard/teams/",
      icon: UsersIcon,
      access: {
        role: "OWNER",
      },
    },
    {
      title: "Propriétés",
      url: "/dashboard/properties/",
      icon: InboxIcon,
      access: {
        building_scope_perm: true,
      },
    },
  ],
  navSecondary: [
    {
      title: "Parametres",
      url: "#",
      icon: SettingsIcon,
      access: {
        role: "OWNER",
      },
    },
  ],
  locations: [
    {
      title: "Contrats",
      url: "/dashboard/contrats/",
      icon: NotebookIcon,
      access: {
        building_scope_perm: true,
      },
    },
    {
      title: "Locataires",
      url: "/dashboard/tenants/",
      icon: UsersIcon,
      access: {
        building_scope_perm: true,
      },
    },
    {
      title: "Finances",
      url: "/dashboard/finances/",
      icon: LandmarkIcon,
      access: { building_scope_perm: true },
    },
    {
      title: "Maintenance",
      url: "/dashboard/maintenances/",
      icon: ConstructionIcon,
      access: { building_scope_perm: true },
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="#">
                <Building2 className="h-5 w-5" />
                <span className="text-base font-semibold">Immob.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavLocations items={data.locations} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
