import { useWalletContext } from '@/providers/Web3Provider';

export const useWallet = () => {
  return useWalletContext();
};
