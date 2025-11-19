import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "./DashboardLayout";
import { useEffect, useMemo, type ReactNode } from "react";
import  { DataTable as PropertyTable } from "./Properties/components/property-table";
import  { DataTable as BuildingTable } from "./Properties/components/building-table";
import { columns as columnsProperty } from "./Properties/components/columns-property";
import { columns as columnsBuilding } from "./Properties/components/columns-building";
import { usePage } from "@inertiajs/react";
import { usePropertyStore, type Property, type Building } from "./Properties/property-store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CreatePropertyForm from "./Properties/components/forms/property-creation-form";


function Properties() {
  const page = usePage();
  const initialProperties = useMemo(() => (page.props.properties as Property[]) || [], [page.props.properties]);
  const initialBuildings = useMemo(() => (page.props.buildings as Building[]) || [], [page.props.buildings]);
  const {
    initializeProperties,
    initializeBuildings,
    properties,
    buildings,
    isPropertyFormOpen,
    setPropertyFormOpen,
  } = usePropertyStore();

  useEffect(() => {
    initializeProperties(initialProperties as Property[]);
  }, [initialProperties, initializeProperties]);

  useEffect(() => {
    initializeBuildings(initialBuildings as Building[]);
  }, [initialBuildings, initializeBuildings]);

  const canCreateProperty = useMemo(() => {
    return buildings.some(building =>
      building.user_best_permission === 'CREATE' ||
      building.user_best_permission === 'UPDATE' ||
      building.user_best_permission === 'DELETE'
    );
  }, [buildings]);

  return (
    <div className="h-full flex-1 flex-col gap-8 p-8 md:flex">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Vos propriétés
          </h2>
          <p className="text-muted-foreground">Vos biens listes ci-dessous.</p>
        </div>
        {canCreateProperty && (
          <Dialog open={isPropertyFormOpen} onOpenChange={setPropertyFormOpen}>
            <DialogTrigger asChild>
              <Button>Créer une propriété</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle propriété</DialogTitle>
              </DialogHeader>
              <CreatePropertyForm />
            </DialogContent>
          </Dialog>
        )}
      </div>
      <Tabs defaultValue="property">
        <TabsList className="space-x-4">
          <TabsTrigger value="property">Propriétés</TabsTrigger>
          <TabsTrigger value="building">Immeubles</TabsTrigger>
        </TabsList>
        <TabsContent value="property">
          <PropertyTable data={properties} columns={columnsProperty} />
        </TabsContent>
        <TabsContent value="building">
          <BuildingTable data={buildings} columns={columnsBuilding} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

Properties.layout = (page: ReactNode) => (
  <DashboardLayout>{page}</DashboardLayout>
);
export default Properties;
