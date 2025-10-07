import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronDown, Plus, User, Stethoscope } from "lucide-react";

interface Account {
  id: string;
  name: string;
  email: string;
  role: "patient" | "provider";
  organization?: string;
}

const mockAccounts: Account[] = [
  {
    id: "1",
    name: "Dr. Sarah Wilson",
    email: "sarah.wilson@cityhealth.com",
    role: "provider",
    organization: "City Health Medical Center"
  },
  {
    id: "2", 
    name: "Sarah Wilson",
    email: "sarah.wilson@email.com",
    role: "patient"
  }
];

export function AccountSwitcher() {
  const [selectedAccount, setSelectedAccount] = useState<Account>(mockAccounts[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-64 justify-between bg-card hover:bg-accent">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className={selectedAccount.role === 'provider' ? 'bg-primary text-primary-foreground' : 'bg-health text-health-foreground'}>
                {selectedAccount.role === 'provider' ? (
                  <Stethoscope className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{selectedAccount.name}</span>
              <Badge variant={selectedAccount.role === 'provider' ? 'default' : 'secondary'} className="text-xs">
                {selectedAccount.role}
              </Badge>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-72" align="start">
        <DropdownMenuLabel>Switch Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {mockAccounts.map((account) => (
          <DropdownMenuItem
            key={account.id}
            className="p-3 cursor-pointer"
            onClick={() => setSelectedAccount(account)}
          >
            <div className="flex items-center space-x-3 w-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback className={account.role === 'provider' ? 'bg-primary text-primary-foreground' : 'bg-health text-health-foreground'}>
                  {account.role === 'provider' ? (
                    <Stethoscope className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{account.name}</span>
                  <Badge variant={account.role === 'provider' ? 'default' : 'secondary'} className="text-xs">
                    {account.role}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">{account.email}</span>
                {account.organization && (
                  <span className="text-xs text-muted-foreground">{account.organization}</span>
                )}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}