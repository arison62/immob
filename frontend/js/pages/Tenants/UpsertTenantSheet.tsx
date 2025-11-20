// frontend/js/pages/Tenants/UpsertTenantSheet.tsx
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
import { TenantForm } from './TenantForm';

export const UpsertTenantSheet = () => {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button>Ajouter un Locataire</Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Ajouter un nouveau locataire</SheetTitle>
                    <SheetDescription>
                        Remplissez les informations du locataire ici. Cliquez sur sauvegarder lorsque vous avez terminé.
                    </SheetDescription>
                </SheetHeader>
                <TenantForm />
            </SheetContent>
        </Sheet>
    );
};
