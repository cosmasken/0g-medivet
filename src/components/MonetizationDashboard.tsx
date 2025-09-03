import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  DollarSign,
  TrendingUp,
  Eye,
  EyeOff,
  Settings,
  BarChart3,
  Calendar,
  Award,
  Zap,
  Target,
  PiggyBank,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { 
  mockPatientEarnings, 
  mockMonetizedRecords, 
  mockTransactions,
  generateMonetizedRecord,
  calculatePotentialEarnings,
  type MonetizedRecord 
} from "@/lib/monetization-data";

interface MonetizationDashboardProps {
  patientId: string;
  medicalRecords: any[];
  onToggleMonetization: (recordId: string, enabled: boolean) => void;
}

export function MonetizationDashboard({ 
  patientId, 
  medicalRecords, 
  onToggleMonetization 
}: MonetizationDashboardProps) {
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [monetizedRecords, setMonetizedRecords] = useState<MonetizedRecord[]>(
    mockMonetizedRecords.filter(mr => mr.patientId === patientId)
  );

  // Get patient earnings data
  const patientEarnings = mockPatientEarnings.find(pe => pe.patientId === patientId) || {
    patientId,
    totalEarnings: 0,
    totalRecordsSold: 0,
    averageRecordPrice: 0,
    monthlyEarnings: [],
    topPerformingRecords: [],
    pendingPayouts: 0
  };

  // Get recent transactions
  const recentTransactions = mockTransactions
    .filter(tx => tx.sellerId === patientId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const handleToggleMonetization = (record: any, enabled: boolean) => {
    if (enabled) {
      // Create monetized record
      const monetizedRecord = generateMonetizedRecord(patientId, record);
      setMonetizedRecords(prev => [...prev, monetizedRecord]);
    } else {
      // Remove monetized record
      setMonetizedRecords(prev => prev.filter(mr => mr.recordId !== record.id));
    }
    onToggleMonetization(record.id, enabled);
  };

  const isRecordMonetized = (recordId: string) => {
    return monetizedRecords.some(mr => mr.recordId === recordId);
  };

  const getMonetizedRecord = (recordId: string) => {
    return monetizedRecords.find(mr => mr.recordId === recordId);
  };

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'genetic': return '🧬';
      case 'imaging': return '🔬';
      case 'lab': return '🧪';
      case 'mental-health': return '🧠';
      case 'prescription': return '💊';
      case 'visit': return '👩‍⚕️';
      case 'vital': return '❤️';
      case 'allergy': return '⚠️';
      default: return '📋';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'uncommon': return 'bg-green-100 text-green-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'very-rare': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Record Monetization</h2>
          <p className="text-muted-foreground">
            Earn money by sharing your anonymized medical records for research
          </p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">
                  ${patientEarnings.totalEarnings.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Records Sold</p>
                <p className="text-2xl font-bold">{patientEarnings.totalRecordsSold}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Price</p>
                <p className="text-2xl font-bold">
                  ${patientEarnings.averageRecordPrice.toFixed(0)}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payout</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${patientEarnings.pendingPayouts.toFixed(2)}
                </p>
              </div>
              <PiggyBank className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="records" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="records">My Records</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medical Records</CardTitle>
              <CardDescription>
                Toggle monetization for your medical records. All data is anonymized before sharing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medicalRecords.map((record) => {
                  const isMonetized = isRecordMonetized(record.id);
                  const monetizedRecord = getMonetizedRecord(record.id);
                  const potentialEarnings = calculatePotentialEarnings(record);

                  return (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{getRecordTypeIcon(record.type)}</span>
                            <h4 className="font-medium">{record.title}</h4>
                            <Badge variant="outline">{record.type}</Badge>
                            {isMonetized && (
                              <Badge className="bg-green-100 text-green-800">
                                <DollarSign className="h-3 w-3 mr-1" />
                                Monetized
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {record.description}
                          </p>
                          
                          {isMonetized && monetizedRecord ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Current Price:</span>
                                <p className="font-medium">${monetizedRecord.currentPrice}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Times Sold:</span>
                                <p className="font-medium">{monetizedRecord.totalPurchases}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Revenue:</span>
                                <p className="font-medium text-green-600">
                                  ${monetizedRecord.revenueGenerated}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Quality:</span>
                                <p className="font-medium">{monetizedRecord.qualityScore.toFixed(1)}/10</p>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              <p>Potential earnings: ${potentialEarnings.min} - ${potentialEarnings.max}</p>
                              <p>Estimated: ${potentialEarnings.estimated}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Switch
                            checked={isMonetized}
                            onCheckedChange={(checked) => handleToggleMonetization(record, checked)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {isMonetized ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patientEarnings.monthlyEarnings.map((earning, index) => (
                    <div key={earning.month} className="flex items-center justify-between">
                      <span className="text-sm">{earning.month}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(earning.amount / Math.max(...patientEarnings.monthlyEarnings.map(e => e.amount))) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">${earning.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {monetizedRecords
                    .sort((a, b) => b.revenueGenerated - a.revenueGenerated)
                    .slice(0, 5)
                    .map((record) => (
                      <div key={record.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{getRecordTypeIcon(record.recordType)}</span>
                          <div>
                            <p className="text-sm font-medium">{record.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {record.totalPurchases} sales
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            ${record.revenueGenerated}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ${record.currentPrice} each
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your recent record sales and earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => {
                  const record = monetizedRecords.find(mr => mr.id === transaction.monetizedRecordId);
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.status === 'completed' ? 'bg-green-100' :
                          transaction.status === 'pending' ? 'bg-yellow-100' :
                          'bg-red-100'
                        }`}>
                          {transaction.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : transaction.status === 'pending' ? (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{record?.title || 'Unknown Record'}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">
                          +${transaction.netAmount.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${transaction.amount} - ${transaction.commission.toFixed(2)} fee
                        </p>
                      </div>
                    </div>
                  );
                })}
                
                {recentTransactions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                    <p>Start monetizing your records to see transactions here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
