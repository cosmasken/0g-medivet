import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Zap, Clock, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { checkComputeHealth, getComputeBalance } from '@/lib/api';
import toast from 'react-hot-toast';

interface ComputeJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  jobType: string;
  result?: any;
  error?: string;
  computeTime?: number;
  createdAt: string;
  completedAt?: string;
}

interface UsageStats {
  totalJobs: number;
  successfulJobs: number;
  totalComputeTime: number;
  totalCost: number;
}

const ComputeDashboard = () => {
  const { currentUser } = useAuthStore();
  const [jobs, setJobs] = useState<ComputeJob[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [balance, setBalance] = useState<{ total: string; locked: string } | null>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fundingAmount, setFundingAmount] = useState(0.01);

  // Restrict to providers only
  if (!currentUser || currentUser.role !== 'provider') {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Provider Access Required</h3>
            <p className="text-gray-600">
              0G Compute Dashboard is only available for healthcare providers.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const addFunding = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch('https://medivet-production.up.railway.app/api/compute/provider-fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: fundingAmount,
          providerId: currentUser.id
        })
      });

      if (response.ok) {
        toast.success(`Added ${fundingAmount} OG tokens to compute account`);
        loadDashboardData(); // Refresh data
      } else {
        const error = await response.json();
        toast.error(`Funding failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Funding failed:', error);
      toast.error('Failed to add funding');
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role === 'provider') {
      loadDashboardData();
    }
  }, [currentUser]);

  const loadDashboardData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // Load compute jobs
      const jobsResponse = await fetch(`https://medivet-production.up.railway.app/api/compute/jobs/user/${currentUser.id}`);
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setJobs(jobsData.jobs || []);
      }

      // Load usage statistics
      const usageResponse = await fetch(`https://medivet-production.up.railway.app/api/compute/usage/${currentUser.id}`);
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setUsageStats(usageData.summary);
      }

      // Load balance and health
      const [balanceData, healthData] = await Promise.all([
        getComputeBalance().catch(() => null),
        checkComputeHealth().catch(() => null)
      ]);

      setBalance(balanceData);
      setHealthStatus(healthData);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load compute dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      running: 'secondary',
      pending: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">0G Compute Dashboard</h2>
          <p className="text-gray-600">Monitor AI analysis jobs and manage funding</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadDashboardData} variant="outline">
            Refresh
          </Button>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={fundingAmount}
              onChange={(e) => setFundingAmount(parseFloat(e.target.value))}
              step="0.001"
              min="0.001"
              max="1"
              className="w-20 px-2 py-1 border rounded text-sm"
            />
            <Button onClick={addFunding} className="bg-blue-600 hover:bg-blue-700">
              Add OG Tokens
            </Button>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold">{usageStats?.totalJobs || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">
                  {usageStats?.totalJobs ? Math.round((usageStats.successfulJobs / usageStats.totalJobs) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Time</p>
                <p className="text-2xl font-bold">
                  {usageStats?.totalJobs ? Math.round((usageStats.totalComputeTime || 0) / usageStats.totalJobs / 1000) : 0}s
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Balance</p>
                <p className="text-2xl font-bold">{balance ? parseFloat(balance.total).toFixed(4) : '0.0000'} OG</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Health */}
      {healthStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Service Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {healthStatus.status === 'healthy' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium capitalize">{healthStatus.status}</span>
              </div>
              
              {healthStatus.circuitBreaker && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Circuit Breaker: {healthStatus.circuitBreaker.isOpen ? 'Open' : 'Closed'}
                  </span>
                  <span className="text-sm text-gray-600">
                    Failures: {healthStatus.circuitBreaker.failures}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jobs and Usage Tabs */}
      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Recent Jobs</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Analysis Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No compute jobs found</p>
              ) : (
                <div className="space-y-3">
                  {jobs.slice(0, 10).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(job.status)}
                        <div>
                          <p className="font-medium">{job.jobType}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(job.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {job.computeTime && (
                          <span className="text-sm text-gray-600">
                            {Math.round(job.computeTime / 1000)}s
                          </span>
                        )}
                        {getStatusBadge(job.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {usageStats ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Compute Time</p>
                      <p className="text-lg font-semibold">
                        {Math.round((usageStats.totalComputeTime || 0) / 1000)}s
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Average Job Time</p>
                      <p className="text-lg font-semibold">
                        {usageStats.totalJobs ? Math.round((usageStats.totalComputeTime || 0) / usageStats.totalJobs / 1000) : 0}s
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Success Rate</span>
                      <span>{usageStats.totalJobs ? Math.round((usageStats.successfulJobs / usageStats.totalJobs) * 100) : 0}%</span>
                    </div>
                    <Progress 
                      value={usageStats.totalJobs ? (usageStats.successfulJobs / usageStats.totalJobs) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-center py-8">No usage data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComputeDashboard;
