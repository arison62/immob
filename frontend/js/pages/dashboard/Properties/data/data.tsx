import {
  Circle,
  Construction,
  LucideBlinds,
  LucideBookUser,
  LucideBot,
  LucideHouse,
  LucideWarehouse,
  SquareActivity,
  X,
} from "lucide-react"


export const roles = [
  {
    value: "OWNER",
    label: "Proprietaire",
    icon: LucideBookUser
  },
  {
    value: "MANAGER",
    label: "Manageur",
    icon: LucideBot
  },
  {
    value: "VIEWER",
    label: "Visualisateur",
    icon: Circle,
  },
]

export const propertyTypes = [
  {
    "value": "APARTMENT",
    "label": "Appartement",
    "icon": LucideHouse
  },
  {
    "value": "HOUSE",
    "label": "Maison",
    "icon": LucideWarehouse
  },
  {
    "value": "STUDIO",
    "label": "Studio",
    "icon": LucideBlinds
  }
]

        // (AVAILABLE = "AVAILABLE"), _("Available");
        // (OCCUPIED = "OCCUPIED"), _("Occupied");
        // (MAINTENANCE = "MAINTENANCE"), _("Maintenance");
        // (UNAVAILABLE = "UNAVAILABLE"), _("Unavailable");
export const propertyStatuses = [
  {
    "value": "AVAILABLE",
    "label": "Disponible",
    "icon": Circle,
  },
  {
    "value": "OCCUPIED",
    "label": "Occupé",
    "icon": SquareActivity,
  },
  {
    "value": "MAINTENANCE",
    "label": "En maintenance",
    "icon": Construction,
  },
  {
    "value": "UNAVAILABLE",
    "label": "Indisponible",
    "icon": X,
  },
]