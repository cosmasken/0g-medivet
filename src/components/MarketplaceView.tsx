import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Filter,
  TrendingUp,
  Star,
  Clock,
  DollarSign,
  ShoppingCart,
  Eye,
  Calendar,
  BarChart3,
  Award,
  Shield,
  Zap
} from "lucide-react";
import { mockMonetizedRecords, mockTransactions, RECORD_PRICING, type MonetizedRecord } from "@/lib/monetization-data";

interface MarketplaceViewProps {
  providerId: string;
  onPurchase: (recordId: string, amount: number) => void;
}

export function MarketplaceView({ providerId, onPurchase }: MarketplaceViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('trending');
  const [selectedRecord, setSelectedRecord] = useState<MonetizedRecord | null>(null);

  // Filter and sort records
  const filteredRecords = mockMonetizedRecords
    .filter(record => {
      const matchesSearch = record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           record.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || record.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesRarity = selectedRarity === 'all' || record.rarity === selectedRarity;
      return matchesSearch && matchesCategory && matchesRarity && record.isActive;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.currentPrice - b.currentPrice;
        case 'price-high': return b.currentPrice - a.currentPrice;
        case 'quality': return b.qualityScore - a.qualityScore;
        case 'recent': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'trending': return b.totalPurchases - a.totalPurchases;
        default: return 0;
      }
    });

  const categories = [...new Set(mockMonetizedRecords.map(r => r.category))];
  const rarities = ['common', 'uncommon', 'rare', 'very-rare'];

  const handlePurchase = (record: MonetizedRecord) => {
    onPurchase(record.id, record.currentPrice);
    // In a real app, this would trigger a payment flow
    console.log(`Purchasing record ${record.id} for $${record.currentPrice}`);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'uncommon': return 'bg-green-100 text-green-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'very-rare': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'genetic': return '🧬';
      case 'imaging': return '🔬';
      case 'lab': return '🧪';
      case 'mental-health': return '🧠';
      case 'prescription': return '💊';
      case 'visit': return '👩‍⚕️';
      case 'vital': return '❤️';
      case 'allergy': return '⚠️';
      default: return '📋';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Medical Data Marketplace</h2>
          <p className="text-muted-foreground">
            Discover and purchase anonymized medical records for research and clinical reference
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {filteredRecords.length} records available
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRarity} onValueChange={setSelectedRarity}>
              <SelectTrigger>
                <SelectValue placeholder="Rarity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rarities</SelectItem>
                {rarities.map(rarity => (
                  <SelectItem key={rarity} value={rarity}>
                    {rarity.charAt(0).toUpperCase() + rarity.slice(1).replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="quality">Highest Quality</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecords.map((record) => (
          <Card key={record.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getRecordTypeIcon(record.recordType)}</span>
                  <Badge className={getRarityColor(record.rarity)}>
                    {record.rarity.replace('-', ' ')}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-medical-primary">
                    ${record.currentPrice}
                  </div>
                  {record.demandMultiplier !== 1 && (
                    <div className="text-xs text-muted-foreground">
                      {record.demandMultiplier > 1 ? (
                        <span className="text-red-600">↑ High demand</span>
                      ) : (
                        <span className="text-green-600">↓ Low demand</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <CardTitle className="text-lg leading-tight">
                {record.title}
              </CardTitle>
              <CardDescription className="text-sm">
                {record.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Category:</span>
                <Badge variant="secondary">{record.category}</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span>{record.qualityScore.toFixed(1)}/10</span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart3 className="h-3 w-3 text-blue-500" />
                  <span>{record.dataCompleteness.toFixed(0)}% complete</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShoppingCart className="h-3 w-3 text-green-500" />
                  <span>{record.totalPurchases} sold</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-purple-500" />
                  <span>Anonymized</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {record.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {record.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{record.tags.length - 3} more
                  </Badge>
                )}
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setSelectedRecord(record)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handlePurchase(record)}
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Purchase
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No records found</h3>
            <p>Try adjusting your search criteria or filters</p>
          </div>
        </Card>
      )}

      {/* Record Preview Modal would go here */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{getRecordTypeIcon(selectedRecord.recordType)}</span>
                    {selectedRecord.title}
                  </CardTitle>
                  <CardDescription>{selectedRecord.description}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedRecord(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Record Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <Badge>{selectedRecord.recordType}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span>{selectedRecord.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rarity:</span>
                      <Badge className={getRarityColor(selectedRecord.rarity)}>
                        {selectedRecord.rarity.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Quality Score:</span>
                      <span>{selectedRecord.qualityScore.toFixed(1)}/10</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Market Data</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Current Price:</span>
                      <span className="font-bold">${selectedRecord.currentPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base Price:</span>
                      <span>${selectedRecord.basePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Sales:</span>
                      <span>{selectedRecord.totalPurchases}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Revenue Generated:</span>
                      <span>${selectedRecord.revenueGenerated.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    handlePurchase(selectedRecord);
                    setSelectedRecord(null);
                  }}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Purchase for ${selectedRecord.currentPrice}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
