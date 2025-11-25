import DashboardLayout from "./DashboardLayout";
import { type ReactNode, useEffect } from "react";
import { useFinanceStore } from "@/store/finances-store";
import GlobalView from "./Finances/components/GlobalView";
import { type Payment, type Invoice } from "@/types";

interface FinancesProps {
    payments: Payment[];
    invoices: Invoice[];
}

function Finances({ payments, invoices }: FinancesProps) {
  const { setPayments, setInvoices } = useFinanceStore();

  useEffect(() => {
    setPayments(payments);
    setInvoices(invoices);
  }, [payments, invoices, setPayments, setInvoices]);

  return (
    <div className="h-full flex-1 flex-col gap-8 p-8 md:flex">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Vue d'ensemble des Finances
          </h2>
          <p className="text-muted-foreground">
            Suivez les paiements, les factures et les performances financières.
          </p>
        </div>
      </div>
      <GlobalView />
      {/* D'autres composants comme la liste des paiements, etc. pourront être ajoutés ici */}
    </div>
  );
}

Finances.layout = (page : ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
export default Finances;
