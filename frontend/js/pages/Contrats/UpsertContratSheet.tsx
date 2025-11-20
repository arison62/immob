// frontend/js/pages/Contrats/UpsertContratSheet.tsx
import React from 'react';
import { Button } from "@/js/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/js/components/ui/sheet";
import { ContratForm } from './ContratForm';

export const UpsertContratSheet = () => {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button>Ajouter un Contrat</Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Ajouter un nouveau contrat</SheetTitle>
                    <SheetDescription>
                        Remplissez les informations du contrat ici. Cliquez sur sauvegarder lorsque vous avez terminé.
                    </SheetDescription>
                </SheetHeader>
                <ContratForm />
            </SheetContent>
        </Sheet>
    );
};
