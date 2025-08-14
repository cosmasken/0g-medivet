import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Sun, Moon, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header: React.FC = () => {
  const { currentUser, logout } = useAuthStore();
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const getUserInitials = () => {
    if (!currentUser) return 'U';
    const profile = currentUser.profile;
    if ('fullName' in profile) {
      return profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
    } else {
      return profile.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
  };

  const getUserName = () => {
    if (!currentUser) return 'User';
    const profile = currentUser.profile;
    return 'fullName' in profile ? profile.fullName : profile.name;
  };

  return (
    <header className="medical-card border-b border-border px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 medical-gradient rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">M</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">MediVet</h1>
          </div>
          <div className="hidden md:flex items-center space-x-1 text-sm text-muted-foreground">
            <span>•</span>
            <span className="capitalize">{currentUser?.role}</span>
            {currentUser?.role === 'Provider' && 'whitelisted' in currentUser.profile && (
              <>
                <span>•</span>
                <span className={currentUser.profile.whitelisted ? 'text-success' : 'text-warning'}>
                  {currentUser.profile.whitelisted ? 'Verified' : 'Pending'}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="medical-transition"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium">
                  {getUserName()}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;