import * as React from "react"
import {
  Building2,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
  InboxIcon,
  NotebookIcon,
  LandmarkIcon,
  ConstructionIcon,
} from "lucide-react"

import { NavLocations } from "@/components/nav-location"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link } from "@inertiajs/react"


const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: LayoutDashboardIcon,
      access: {},
    },
    {
      title: "Equipes",
      url: "#",
      icon: UsersIcon,
      access: {
        role: "OWNER",
      },
    },
    {
      title: "Biens",
      url: "#",
      icon: InboxIcon,
      access: {
        property_scope_perm: true,
      },
      items: [
        {
          title: "Immeubles",
          url: "#",
          access: {
            building_scope_perm: true,
          },
        },
        {
          title: "Propriétés",
          url: "#",
          access: {
            property_scope_perm: true,
          },
        },
      ],
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
      url: "#",
      icon: NotebookIcon,
      access: {
        property_scope_perm: true,
      },
    },
    {
      title: "Locataires",
      url: "#",
      icon: UsersIcon,
      access: {
        property_scope_perm: true,
      },
    },
    {
      title: "Finances",
      url: "#",
      icon: LandmarkIcon,
      access: {
        property_scope_perm: true,
      },
    },
    {
      title: "Maintenance",
      url: "#",
      icon: ConstructionIcon,
      access: {
        property_scope_perm: true,
      },
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
  )
}
