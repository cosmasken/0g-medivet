import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const mockPurchasedRecords = [
  {
    id: 2,
    title: 'Blood Glucose Monitoring',
    category: 'Diabetes Care',
    purchaseDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    price: 120.00,
  },
  {
    id: 4,
    title: 'Lab Results - Lipid Panel',
    category: 'Laboratory',
    purchaseDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    price: 85.50,
  },
  {
    id: 1,
    title: 'Annual Physical Exam 2024',
    category: 'General Health',
    purchaseDate: new Date(Date.now() - 86400000 * 8).toISOString(),
    price: 75.00,
  },
];

const PurchasedRecords: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Purchased Records</h1>
        <p className="text-muted-foreground mt-1">
          Access and review the health data you have acquired.
        </p>
      </div>

      <Card className="medical-card">
        <CardHeader>
          <CardTitle>Acquired Data</CardTitle>
          <CardDescription>A list of all health records you have purchased.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Record Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPurchasedRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{record.category}</Badge>
                  </TableCell>
                  <TableCell>{new Date(record.purchaseDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">${record.price.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <Link to={`/record/${record.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
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

export default PurchasedRecords;
