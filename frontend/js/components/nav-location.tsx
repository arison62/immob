"use client"

import {
  ChevronRight,
  FolderIcon,
  MoreHorizontalIcon,
  EllipsisIcon,
  type LucideIcon,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth, useGlobalPermissions } from "@/store/appStore"
import { Link } from "@inertiajs/react"

export function NavLocations({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    items?: {
      title: string
      url: string
      icon?: LucideIcon
      access: {
        role?: string
        property_scope_perm?: boolean
        building_scope_perm?: boolean
      }
    }[]
    access: {
      role?: string
      building_scope_perm?: boolean
      property_scope_perm?: boolean
    }
  }[]
}) {
  const { isMobile } = useSidebar()
  const { globalPermissions } = useGlobalPermissions();
  const {user} = useAuth();
  const role = user?.role
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Locations</SidebarGroupLabel>
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
                      {((subItem.access.role && role === subItem.access.role) ||
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
