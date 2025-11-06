# MedicalRecordAccess Smart Contract

HIPAA-compliant smart contract for managing medical record access permissions on 0G Network.

## Contract Overview

The `MedicalRecordAccess` contract provides a decentralized, auditable system for managing healthcare provider access to patient medical records stored on 0G Storage.

## Features

- **HIPAA Compliance**: Full audit trail of all record access
- **Patient Control**: Patients grant/revoke provider access
- **Time-based Permissions**: Access can expire automatically
- **Emergency Access**: Healthcare providers can request emergency access
- **Audit Trail**: Immutable log of all access events

## Contract Functions

### Patient Functions

```solidity
// Grant access to a healthcare provider
function grantAccess(address provider, bytes32 recordId, uint256 duration, bytes32 purpose)

// Revoke provider access
function revokeAccess(address provider, bytes32 recordId)

// Check if provider has access
function hasAccess(address provider, bytes32 recordId) returns (bool)
```

### Provider Functions

```solidity
// Access a medical record (logs access event)
function accessRecord(address patient, bytes32 recordId, bytes32 purpose)

// Request emergency access
function requestEmergencyAccess(address patient, bytes32 recordId, bytes32 justification)
```

### Admin Functions

```solidity
// Add verified healthcare provider
function addProvider(address provider, bytes32 licenseHash)

// Remove provider
function removeProvider(address provider)
```

## Events

```solidity
event RecordAccess(address indexed provider, address indexed patient, bytes32 indexed recordId, uint256 timestamp, bytes32 purpose);
event ConsentGiven(address indexed patient, address indexed provider, bytes32 indexed recordId, uint256 expiresAt);
event ConsentRevoked(address indexed patient, address indexed provider, bytes32 indexed recordId);
event EmergencyAccess(address indexed provider, address indexed patient, bytes32 indexed recordId, bytes32 justification);
```

## Deployed Contracts

### 0G Mainnet
- **Address**: `0xA6347e1dCb5f4C80FF2022850106Eb5C7bF07f57`
- **Network**: 0G Mainnet (Chain ID: 16661)
- **Explorer**: [View Contract](https://chainscan.0g.ai/address/0xA6347e1dCb5f4C80FF2022850106Eb5C7bF07f57)



## Usage Example

```javascript
import { ethers } from 'ethers';

// Connect to 0G Network
const provider = new ethers.JsonRpcProvider('https://evmrpc.0g.ai');
const contract = new ethers.Contract(contractAddress, abi, signer);

// Patient grants access to provider
await contract.grantAccess(
  providerAddress,
  recordId,
  86400, // 24 hours
  ethers.utils.formatBytes32String("routine_checkup")
);

// Provider accesses record
await contract.accessRecord(
  patientAddress,
  recordId,
  ethers.utils.formatBytes32String("treatment_review")
);
```

## Integration with 0G Storage

The contract works with 0G Storage by:

1. **Record IDs**: Using 0G Storage root hashes as `recordId`
2. **Access Control**: Verifying permissions before allowing downloads
3. **Audit Trail**: Logging all access attempts on-chain
4. **Payment Integration**: Supporting 0G Payment Network for access fees

## HIPAA Compliance Features

- **Minimum Necessary**: Access limited to specific records
- **Audit Logs**: Complete trail of who accessed what and when
- **Patient Rights**: Full control over access permissions
- **Data Integrity**: Immutable permission records
- **Access Expiration**: Time-limited access grants

## Security Considerations

- **Access Verification**: Always check `hasAccess()` before record retrieval
- **Emergency Protocols**: Emergency access is logged and auditable
- **Provider Verification**: Only verified healthcare providers can be added
- **Permission Expiry**: Access automatically expires after set duration

## Development

### Compile Contract
```bash
solc --optimize --abi --bin MedicalRecordAccess.sol
```

### Deploy to 0G Network
```bash
# Using Hardhat
npx hardhat run scripts/deploy.js --network 0g-mainnet
```

### Verify Contract
```bash
npx hardhat verify --network 0g-mainnet <CONTRACT_ADDRESS>
```

## License

MIT License - See contract header for full license text.
