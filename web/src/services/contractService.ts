import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '0xA6347e1dCb5f4C80FF2022850106Eb5C7bF07f57';
const CONTRACT_ABI = [
  "function stakeAsProvider() external payable",
  "function giveConsent(address provider, bytes32 recordId, uint256 durationDays) external",
  "function revokeConsent(address provider, bytes32 recordId) external",
  "function accessRecord(address patient, bytes32 recordId, bytes32 purpose) external payable",
  "function unstake() external",
  "function providerStakes(address provider) external view returns (uint256)",
  "function getConsentExpiry(address patient, address provider, bytes32 recordId) external view returns (uint256)",
  "function hasAccessed(address provider, bytes32 recordId) external view returns (bool)",
  "function MINIMUM_STAKE() external view returns (uint256)",
  "function ACCESS_FEE() external view returns (uint256)"
];

export class ContractService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;

  async initialize() {
    if (typeof window.ethereum !== 'undefined') {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await this.provider.getSigner();
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }
  }

  async stakeAsProvider(amount: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.stakeAsProvider({ value: ethers.parseEther(amount) });
    return tx.wait();
  }

  async giveConsent(providerAddress: string, recordId: string, durationDays: number) {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.giveConsent(providerAddress, recordId, durationDays);
    return tx.wait();
  }

  async revokeConsent(providerAddress: string, recordId: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.revokeConsent(providerAddress, recordId);
    return tx.wait();
  }

  async accessRecord(patientAddress: string, recordId: string, purpose: string, fee: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    const purposeHash = ethers.keccak256(ethers.toUtf8Bytes(purpose));
    const tx = await this.contract.accessRecord(patientAddress, recordId, purposeHash, { 
      value: ethers.parseEther(fee) 
    });
    return tx.wait();
  }

  async getProviderStake(address: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    const stake = await this.contract.providerStakes(address);
    return ethers.formatEther(stake);
  }

  async getMinimumStake(): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    const minStake = await this.contract.MINIMUM_STAKE();
    return ethers.formatEther(minStake);
  }

  async getAccessFee(): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    const fee = await this.contract.ACCESS_FEE();
    return ethers.formatEther(fee);
  }
}

export const contractService = new ContractService();
