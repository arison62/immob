"use client";

import * as React from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
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
      property_scope_perm?: boolean;
      building_scope_perm?: boolean;
    };
    items?: {
      title: string;
      url: string;
      icon?: LucideIcon;
      access: {
        role?: string;
        property_scope_perm?: boolean;
        building_scope_perm?: boolean;
      };
    }[];
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { globalPermissions } = useGlobalPermissions();
  const {user} = useAuth();
  const role = user?.role

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <Collapsible key={item.title} asChild className="group/collapsible">
              <SidebarMenuItem key={item.title}>
                <CollapsibleTrigger asChild>
                  {((item.access.role && role === item.access.role) ||
                    (item.access.property_scope_perm &&
                      globalPermissions.property_scope_perm) ||
                    (item.access.building_scope_perm &&
                      globalPermissions.building_scope_perm)) && (
                    <Link href={item.url}>
                      <SidebarMenuButton tooltip={item.title}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        {item.items && (
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        )}
                      </SidebarMenuButton>
                    </Link>
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        {((subItem.access.role &&
                          role === subItem.access.role) ||
                          (subItem.access.property_scope_perm &&
                            globalPermissions.property_scope_perm) ||
                          (subItem.access.building_scope_perm &&
                            globalPermissions.building_scope_perm)) && (
                          <Link href={subItem.url}>
                            <SidebarMenuButton tooltip={subItem.title}>
                              {subItem.icon && <subItem.icon />}
                              <span>{subItem.title}</span>
                            </SidebarMenuButton>
                          </Link>
                        )}
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
