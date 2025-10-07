import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, UserCheck, Eye, Edit, Shield } from 'lucide-react';
import { useProviderStore, Provider, AccessLevel } from '@/stores/providerStore';

interface ProviderSearchProps {
  onSelectProvider?: (provider: Provider) => void;
  filterByAccess?: AccessLevel;
}

export function ProviderSearch({ onSelectProvider, filterByAccess }: ProviderSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { providers, searchProviders, getProvidersByAccess } = useProviderStore();

  const getFilteredProviders = () => {
    if (filterByAccess) {
      return getProvidersByAccess(filterByAccess);
    }
    if (searchQuery.trim()) {
      return searchProviders(searchQuery);
    }
    return providers;
  };

  const getAccessIcon = (accessLevel: AccessLevel) => {
    switch (accessLevel) {
      case 'view': return <Eye className="h-4 w-4" />;
      case 'edit': return <Edit className="h-4 w-4" />;
      case 'full': return <Shield className="h-4 w-4" />;
    }
  };

  const getAccessColor = (accessLevel: AccessLevel) => {
    switch (accessLevel) {
      case 'view': return 'bg-blue-100 text-blue-800';
      case 'edit': return 'bg-yellow-100 text-yellow-800';
      case 'full': return 'bg-green-100 text-green-800';
    }
  };

  const filteredProviders = getFilteredProviders();

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search by address, name, or specialty..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredProviders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchQuery ? 'No providers found matching your search.' : 'No providers added yet.'}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredProviders.map((provider) => (
            <Card key={provider.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{provider.name}</h3>
                      <Badge className={`${getAccessColor(provider.accessLevel)} flex items-center gap-1`}>
                        {getAccessIcon(provider.accessLevel)}
                        {provider.accessLevel}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 font-mono">{provider.walletAddress}</p>
                    {provider.specialty && (
                      <p className="text-sm text-gray-500">{provider.specialty}</p>
                    )}
                  </div>
                  {onSelectProvider && (
                    <Button
                      size="sm"
                      onClick={() => onSelectProvider(provider)}
                      className="ml-4"
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Select
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
