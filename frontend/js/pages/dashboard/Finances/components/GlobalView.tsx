/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinanceStore } from "@/store/finances-store";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function GlobalView() {
  const { totalPaid, totalPending, totalLate } = useFinanceStore();

  const data = [
    { name: 'Payé', montant: totalPaid },
    { name: 'En attente', montant: totalPending },
    { name: 'En retard', montant: totalLate },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Payé</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalPaid.toFixed(2)} F CFA</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total En Attente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalPending.toFixed(2)} F CFA</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total En Retard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalLate.toFixed(2)} F CFA</p>
        </CardContent>
      </Card>
      <div className="md:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Paiements</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="montant" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
