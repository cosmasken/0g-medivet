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
} from "lucide-react";

interface MonetizedRecord {
  id: string;
  title: string;
  category: string;
  earnings: number;
  views: number;
  status: 'active' | 'pending' | 'sold';
}

interface MonetizationDashboardProps {
  userId: string;
}

export function MonetizationDashboard({ userId }: MonetizationDashboardProps) {
  const [monetizationEnabled, setMonetizationEnabled] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);

  // Mock data - replace with actual API calls
  const earningsData = {
    total: 0,
    thisMonth: 0,
    lastMonth: 0,
    growth: 0
  };

  const marketplaceStats = {
    totalListings: 0,
    activeBuyers: 0,
    avgPrice: 0
  };

  const monetizedRecords: MonetizedRecord[] = [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Data Monetization</CardTitle>
              <CardDescription>
                Earn from your anonymized medical data contributions to research
              </CardDescription>
            </div>
            <Switch
              checked={monetizationEnabled}
              onCheckedChange={setMonetizationEnabled}
            />
          </div>
        </CardHeader>
        <CardContent>
          {!monetizationEnabled ? (
            <div className="text-center py-8 text-muted-foreground">
              <PiggyBank className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Enable Data Monetization</p>
              <p className="text-sm mb-4">
                Help advance medical research while earning rewards from your anonymized health data.
              </p>
              <Button onClick={() => setMonetizationEnabled(true)}>
                Get Started
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="records">My Records</TabsTrigger>
                <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${earningsData.total.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">
                        +{earningsData.growth}% from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">This Month</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${earningsData.thisMonth.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">
                        Active monetization enabled
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Records Listed</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{monetizedRecords.length}</div>
                      <p className="text-xs text-muted-foreground">
                        Available for research
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Getting Started</CardTitle>
                    <CardDescription>
                      Follow these steps to start earning from your medical data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Upload Medical Records</h4>
                        <p className="text-sm text-muted-foreground">
                          Add your medical files to the platform
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Enable Anonymization</h4>
                        <p className="text-sm text-muted-foreground">
                          Your data will be anonymized for research use
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Start Earning</h4>
                        <p className="text-sm text-muted-foreground">
                          Receive payments when researchers use your data
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="records" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Monetized Records</CardTitle>
                    <CardDescription>
                      Medical records available for research monetization
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {monetizedRecords.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Target className="h-12 w-12 mx-auto mb-4" />
                        <p>No records available for monetization yet.</p>
                        <p className="text-sm">Upload medical records to get started.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {monetizedRecords.map((record) => (
                          <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{record.title}</h4>
                              <p className="text-sm text-muted-foreground">{record.category}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-medium">${record.earnings.toFixed(2)}</p>
                                <p className="text-sm text-muted-foreground">{record.views} views</p>
                              </div>
                              <Badge variant={record.status === 'active' ? 'default' : 'secondary'}>
                                {record.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="marketplace" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Marketplace Statistics</CardTitle>
                    <CardDescription>
                      Current market trends and opportunities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold">{marketplaceStats.totalListings}</div>
                        <p className="text-sm text-muted-foreground">Total Listings</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold">{marketplaceStats.activeBuyers}</div>
                        <p className="text-sm text-muted-foreground">Active Buyers</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold">${marketplaceStats.avgPrice.toFixed(2)}</div>
                        <p className="text-sm text-muted-foreground">Average Price</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Monetization Settings</CardTitle>
                    <CardDescription>
                      Configure your data monetization preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Auto-approve research requests</h4>
                        <p className="text-sm text-muted-foreground">
                          Automatically approve verified research institutions
                        </p>
                      </div>
                      <Switch />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Minimum price per record</h4>
                        <p className="text-sm text-muted-foreground">
                          Set minimum earnings threshold
                        </p>
                      </div>
                      <span className="text-sm font-medium">$5.00</span>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Data retention period</h4>
                        <p className="text-sm text-muted-foreground">
                          How long to keep data available
                        </p>
                      </div>
                      <span className="text-sm font-medium">12 months</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
