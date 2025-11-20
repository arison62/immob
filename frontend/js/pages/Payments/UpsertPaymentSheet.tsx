// frontend/js/pages/Payments/UpsertPaymentSheet.tsx
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
import { PaymentForm } from './PaymentForm';

export const UpsertPaymentSheet = () => {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button>Ajouter un Paiement</Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Ajouter un nouveau paiement</SheetTitle>
                    <SheetDescription>
                        Remplissez les informations du paiement ici. Cliquez sur sauvegarder lorsque vous avez terminé.
                    </SheetDescription>
                </SheetHeader>
                <PaymentForm />
            </SheetContent>
        </Sheet>
    );
};
