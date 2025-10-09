// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MedicalRecordAccess
 * @dev Smart contract for automatic payments when providers access patient records
 */
contract MedicalRecordAccess {
    
    event RecordAccessPayment(
        address indexed provider,
        address indexed patient,
        bytes32 indexed recordId,
        uint256 amount,
        uint256 timestamp
    );
    
    event AccessRateUpdated(uint256 newRate);
    
    address public owner;
    uint256 public accessRate = 0.001 ether; // Default: 0.001 OG per access
    
    mapping(address => bool) public authorizedProviders;
    mapping(bytes32 => address) public recordOwners;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAuthorizedProvider() {
        require(authorizedProviders[msg.sender], "Provider not authorized");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Authorize a healthcare provider
     */
    function authorizeProvider(address provider) external onlyOwner {
        authorizedProviders[provider] = true;
    }
    
    /**
     * @dev Register a medical record with its owner
     */
    function registerRecord(bytes32 recordId, address patient) external onlyOwner {
        recordOwners[recordId] = patient;
    }
    
    /**
     * @dev Pay for record access and transfer to patient
     */
    function payForRecordAccess(
        address patient,
        bytes32 recordId
    ) external payable onlyAuthorizedProvider returns (bool) {
        require(msg.value >= accessRate, "Insufficient payment");
        require(recordOwners[recordId] == patient, "Invalid record owner");
        
        // Transfer payment to patient
        (bool success, ) = patient.call{value: accessRate}("");
        require(success, "Payment transfer failed");
        
        emit RecordAccessPayment(
            msg.sender,
            patient,
            recordId,
            accessRate,
            block.timestamp
        );
        
        return true;
    }
    
    /**
     * @dev Update access rate (only owner)
     */
    function updateAccessRate(uint256 newRate) external onlyOwner {
        accessRate = newRate;
        emit AccessRateUpdated(newRate);
    }
    
    /**
     * @dev Get current access rate
     */
    function getAccessRate() external view returns (uint256) {
        return accessRate;
    }
}
