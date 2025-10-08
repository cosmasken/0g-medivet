import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateAddressFromCredentials } from '@/lib/crypto';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { User, UserPlus, Eye, EyeOff } from 'lucide-react';

interface UsernamePasswordAuthProps {
  onSuccess?: () => void;
}

const UsernamePasswordAuth = ({ onSuccess }: UsernamePasswordAuthProps) => {
  const navigate = useNavigate();
  const { loginWithCredentials, login, setLoading } = useAuthStore();
  
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
    showPassword: false
  });
  
  const [registerForm, setRegisterForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: '' as 'patient' | 'provider' | '',
    fullName: '',
    showPassword: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      await loginWithCredentials(loginForm.username, loginForm.password);
      
      // Navigate based on user role after successful login
      const { currentUser } = useAuthStore.getState();
      if (currentUser) {
        const dashboardPath = currentUser.role === 'patient' ? '/dashboard/patient' : '/dashboard/provider';
        navigate(dashboardPath);
      }
      
      onSuccess?.();
    } catch (error: any) {
      console.error('Login failed:', error);
      setError('Invalid username or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerForm.username || !registerForm.password || !registerForm.role || !registerForm.fullName) {
      setError('Please fill in all fields');
      return;
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (registerForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      // Generate wallet address from credentials
      const walletAddress = await generateAddressFromCredentials(registerForm.username, registerForm.password);
      
      // Create profile based on role
      const profile = registerForm.role === 'patient' ? {
        fullName: registerForm.fullName,
        dob: '',
        contact: '',
        emergency: '',
        username: registerForm.username
      } : {
        fullName: registerForm.fullName,
        specialization: '',
        licenseNumber: '',
        contact: '',
        username: registerForm.username
      };
      
      // Register and login
      await login(registerForm.role, profile, walletAddress);
      
      onSuccess?.();
      // Navigate to onboarding for new users
      const onboardingPath = registerForm.role === 'patient' ? '/onboarding/patient' : '/onboarding/provider';
      navigate(onboardingPath);
    } catch (error: any) {
      console.error('Registration failed:', error);
      setError('Registration failed. Username may already exist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Account Access
        </CardTitle>
        <CardDescription>
          Login with username/password or create a new account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username">Username</Label>
                <Input
                  id="login-username"
                  type="text"
                  placeholder="Enter your username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={loginForm.showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setLoginForm(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                  >
                    {loginForm.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              {error && <p className="text-sm text-red-600">{error}</p>}
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-role">Role</Label>
                <Select 
                  value={registerForm.role} 
                  onValueChange={(value: 'patient' | 'provider') => 
                    setRegisterForm(prev => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="provider">Healthcare Provider</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-fullname">Full Name</Label>
                <Input
                  id="register-fullname"
                  type="text"
                  placeholder="Enter your full name"
                  value={registerForm.fullName}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, fullName: e.target.value }))}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-username">Username</Label>
                <Input
                  id="register-username"
                  type="text"
                  placeholder="Choose a username"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={registerForm.showPassword ? "text" : "password"}
                    placeholder="Create a password (min 6 chars)"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setRegisterForm(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                  >
                    {registerForm.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-confirm">Confirm Password</Label>
                <Input
                  id="register-confirm"
                  type="password"
                  placeholder="Confirm your password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  disabled={isSubmitting}
                />
              </div>
              
              {error && <p className="text-sm text-red-600">{error}</p>}
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <UserPlus className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UsernamePasswordAuth;
