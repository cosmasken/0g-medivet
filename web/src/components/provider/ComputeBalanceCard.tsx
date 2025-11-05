import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Coins, Plus, Zap, TrendingUp, Clock, DollarSign } from 'lucide-react';

interface ComputeBalanceCardProps {
  balance?: number;
  monthlyUsage?: number;
  className?: string;
}

export function ComputeBalanceCard({ 
  balance = 0, 
  monthlyUsage = 0, 
  className = "" 
}: ComputeBalanceCardProps) {
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  // TODO: Implement real balance fetching from 0G Network
  const mockBalance = 25.50;
  const mockMonthlyUsage = 12.30;
  const mockUsageLimit = 50.00;
  const usagePercentage = (mockMonthlyUsage / mockUsageLimit) * 100;

  const handleTopUp = async () => {
    // TODO: Implement 0G token purchase/top-up
    console.log('Top up amount:', topUpAmount);
    setIsTopUpOpen(false);
    setTopUpAmount('');
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-600" />
            Compute Balance
          </CardTitle>
          <Badge variant="secondary">0G Network</Badge>
        </div>
        <CardDescription>
          Your available compute credits for AI analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Balance */}
        <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border">
          <div className="text-3xl font-bold text-yellow-700">
            {mockBalance.toFixed(2)} OG
          </div>
          <p className="text-sm text-yellow-600">Available Credits</p>
        </div>

        {/* Monthly Usage */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Monthly Usage</span>
            <span className="font-medium">{mockMonthlyUsage.toFixed(2)} / {mockUsageLimit.toFixed(2)} OG</span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Used this month</span>
            <span>{usagePercentage.toFixed(1)}% of limit</span>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="font-bold text-blue-700">15</div>
            <div className="text-blue-600">Analyses Run</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="font-bold text-green-700">2.1</div>
            <div className="text-green-600">Avg Cost (OG)</div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Recent Usage</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {[
              { type: 'analysis', amount: -2.5, description: 'Radiology Analysis - Patient #1234', time: '2 hours ago' },
              { type: 'analysis', amount: -1.8, description: 'Lab Results Analysis - Patient #5678', time: '1 day ago' },
              { type: 'topup', amount: +10.0, description: 'Balance Top-up', time: '3 days ago' }
            ].map((tx, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                <div className="flex items-center gap-2">
                  {tx.type === 'analysis' ? (
                    <Zap className="h-3 w-3 text-purple-600" />
                  ) : (
                    <Plus className="h-3 w-3 text-green-600" />
                  )}
                  <div>
                    <div className="font-medium">{tx.description}</div>
                    <div className="text-muted-foreground">{tx.time}</div>
                  </div>
                </div>
                <div className={`font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} OG
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top-up Section */}
        {!isTopUpOpen ? (
          <Button 
            onClick={() => setIsTopUpOpen(true)} 
            className="w-full"
            variant={mockBalance < 5 ? "default" : "outline"}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Credits
          </Button>
        ) : (
          <div className="space-y-3 p-3 border rounded-lg">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Amount (OG)"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                min="1"
                step="0.1"
              />
              <Button onClick={handleTopUp} disabled={!topUpAmount}>
                <DollarSign className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              {[5, 10, 25, 50].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setTopUpAmount(amount.toString())}
                  className="flex-1"
                >
                  {amount} OG
                </Button>
              ))}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsTopUpOpen(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Low Balance Warning */}
        {mockBalance < 5 && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 text-orange-800">
              <Clock className="h-4 w-4" />
              <span className="font-medium text-sm">Low Balance Warning</span>
            </div>
            <p className="text-xs text-orange-700 mt-1">
              Your compute balance is running low. Add credits to continue using AI analysis features.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
