"use client";

import {
  FolderIcon,
  MoreHorizontalIcon,
  EllipsisIcon,
  type LucideIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth, useGlobalPermissions } from "@/store/app-store";
import { Link, usePage } from "@inertiajs/react";

export function NavLocations({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    access: {
      role?: string;
      building_scope_perm?: boolean;
    };
  }[];
}) {
  const { isMobile } = useSidebar();
  const { globalPermissions } = useGlobalPermissions();
  const { user } = useAuth();
  const url = usePage().url;
  const role = user?.role;

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Locations</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild className="group/collapsible">
            <SidebarMenuItem key={item.title}>
              <CollapsibleTrigger asChild>
                {((item.access.role && role === item.access.role) ||
                  (item.access.building_scope_perm &&
                    globalPermissions.building_scope_perm)) && (
                  <Link href={item.url}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={url === item.url}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                )}
              </CollapsibleTrigger>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction
                    showOnHover
                    className="data-[state=open]:bg-accent rounded-sm"
                  >
                    <EllipsisIcon />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-24 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem>
                    <FolderIcon />
                    <span>Open</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </Collapsible>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontalIcon className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
