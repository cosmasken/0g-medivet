import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Shield, 
  Sparkles, 
  Database, 
  Brain, 
  Network,
  ArrowRight
} from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useAuthStore } from '@/stores/authStore';

const ConnectWallet: React.FC = () => {
  const { address, isConnected, isConnecting, connect } = useWallet();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();

  // Redirect if already connected and has user profile
  useEffect(() => {
    if (isConnected && address && currentUser) {
      switch (currentUser.role) {
        case 'Patient':
          navigate('/patient/dashboard');
          break;
        case 'Provider':
          navigate('/provider/dashboard');
          break;
        case 'Admin':
          navigate('/admin');
          break;
        default:
          navigate('/');
      }
    }
  }, [isConnected, address, currentUser, navigate]);

  const features = [
    {
      icon: Database,
      title: '0G Storage',
      description: 'Store medical files securely on decentralized infrastructure'
    },
    {
      icon: Brain,
      title: '0G Compute',
      description: 'AI-powered medical analysis and insights'
    },
    {
      icon: Network,
      title: '0G Chain',
      description: 'Fast, secure transactions on EVM-compatible blockchain'
    },
    {
      icon: Shield,
      title: 'Data Ownership',
      description: 'Patients own and control their medical data'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 ai-gradient rounded-2xl flex items-center justify-center zero-g-glow">
              <span className="text-primary-foreground font-bold text-2xl">ØG</span>
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-foreground">0G MediVet</h1>
              <p className="text-muted-foreground">AI-Powered Healthcare Marketplace</p>
            </div>
          </div>
          
          <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            Connect your wallet to access the decentralized medical data marketplace powered by 0G's AI infrastructure
          </p>
          
          <Badge variant="outline" className="ai-gradient text-white border-none px-4 py-2">
            <Sparkles className="mr-2 h-4 w-4" />
            Decentralized • AI-Powered • Patient-Owned
          </Badge>
        </div>

        {/* Main Connection Card */}
        <Card className="medical-card max-w-md mx-auto mb-8 neural-network">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 ai-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 zero-g-glow">
              <Wallet className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect to 0G Galileo Testnet to start using the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Secure wallet connection via Web3Modal</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>No personal information required</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Choose your role after connecting</span>
              </div>
            </div>
            
            <Button 
              onClick={connect}
              disabled={isConnecting || isConnected}
              className="w-full ai-gradient zero-g-glow text-lg py-6 font-semibold"
              size="lg"
            >
              <Wallet className="mr-2 h-5 w-5" />
              {isConnecting ? 'Connecting...' : isConnected ? 'Connected!' : 'Connect Wallet'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            {isConnected && address && (
              <div className="text-center text-sm text-muted-foreground">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>Connected: {address.slice(0, 6)}...{address.slice(-4)}</span>
                </div>
                <p className="mt-2">Setting up your profile...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card key={idx} className="border-primary/20 bg-card/50">
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Need testnet tokens? Visit the <a href="https://faucet.0g.ai/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">0G Faucet</a></p>
        </div>
      </div>
    </div>
  );
};

export default ConnectWallet;
