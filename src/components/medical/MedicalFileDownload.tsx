import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Loader2, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { downloadByRootHashAPI, downloadBlobAsFile } from '@/lib/0g/downloader';
import { getNetworkConfig } from '@/lib/0g/network';
import { useNetwork } from '@/providers/NetworkProvider';
import toast from 'react-hot-toast';

interface MedicalFileDownloadProps {
  className?: string;
}

const MedicalFileDownload: React.FC<MedicalFileDownloadProps> = ({ className }) => {
  const [rootHash, setRootHash] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { networkType } = useNetwork();

  const handleDownload = async () => {
    if (!rootHash.trim()) {
      setError('Please enter a root hash');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const network = getNetworkConfig(networkType);
      console.log('🔽 Starting download:', { rootHash, network: network.name });

      const [fileData, downloadError] = await downloadByRootHashAPI(rootHash.trim(), network.storageRpc);
      
      if (downloadError || !fileData) {
        setError(downloadError?.message || 'Download failed');
        return;
      }

      // Generate filename if not provided
      const downloadFileName = fileName.trim() || `medical-file-${rootHash.substring(0, 8)}.bin`;
      
      // Download the file
      downloadBlobAsFile(fileData, downloadFileName);
      
      setSuccess(true);
      toast.success(`File downloaded successfully as ${downloadFileName}`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      setError(errorMessage);
      toast.error(`Download failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setRootHash('');
    setFileName('');
    setError('');
    setSuccess(false);
  };

  const copyExampleHash = () => {
    const exampleHash = "0x1234567890abcdef1234567890abcdef12345678";
    setRootHash(exampleHash);
    toast.success('Example hash copied to input');
  };

  return (
    <div className={className}>
      <Card className="medical-card">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 ai-gradient rounded-lg flex items-center justify-center zero-g-glow">
              <Download className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle>Download from 0G Storage</CardTitle>
              <CardDescription>
                Download medical files using their root hash identifier
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rootHash">Root Hash *</Label>
            <div className="flex space-x-2">
              <Input
                id="rootHash"
                placeholder="0x..."
                value={rootHash}
                onChange={(e) => setRootHash(e.target.value)}
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={copyExampleHash}
                className="flex-shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The unique identifier from when you uploaded the file
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileName">File Name (Optional)</Label>
            <Input
              id="fileName"
              placeholder="medical-report.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              If not specified, will use "medical-file-[hash].bin"
            </p>
          </div>

          {error && (
            <Alert className="bg-destructive/10 border-destructive/20">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-success/10 border-success/20">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                File downloaded successfully!
              </AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-2">
            <Button
              onClick={handleDownload}
              disabled={loading || !rootHash.trim()}
              className="ai-gradient zero-g-glow flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </>
              )}
            </Button>
            
            {(rootHash || fileName || error || success) && (
              <Button
                onClick={handleClear}
                variant="outline"
                disabled={loading}
              >
                Clear
              </Button>
            )}
          </div>

          {/* Network indicator */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Using {networkType === 'standard' ? 'Standard' : 'Turbo'} network mode
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalFileDownload;
