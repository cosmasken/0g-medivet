import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProviderRecordsQuery, useViewRecordMutation } from '@/hooks/useProviderRecords';
import { useAuthStore } from '@/stores/authStore';
import { Eye, FileText, Calendar, User } from 'lucide-react';

export default function ProviderDashboard() {
  const { currentUser } = useAuthStore();
  const { data: recordsData, isLoading } = useProviderRecordsQuery();
  const viewRecordMutation = useViewRecordMutation();

  const handleViewRecord = (recordId: string, patientId: string) => {
    viewRecordMutation.mutate({ recordId, patientId });
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  const sharedRecords = recordsData?.permissions || [];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Provider Dashboard</h1>
        <p className="text-muted-foreground">View patient records shared with you</p>
      </div>

      <Tabs defaultValue="shared-records" className="space-y-4">
        <TabsList>
          <TabsTrigger value="shared-records">Shared Records</TabsTrigger>
          <TabsTrigger value="patients">My Patients</TabsTrigger>
        </TabsList>

        <TabsContent value="shared-records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Records Shared With You</CardTitle>
              <CardDescription>
                Medical records that patients have shared with you
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sharedRecords.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No records have been shared with you yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {sharedRecords.map((permission: any) => (
                    <Card key={permission.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <h3 className="font-semibold">{permission.medical_record?.title}</h3>
                              <Badge variant="outline">{permission.permission_level}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>Patient ID: {permission.patient_id}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Shared: {new Date(permission.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <p className="text-sm">{permission.medical_record?.description}</p>
                          </div>
                          <Button
                            onClick={() => handleViewRecord(permission.record_id, permission.patient_id)}
                            disabled={viewRecordMutation.isPending}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Record
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients">
          <Card>
            <CardHeader>
              <CardTitle>My Patients</CardTitle>
              <CardDescription>
                Patients who have shared records with you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Patient management coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
