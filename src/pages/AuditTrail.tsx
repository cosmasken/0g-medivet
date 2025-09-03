import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { RefreshCw, Shield, FileText, Users, Settings } from "lucide-react";
import { auditService, AuditLog } from '@/services/auditService';
import { useWallet } from '@/hooks/useWallet';

interface AuditTrailProps {
  patientId?: string;
}

const AuditTrail: React.FC<AuditTrailProps> = ({ patientId }) => {
  const { address } = useWallet();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditLogs = async () => {
    if (!address) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await auditService.getLogs(address);
      setAuditLogs(response.logs);
    } catch (err) {
      setError('Failed to fetch audit logs');
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [address]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'file_upload':
        return <FileText className="h-4 w-4" />;
      case 'permission_granted':
      case 'permission_revoked':
        return <Users className="h-4 w-4" />;
      case 'login':
      case 'logout':
        return <Shield className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'file_upload':
        return 'bg-blue-100 text-blue-800';
      case 'permission_granted':
        return 'bg-green-100 text-green-800';
      case 'permission_revoked':
        return 'bg-red-100 text-red-800';
      case 'login':
        return 'bg-purple-100 text-purple-800';
      case 'logout':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading audit logs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Audit Trail
            </CardTitle>
            <CardDescription>
              Complete log of all activities and data access events
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAuditLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-8 text-red-600">
            {error}
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No audit logs found
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="mt-1">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getActionColor(log.action)}>
                        {log.action.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900">
                      {log.details || `${log.action} on ${log.resource_type}`}
                    </p>
                    {log.resource_id && (
                      <p className="text-xs text-gray-500 mt-1">
                        Resource ID: {log.resource_id}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditTrail;
