import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp } from 'lucide-react';

const mockBillingData = [
  {
    id: 'txn_1',
    recordTitle: 'Annual Physical Exam 2024',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    buyer: 'Dr. Emily Carter',
    amount: 75.50,
    status: 'Completed',
  },
  {
    id: 'txn_2',
    recordTitle: 'Blood Glucose Monitoring Data',
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    buyer: 'Wellness Research Group',
    amount: 120.00,
    status: 'Completed',
  },
  {
    id: 'txn_3',
    recordTitle: 'Cardiology Consultation Notes',
    date: new Date(Date.now() - 86400000 * 10).toISOString(),
    buyer: 'Heartbeat Analytics Inc.',
    amount: 250.75,
    status: 'Completed',
  },
  {
    id: 'txn_4',
    recordTitle: 'Dermatology Photo Set',
    date: new Date(Date.now() - 86400000 * 15).toISOString(),
    buyer: 'Dr. John Smith',
    amount: 95.25,
    status: 'Pending',
  },
];

const totalEarnings = mockBillingData
  .filter(item => item.status === 'Completed')
  .reduce((acc, item) => acc + item.amount, 0);

const Billing: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Billing History</h1>
        <p className="text-muted-foreground mt-1">
          Review your earnings from monetized health records.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              from {mockBillingData.filter(item => item.status === 'Completed').length} completed transactions
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="medical-card">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>A log of all your data sales.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Record</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBillingData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.recordTitle}</TableCell>
                  <TableCell>{item.buyer}</TableCell>
                  <TableCell className="text-right">${item.amount.toFixed(2)}</TableCell>
                  <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'Completed' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;
