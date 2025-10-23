/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { usePage } from "@inertiajs/react";
import { useEffect, type ReactNode } from "react";
import { toast } from "sonner";

export default function DashboardLayout({ children }: {children: ReactNode}) {
  const { messages } = usePage().props as Record<string, any> ;
   useEffect(() => {
     messages.map((msg : any) => {
       switch (msg.level_tag) {
         case "success":
           toast.success(msg.message);
           break;
         case "error":
           toast.error(msg.message);
           break;
         case "warning":
           toast.warning(msg.message);
           break;
         case "info":
           toast.info(msg.message);
           break;
         default:
           toast(msg.message);
       }
     });
   });
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
