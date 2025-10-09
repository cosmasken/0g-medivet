import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, User, Plus, Wallet } from 'lucide-react';

interface PatientSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientSelect?: (patientId: string) => void;
}

export function PatientSearchModal({ open, onOpenChange, onPatientSelect }: PatientSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // TODO: Implement real patient search API
  const mockPatients = [
    {
      id: '1',
      name: 'John Doe',
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      age: 45,
      lastVisit: '2024-01-15',
      conditions: ['Hypertension', 'Diabetes']
    },
    {
      id: '2', 
      name: 'Jane Smith',
      walletAddress: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
      age: 32,
      lastVisit: '2024-01-20',
      conditions: ['Asthma']
    }
  ];

  const handleSearch = async () => {
    setIsSearching(true);
    
    // TODO: Replace with real API call
    // const results = await searchPatients(searchQuery);
    
    // Mock search logic
    const filtered = mockPatients.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.walletAddress.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResults(filtered);
    setIsSearching(false);
  };

  const handleAddPatient = (patientId: string) => {
    // TODO: Implement add patient relationship API
    console.log('Adding patient:', patientId);
    onPatientSelect?.(patientId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search Patients</DialogTitle>
          <DialogDescription>
            Search for patients by name or wallet address to add them to your care
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by name or wallet address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {searchResults.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{patient.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Wallet className="h-3 w-3" />
                        <span>{patient.walletAddress.slice(0, 6)}...{patient.walletAddress.slice(-4)}</span>
                        <span>•</span>
                        <span>Age: {patient.age}</span>
                      </div>
                      <div className="flex gap-1 mt-1">
                        {patient.conditions.map((condition: string) => (
                          <Badge key={condition} variant="secondary" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => handleAddPatient(patient.id)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Patient
                  </Button>
                </div>
              ))}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && !isSearching && (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4" />
              <p>No patients found matching "{searchQuery}"</p>
              <p className="text-sm">Try searching by name or wallet address</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
