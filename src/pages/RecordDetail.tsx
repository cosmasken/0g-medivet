import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecordStore } from '@/stores/recordStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  ArrowLeft, 
  Unlock, 
  Calendar, 
  User, 
  Eye,
  Download,
  Share2,
  Shield
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import toast from 'react-hot-toast';

const RecordDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { records, unlockRecord } = useRecordStore();
  const { currentUser } = useAuthStore();
  const [decrypting, setDecrypting] = useState(false);
  const [decrypted, setDecrypted] = useState(false);

  const recordId = parseInt(id || '0');
  const record = records.find(r => r.id === recordId);

  if (!record) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Record Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The requested health record could not be found.
          </p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.principal === record.owner;
  const hasAccess = isOwner || record.sharedWith?.some(s => s.provider === currentUser?.principal);

  const handleDecrypt = async () => {
    if (!currentUser) return;
    
    setDecrypting(true);
    try {
      await unlockRecord(record.id, currentUser.principal);
      setDecrypted(true);
      toast.success('Record decrypted successfully!');
    } catch (error) {
      toast.error('Failed to decrypt record');
    } finally {
      setDecrypting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Monetizable': return 'success';
      case 'NonMonetizable': return 'secondary';
      case 'Flagged': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusColor(record.status) as any}>
            {record.status}
          </Badge>
          {isOwner && <Badge variant="outline">Your Record</Badge>}
        </div>
      </div>

      {/* Record Overview */}
      <Card className="medical-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center space-x-3">
                <FileText className="h-6 w-6" />
                <span>{record.title}</span>
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                {record.category} • Created {formatDistance(new Date(record.createdAt), new Date(), { addSuffix: true })}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Created: {new Date(record.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span>Accessed: {record.accessCount} times</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Owner: {isOwner ? 'You' : 'Anonymous Patient'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>Status: {record.status}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Share2 className="h-4 w-4 text-muted-foreground" />
                <span>Shared with: {record.sharedWith?.length || 0} providers</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Data Size</p>
                <p className="text-lg">{record.encryptedBlob.length} bytes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      {hasAccess ? (
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Unlock className="h-5 w-5" />
              <span>Record Access</span>
            </CardTitle>
            <CardDescription>
              You have permission to access this encrypted health record
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!decrypted ? (
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Encrypted Content</p>
                      <p className="text-sm text-muted-foreground">
                        This record is encrypted for privacy. Click decrypt to view the contents.
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={handleDecrypt}
                  disabled={decrypting}
                  className="medical-gradient"
                >
                  {decrypting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      <span>Decrypting...</span>
                    </div>
                  ) : (
                    <>
                      <Unlock className="mr-2 h-4 w-4" />
                      Decrypt Record
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-medium text-success">Record Decrypted</p>
                      <p className="text-sm text-muted-foreground">
                        You can now view the medical record contents.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mock decrypted content */}
                <div className="space-y-4">
                  <Separator />
                  <div className="prose max-w-none">
                    <h3>Medical Record Content</h3>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm">
                        <strong>Patient:</strong> Anonymous (ID: {record.owner.slice(-8)})<br />
                        <strong>Date:</strong> {new Date(record.createdAt).toLocaleDateString()}<br />
                        <strong>Category:</strong> {record.category}<br />
                        <strong>Title:</strong> {record.title}
                      </p>
                      <Separator className="my-3" />
                      <p className="text-sm">
                        This is a simulated view of the decrypted medical record. In a real implementation, 
                        this would show the actual medical data including test results, diagnoses, 
                        treatment plans, and other relevant health information.
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="medical-card">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
              <p className="text-muted-foreground mb-4">
                You don't have permission to view this health record.
              </p>
              <p className="text-sm text-muted-foreground">
                Contact the patient to request access to this record.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sharing Information */}
      {record.sharedWith && record.sharedWith.length > 0 && (
        <Card className="medical-card">
          <CardHeader>
            <CardTitle>Shared Access</CardTitle>
            <CardDescription>
              This record has been shared with the following providers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {record.sharedWith.map((share, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Provider ID: {share.provider.slice(-8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {share.expiresAt 
                          ? `Expires ${formatDistance(new Date(share.expiresAt), new Date(), { addSuffix: true })}`
                          : 'No expiration'
                        }
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RecordDetail;