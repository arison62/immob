import {
  Circle,
  LucideBookUser,
  LucideBot,
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
