"use client";

import * as React from "react";
import { type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Link } from "@inertiajs/react";
import { useAuth, useGlobalPermissions } from "@/store/app-store";

export function NavSecondary({
  items,
  ...props
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
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { globalPermissions } = useGlobalPermissions();
  const { user } = useAuth();
  const role = user?.role;

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <Collapsible key={item.title} asChild className="group/collapsible">
              <SidebarMenuItem key={item.title}>
                <CollapsibleTrigger asChild>
                  {((item.access.role && role === item.access.role) ||
                    (item.access.building_scope_perm &&
                      globalPermissions.building_scope_perm)) && (
                    <Link href={item.url}>
                      <SidebarMenuButton tooltip={item.title}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  )}
                </CollapsibleTrigger>
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
