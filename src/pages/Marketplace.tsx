import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useMarketStore } from '@/stores/marketStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  ShoppingCart, 
  DollarSign, 
  Clock, 
  TrendingUp,
  Eye,
  Filter,
  Gavel,
  Database,
  CheckCircle,
  ShieldCheck
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import toast from 'react-hot-toast';

const Marketplace: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { listings, placeBid, acceptBid, getBidsForRecord } = useMarketStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState('');

  const categories = ['all', 'General Health', 'Cardiology', 'Diabetes Care', 'Laboratory', 'Mental Health'];
  
  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || listing.category === categoryFilter;
    const isActive = listing.status === 'active';
    return matchesSearch && matchesCategory && isActive;
  });

  const handlePlaceBid = () => {
    if (!currentUser || !selectedListing || !bidAmount) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    const amount = parseFloat(bidAmount);
    const minimumBid = selectedListing.currentHighestBid 
      ? selectedListing.currentHighestBid + 1 
      : selectedListing.minimumBid;

    if (amount < minimumBid) {
      toast.error(`Bid must be at least ${minimumBid} MT`);
      return;
    }

    placeBid(selectedListing.recordId, currentUser.principal, amount);
    toast.success('Bid placed successfully!');
    setBidModalOpen(false);
    setBidAmount('');
    setSelectedListing(null);
  };

  const handleAcceptBid = (bidId: number) => {
    acceptBid(bidId);
    toast.success('Bid accepted! Payment processing...');
  };

  const isMyListing = (listing: any) => currentUser?.principal === listing.patient;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Health Data Marketplace
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover and bid on anonymized health research data
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="success-shadow">
            <DollarSign className="h-3 w-3 mr-1" />
            {filteredListings.length} Active Listings
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{listings.filter(l => l.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">Active marketplace items</p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {Math.round(listings.reduce((sum, l) => sum + (l.currentHighestBid || l.minimumBid), 0) / listings.length) || 0} MT
            </div>
            <p className="text-xs text-muted-foreground">Average bid value</p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {listings.reduce((sum, l) => sum + l.bidCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all listings</p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {Math.round((listings.filter(l => l.status === 'sold').length / listings.length) * 100) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">Listings sold</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="medical-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full md:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((listing) => {
          const timeLeft = listing.expiresAt - Date.now();
          const bidsForListing = getBidsForRecord(listing.recordId);
          const isOwner = isMyListing(listing);
          
          return (
            <Card key={listing.id} className="medical-card medical-transition hover:medical-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline">{listing.category}</Badge>
                      {isOwner && <Badge variant="secondary">Your Listing</Badge>}
                    </div>
                  </div>
                </div>
                <CardDescription className="line-clamp-3">
                  {listing.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-t border-b border-border py-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center"><Database className="h-3 w-3 mr-1.5" />Data Points</span>
                      <span className="font-medium">{listing.dataPoints.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center"><CheckCircle className="h-3 w-3 mr-1.5" />Correctness</span>
                      <span className="font-medium text-success">{listing.correctness}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center"><ShieldCheck className="h-3 w-3 mr-1.5" />Anonymization</span>
                      <span className="font-medium">{listing.anonymization}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Price</p>
                      <p className="text-2xl font-bold text-success">
                        {listing.currentHighestBid || listing.minimumBid} MT
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Bids</p>
                      <p className="text-lg font-semibold">{listing.bidCount}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {timeLeft > 0 
                        ? `Ends ${formatDistance(new Date(listing.expiresAt), new Date(), { addSuffix: true })}`
                        : 'Auction ended'
                      }
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    {isOwner ? (
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => toast('View your listing details')}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedListing(listing);
                            setBidModalOpen(true);
                          }}
                          disabled={currentUser?.role !== 'Provider'}
                        >
                          <Gavel className="mr-2 h-4 w-4" />
                          Place Bid
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>

                  {isOwner && bidsForListing.length > 0 && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm font-medium mb-2">Recent Bids:</p>
                      <div className="space-y-1">
                        {bidsForListing.slice(0, 2).map((bid) => (
                          <div key={bid.id} className="flex items-center justify-between text-xs">
                            <span>{bid.amount} MT</span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAcceptBid(bid.id)}
                            >
                              Accept
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredListings.length === 0 && (
        <Card className="medical-card">
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No listings found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bid Modal */}
      <Dialog open={bidModalOpen} onOpenChange={setBidModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place a Bid</DialogTitle>
            <DialogDescription>
              {selectedListing && `Bidding on "${selectedListing.title}"`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedListing && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Current Highest Bid</p>
                    <p className="text-2xl font-bold text-success">
                      {selectedListing.currentHighestBid || selectedListing.minimumBid} MT
                    </p>
                  </div>
                  <Badge variant="outline">{selectedListing.category}</Badge>
                </div>
              </div>

              <div>
                <Label htmlFor="bidAmount">Your Bid (MT)</Label>
                <Input
                  id="bidAmount"
                  type="number"
                  placeholder={`Minimum: ${(selectedListing.currentHighestBid || selectedListing.minimumBid) + 1}`}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum bid: {(selectedListing.currentHighestBid || selectedListing.minimumBid) + 1} MT
                </p>
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setBidModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handlePlaceBid}
                  className="flex-1 success-gradient"
                  disabled={!bidAmount}
                >
                  <Gavel className="mr-2 h-4 w-4" />
                  Place Bid
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Marketplace;