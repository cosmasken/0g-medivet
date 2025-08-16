import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAuditStore } from '@/stores/auditStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Eye, Download, Share2, FilePlus, FileMinus, Clock, Search, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const actionIcons: { [key: string]: React.ElementType } = {
  CREATE: FilePlus,
  SHARE: Share2,
  VIEW: Eye,
  DOWNLOAD: Download,
  REVOKE: FileMinus,
  EXPIRE: Clock,
};

const AuditLog: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { getLogs } = useAuditStore();
  const [searchQuery, setSearchQuery] = useState('');

  const logs = getLogs(currentUser);

  const filteredLogs = logs.filter(log => 
    log.recordTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.actor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Audit Log</h1>
        <p className="text-muted-foreground mt-1">An immutable record of all data access events.</p>
      </div>

      <Card className="medical-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative pl-6">
            {/* Vertical line */}
            <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-border" />

            {filteredLogs.map((log, index) => {
              const Icon = actionIcons[log.action];
              return (
                <div key={log.id} className="relative pl-8 py-4">
                  <div className="absolute left-0 top-7 transform -translate-x-1/2">
                    <div className="w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center">
                      <Icon className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{log.actor.name} <span className="font-normal text-muted-foreground">{log.action.toLowerCase()}d</span> {log.recordTitle}</p>
                        <p className="text-sm text-muted-foreground">{format(new Date(log.timestamp), 'PPP p')}</p>
                      </div>
                      <a href={`https://icscan.io/transaction/${log.txHash}`} target="_blank" rel="noopener noreferrer">
                        <Badge variant="outline">{log.txHash.substring(0, 10)}...</Badge>
                      </a>
                    </div>
                    <Collapsible className="mt-2">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <ChevronsUpDown className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLog;
