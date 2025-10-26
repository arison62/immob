import { ChevronRight, MailIcon, PlusCircleIcon, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";

import { useAuth, useGlobalPermissions } from "@/store/appStore";
import { Link } from "@inertiajs/react";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    access: {
      role?: string;
      property_scope_perm?: boolean;
      building_scope_perm?: boolean;
    };
    items?: {
      title: string;
      icon?: LucideIcon;
      url: string;
      access: {
        role?: string;
        property_scope_perm?: boolean;
        building_scope_perm?: boolean;
      };
    }[];
  }[];
}) {
  const { globalPermissions } = useGlobalPermissions();
  const {user} = useAuth();
  const role = user?.role

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
            >
              <PlusCircleIcon />
              <span>Quick Create</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="h-9 w-9 shrink-0 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <MailIcon />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
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
