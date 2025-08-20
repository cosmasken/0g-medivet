import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Store,
  Upload,
  Download,
  FileText,
  DollarSign,
  Clock,
  User,
  Search,
  Filter,
  Heart,
  Share2,
  Eye
} from 'lucide-react';
import { useMedicalFilesStore } from '@/stores/medicalFilesStore';
import { useWallet } from '@/hooks/useWallet';
import toast from 'react-hot-toast';

interface MedicalMarketplaceProps {
  className?: string;
}

// Mock marketplace data structure
interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  category: 'lab-results' | 'imaging' | 'prescriptions' | 'reports' | 'other';
  price: number; // in ETH
  currency: string;
  sellerAddress: string;
  sellerName: string;
  uploadDate: Date;
  fileSize: string;
  rootHash: string;
  isVerified: boolean;
  downloads: number;
  rating: number;
}

const MedicalMarketplace: React.FC<MedicalMarketplaceProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Listing form state
  const [listingForm, setListingForm] = useState({
    title: '',
    description: '',
    category: 'other' as const,
    price: '',
    rootHash: ''
  });

  const { address } = useWallet();
  const { getFilesByWallet } = useMedicalFilesStore();

  // Mock marketplace listings
  const mockListings: MarketplaceListing[] = [
    {
      id: '1',
      title: 'Blood Test Results - Complete Panel',
      description: 'Comprehensive blood work including CBC, metabolic panel, and lipid profile. Recent results from certified lab.',
      category: 'lab-results',
      price: 0.001,
      currency: 'ETH',
      sellerAddress: '0x1234...5678',
      sellerName: 'Anonymous Patient',
      uploadDate: new Date('2024-12-15'),
      fileSize: '2.3 MB',
      rootHash: '0xabc123...',
      isVerified: true,
      downloads: 5,
      rating: 4.8
    },
    {
      id: '2',
      title: 'MRI Scan - Brain Imaging',
      description: 'High-resolution brain MRI scan with detailed imaging. Suitable for research purposes.',
      category: 'imaging',
      price: 0.005,
      currency: 'ETH',
      sellerAddress: '0x8765...4321',
      sellerName: 'Research Participant',
      uploadDate: new Date('2024-12-10'),
      fileSize: '45.7 MB',
      rootHash: '0xdef456...',
      isVerified: true,
      downloads: 12,
      rating: 5.0
    }
  ];

  const userFiles = address ? getFilesByWallet(address) : [];
  
  const categories = [
    { value: 'all', label: 'All Categories', icon: Store },
    { value: 'lab-results', label: 'Lab Results', icon: FileText },
    { value: 'imaging', label: 'Medical Imaging', icon: Eye },
    { value: 'prescriptions', label: 'Prescriptions', icon: FileText },
    { value: 'reports', label: 'Medical Reports', icon: FileText },
    { value: 'other', label: 'Other', icon: FileText }
  ];

  const filteredListings = mockListings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateListing = () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!listingForm.title || !listingForm.description || !listingForm.price || !listingForm.rootHash) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Mock listing creation
    console.log('Creating listing:', listingForm);
    toast.success('Listing created successfully! (Demo mode)');
    
    // Reset form
    setListingForm({
      title: '',
      description: '',
      category: 'other',
      price: '',
      rootHash: ''
    });
  };

  const handlePurchase = (listing: MarketplaceListing) => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    toast.success(`Purchase initiated for ${listing.title} (Demo mode)`);
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : FileText;
  };

  return (
    <div className={className}>
      <Card className="medical-card">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 ai-gradient rounded-lg flex items-center justify-center zero-g-glow">
              <Store className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle>Medical Data Marketplace</CardTitle>
              <CardDescription>
                Share and discover medical data securely on 0G Storage
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browse">Browse & Buy</TabsTrigger>
              <TabsTrigger value="sell">List Your Data</TabsTrigger>
            </TabsList>

            {/* Browse Tab */}
            <TabsContent value="browse" className="space-y-4">
              {/* Search and Filter */}
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search medical data..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Listings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredListings.map(listing => {
                  const CategoryIcon = getCategoryIcon(listing.category);
                  
                  return (
                    <Card key={listing.id} className="border">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <CategoryIcon className="h-4 w-4 text-primary" />
                            <CardTitle className="text-lg">{listing.title}</CardTitle>
                          </div>
                          {listing.isVerified && (
                            <Badge variant="outline" className="text-success border-success">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-sm">
                          {listing.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {/* Metadata */}
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{listing.sellerName}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Download className="h-3 w-3" />
                              <span>{listing.downloads} downloads</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{listing.uploadDate.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FileText className="h-3 w-3" />
                              <span>{listing.fileSize}</span>
                            </div>
                          </div>

                          {/* Price and Action */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4 text-success" />
                              <span className="font-semibold text-success">
                                {listing.price} {listing.currency}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              className="ai-gradient zero-g-glow"
                              onClick={() => handlePurchase(listing)}
                            >
                              Purchase & Download
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredListings.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No listings found matching your criteria</p>
                </div>
              )}
            </TabsContent>

            {/* Sell Tab */}
            <TabsContent value="sell" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Blood Test Results - Complete Panel"
                    value={listingForm.title}
                    onChange={(e) => setListingForm({...listingForm, title: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of your medical data..."
                    value={listingForm.description}
                    onChange={(e) => setListingForm({...listingForm, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={listingForm.category}
                      onChange={(e) => setListingForm({...listingForm, category: e.target.value as any})}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      {categories.slice(1).map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (ETH) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.001"
                      placeholder="0.001"
                      value={listingForm.price}
                      onChange={(e) => setListingForm({...listingForm, price: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rootHash">Root Hash *</Label>
                  <Input
                    id="rootHash"
                    placeholder="0x..."
                    value={listingForm.rootHash}
                    onChange={(e) => setListingForm({...listingForm, rootHash: e.target.value})}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    The root hash of your uploaded file from 0G Storage
                  </p>
                </div>

                {/* Your Files Quick Select */}
                {userFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Quick Select from Your Files:</Label>
                    <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                      {userFiles.map(file => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-accent"
                          onClick={() => {
                            setListingForm({
                              ...listingForm,
                              rootHash: file.rootHash || '',
                              title: listingForm.title || file.name
                            });
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{file.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(file.uploadDate).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleCreateListing}
                  className="w-full ai-gradient zero-g-glow"
                  disabled={!address}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Create Listing
                </Button>

                {!address && (
                  <p className="text-sm text-muted-foreground text-center">
                    Connect your wallet to create listings
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalMarketplace;
