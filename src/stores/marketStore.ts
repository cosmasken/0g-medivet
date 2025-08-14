import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Bid, MarketplaceListing } from '@/types';

interface MarketState {
  bids: Bid[];
  listings: MarketplaceListing[];
  placeBid: (recordId: number, provider: string, amount: number) => void;
  acceptBid: (bidId: number) => void;
  rejectBid: (bidId: number) => void;
  createListing: (listing: Omit<MarketplaceListing, 'id' | 'listedAt' | 'bidCount' | 'currentHighestBid'>) => void;
  getBidsForRecord: (recordId: number) => Bid[];
  getBidsForProvider: (provider: string) => Bid[];
}

// Seed data
const seedListings: MarketplaceListing[] = [
  {
    id: 1,
    recordId: 1,
    patient: 'rdmx6-jaaaa-aaaah-qcaiq-cai',
    title: 'Comprehensive Annual Physical - 29F',
    category: 'General Health',
    description: 'Complete annual physical exam data including vitals, lab work, and assessment notes. Anonymized patient data for research purposes.',
    minimumBid: 50,
    currentHighestBid: 75,
    bidCount: 3,
    listedAt: Date.now() - 86400000 * 2, // 2 days ago
    expiresAt: Date.now() + 86400000 * 5, // 5 days from now
    status: 'active'
  },
  {
    id: 2,
    recordId: 2,
    patient: 'rdmx6-jaaaa-aaaah-qcaiq-cai',
    title: 'Diabetes Management Data - 6 Month Study',
    category: 'Diabetes Care',
    description: 'Longitudinal glucose monitoring data with medication adjustments and lifestyle interventions. Valuable for diabetes research.',
    minimumBid: 100,
    currentHighestBid: 150,
    bidCount: 2,
    listedAt: Date.now() - 86400000 * 1, // 1 day ago
    expiresAt: Date.now() + 86400000 * 6, // 6 days from now
    status: 'active'
  },
  {
    id: 3,
    recordId: 4,
    patient: 'rdmx6-jaaaa-aaaah-qcaiq-cai',
    title: 'Comprehensive Lipid Panel - Pre/Post Treatment',
    category: 'Laboratory',
    description: 'Complete lipid panel results showing treatment efficacy over 3-month period. Great for cardiovascular research.',
    minimumBid: 25,
    bidCount: 0,
    listedAt: Date.now() - 86400000 * 0.5, // 12 hours ago
    expiresAt: Date.now() + 86400000 * 7, // 7 days from now
    status: 'active'
  }
];

const seedBids: Bid[] = [
  {
    id: 1,
    recordId: 1,
    provider: 'rrkah-fqaaa-aaaah-qcaiq-cai',
    amount: 75,
    placedAt: Date.now() - 86400000 * 1, // 1 day ago
    status: 'pending'
  },
  {
    id: 2,
    recordId: 1,
    provider: 'rjqhf-xiaaa-aaaah-qcaiq-cai',
    amount: 60,
    placedAt: Date.now() - 86400000 * 1.5, // 1.5 days ago
    status: 'pending'
  },
  {
    id: 3,
    recordId: 2,
    provider: 'rjqhf-xiaaa-aaaah-qcaiq-cai',
    amount: 150,
    placedAt: Date.now() - 86400000 * 0.5, // 12 hours ago
    status: 'pending'
  },
  {
    id: 4,
    recordId: 2,
    provider: 'rrkah-fqaaa-aaaah-qcaiq-cai',
    amount: 120,
    placedAt: Date.now() - 86400000 * 0.8, // ~19 hours ago
    status: 'pending'
  }
];

export const useMarketStore = create<MarketState>()(
  persist(
    (set, get) => ({
      bids: seedBids,
      listings: seedListings,

      placeBid: (recordId, provider, amount) => {
        const newBid: Bid = {
          id: Math.max(...get().bids.map(b => b.id), 0) + 1,
          recordId,
          provider,
          amount,
          placedAt: Date.now(),
          status: 'pending'
        };

        set(state => ({
          bids: [...state.bids, newBid],
          listings: state.listings.map(listing => 
            listing.recordId === recordId
              ? {
                  ...listing,
                  bidCount: listing.bidCount + 1,
                  currentHighestBid: Math.max(listing.currentHighestBid || 0, amount)
                }
              : listing
          )
        }));
      },

      acceptBid: (bidId) => {
        set(state => ({
          bids: state.bids.map(bid =>
            bid.id === bidId ? { ...bid, status: 'accepted' as const } : bid
          ),
          listings: state.listings.map(listing => {
            const acceptedBid = state.bids.find(b => b.id === bidId);
            return acceptedBid && listing.recordId === acceptedBid.recordId
              ? { ...listing, status: 'sold' as const }
              : listing;
          })
        }));
      },

      rejectBid: (bidId) => {
        set(state => ({
          bids: state.bids.map(bid =>
            bid.id === bidId ? { ...bid, status: 'rejected' as const } : bid
          )
        }));
      },

      createListing: (listingData) => {
        const newListing: MarketplaceListing = {
          ...listingData,
          id: Math.max(...get().listings.map(l => l.id), 0) + 1,
          listedAt: Date.now(),
          bidCount: 0,
          status: 'active'
        };

        set(state => ({
          listings: [...state.listings, newListing]
        }));
      },

      getBidsForRecord: (recordId) => {
        return get().bids.filter(bid => bid.recordId === recordId);
      },

      getBidsForProvider: (provider) => {
        return get().bids.filter(bid => bid.provider === provider);
      }
    }),
    {
      name: 'medivet-market'
    }
  )
);