import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "./DashboardLayout";
import type { ReactNode } from "react";


function Properties() {
  return (
    <div className="h-full flex-1 flex-col gap-8 p-8 md:flex">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Vos propriétés
          </h2>
          <p className="text-muted-foreground">Vos biens listes ci-dessous.</p>
        </div>
      </div>
      <Tabs defaultValue="property">
        <TabsList className="space-x-4">
          <TabsTrigger value="property">Propriétés</TabsTrigger>
          <TabsTrigger value="building">Immeubles</TabsTrigger>
        </TabsList>
        <TabsContent value="property">
          {/* Contenu des propriétés */}
        </TabsContent>
        <TabsContent value="building">
          {/* Contenu des immeubles */}
        </TabsContent>
      </Tabs>
    </div>
  );
}

Properties.layout = (page: ReactNode) => (
  <DashboardLayout>{page}</DashboardLayout>
);
export default Properties;
