import React from "react";
import { useForm } from "@inertiajs/react";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { usePropertyStore, type Property } from "@/store/property-store";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const CreatePropertyForm = () => {
  const { buildings, addProperty, setPropertyFormOpen } = usePropertyStore();
  const { data, setData, post, processing, errors, reset } = useForm({
    building_id: "",
    name: "",
    type: "",
    floor: 0,
    door_number: "",
    surface_area: 0,
    room_count: 1,
    bedroom_count: 0,
    bathroom_count: 1,
    has_parking: false,
    has_balcony: false,
    description: "",
    monthly_rent: 0,
    formType: "property",
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post("", {
        except: ["properties"],
      onSuccess: (page) => {
        const newProperty = page.props.property as Property;
        
        addProperty(newProperty);
        setPropertyFormOpen(false);
        reset();
      },
      onError: (err) => {
        console.log("Erreur creation propriete : ", err);
      },
    });
  };

  return (
    <form onSubmit={onSubmit}>
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>
        {/* General Tab */}
        <TabsContent value="general">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="building_id" className="text-right">
                Building
              </Label>
              <Select
                onValueChange={(value) => setData("building_id", value)}
                value={data.building_id}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a building" />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((building) => (
                    <SelectItem key={building.id} value={building.id}>
                      {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.building_id && (
                <p className="col-span-4 text-red-500 text-xs text-right">
                  {errors.building_id}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                className="col-span-3"
              />
              {errors.name && (
                <p className="col-span-4 text-red-500 text-xs text-right">
                  {errors.name}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                onValueChange={(value) => setData("type", value)}
                value={data.type}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APARTMENT">Apartment</SelectItem>
                  <SelectItem value="HOUSE">House</SelectItem>
                  <SelectItem value="STUDIO">Studio</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="col-span-4 text-red-500 text-xs text-right">
                  {errors.type}
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="surface_area" className="text-right">
                Surface (m²)
              </Label>
              <Input
                id="surface_area"
                type="number"
                value={data.surface_area}
                onChange={(e) =>
                  setData("surface_area", parseFloat(e.target.value))
                }
                className="col-span-3"
              />
              {errors.surface_area && (
                <p className="col-span-4 text-red-500 text-xs text-right">
                  {errors.surface_area}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="room_count" className="text-right">
                Rooms
              </Label>
              <Input
                id="room_count"
                type="number"
                value={data.room_count}
                onChange={(e) =>
                  setData("room_count", parseInt(e.target.value))
                }
                className="col-span-3"
              />
              {errors.room_count && (
                <p className="col-span-4 text-red-500 text-xs text-right">
                  {errors.room_count}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bedroom_count" className="text-right">
                Bedrooms
              </Label>
              <Input
                id="bedroom_count"
                type="number"
                value={data.bedroom_count}
                onChange={(e) =>
                  setData("bedroom_count", parseInt(e.target.value))
                }
                className="col-span-3"
              />
              {errors.bedroom_count && (
                <p className="col-span-4 text-red-500 text-xs text-right">
                  {errors.bedroom_count}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bathroom_count" className="text-right">
                Bathrooms
              </Label>
              <Input
                id="bathroom_count"
                type="number"
                value={data.bathroom_count}
                onChange={(e) =>
                  setData("bathroom_count", parseInt(e.target.value))
                }
                className="col-span-3"
              />
              {errors.bathroom_count && (
                <p className="col-span-4 text-red-500 text-xs text-right">
                  {errors.bathroom_count}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="floor" className="text-right">
                Floor
              </Label>
              <Input
                id="floor"
                type="number"
                value={data.floor}
                onChange={(e) => setData("floor", parseInt(e.target.value))}
                className="col-span-3"
              />
              {errors.floor && (
                <p className="col-span-4 text-red-500 text-xs text-right">
                  {errors.floor}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="door_number" className="text-right">
                Door Number
              </Label>
              <Input
                id="door_number"
                value={data.door_number}
                onChange={(e) => setData("door_number", e.target.value)}
                className="col-span-3"
              />
              {errors.door_number && (
                <p className="col-span-4 text-red-500 text-xs text-right">
                  {errors.door_number}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Checkbox
                id="has_parking"
                checked={data.has_parking}
                onCheckedChange={(checked) =>
                  setData("has_parking", Boolean(checked))
                }
              />
              <Label htmlFor="has_parking">Has Parking</Label>
            </div>
            <div className="flex items-center gap-4">
              <Checkbox
                id="has_balcony"
                checked={data.has_balcony}
                onCheckedChange={(checked) =>
                  setData("has_balcony", Boolean(checked))
                }
              />
              <Label htmlFor="has_balcony">Has Balcony</Label>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData("description", e.target.value)}
              />
            </div>
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="monthly_rent" className="text-right">
                Monthly Rent
              </Label>
              <Input
                id="monthly_rent"
                type="number"
                value={data.monthly_rent}
                onChange={(e) =>
                  setData("monthly_rent", parseFloat(e.target.value))
                }
                className="col-span-3"
              />
              {errors.monthly_rent && (
                <p className="col-span-4 text-red-500 text-xs text-right">
                  {errors.monthly_rent}
                </p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <Button type="submit" disabled={processing}>
        Create Property
      </Button>
    </form>
  );
};

export default CreatePropertyForm;
