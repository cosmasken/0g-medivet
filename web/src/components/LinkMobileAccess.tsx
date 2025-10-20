import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Smartphone, Link, CheckCircle } from 'lucide-react';
import { linkCredentials, checkUsernameAvailability } from '@/lib/api';
import { useAccount } from 'wagmi';

export function LinkMobileAccess() {
  const { address } = useAccount();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLinked, setIsLinked] = useState(false);
  const [error, setError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const checkUsername = async (username: string) => {
    if (username.length < 3) return;
    try {
      const result = await checkUsernameAvailability(username);
      setUsernameAvailable(result.available);
    } catch (err) {
      setUsernameAvailable(null);
    }
  };

  const handleLinkCredentials = async () => {
    if (!address) return;
    
    setIsLoading(true);
    setError('');

    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (!usernameAvailable) {
        throw new Error('Username is not available');
      }

      await linkCredentials(address, username, password);
      setIsLinked(true);
    } catch (err: any) {
      setError(err.message || 'Failed to link mobile access');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLinked) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <CardTitle>Mobile Access Linked!</CardTitle>
          <CardDescription>
            You can now login on mobile using your username and password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Username:</strong> {username}</p>
            <p><strong>Mobile Login:</strong> Use these credentials on the MediVet mobile app</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          <CardTitle>Link Mobile Access</CardTitle>
        </div>
        <CardDescription>
          Set up username and password to access your account on mobile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              checkUsername(e.target.value);
            }}
            placeholder="Choose a username"
          />
          {username.length >= 3 && (
            <p className={`text-sm ${usernameAvailable ? 'text-green-600' : 'text-red-600'}`}>
              {usernameAvailable ? '✓ Username available' : '✗ Username taken'}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleLinkCredentials}
          disabled={
            isLoading ||
            !username ||
            !password ||
            !confirmPassword ||
            !usernameAvailable ||
            password !== confirmPassword
          }
          className="w-full"
        >
          {isLoading ? (
            <>
              <Link className="w-4 h-4 mr-2 animate-spin" />
              Linking...
            </>
          ) : (
            <>
              <Link className="w-4 h-4 mr-2" />
              Link Mobile Access
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Your wallet remains the primary authentication method</p>
          <p>• Mobile credentials enable app access without MetaMask</p>
          <p>• Same account and data across all platforms</p>
        </div>
      </CardContent>
    </Card>
  );
}
