// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MedicalRecordAccess
 * @dev Minimal HIPAA-compliant medical record access with security basics
 */
contract MedicalRecordAccess {
    
    // HIPAA Compliance Events
    event RecordAccess(
        address indexed provider,
        address indexed patient,
        bytes32 indexed recordId,
        uint256 timestamp,
        bytes32 purpose
    );
    
    event ConsentGiven(
        address indexed patient,
        address indexed provider,
        bytes32 indexed recordId,
        uint256 expiresAt
    );
    
    event ConsentRevoked(
        address indexed patient,
        address indexed provider,
        bytes32 indexed recordId
    );
    
    event ProviderStaked(address indexed provider, uint256 amount);
    event ViolationReported(address indexed provider, bytes32 reason, uint256 penalty);
    
    // Security state
    address public immutable owner;
    // TODO: Update staking amounts after mainnet beta testing
    // Current: 0.1 OG (~$0.10) - too low for production
    // Consider: 10-100 OG for meaningful provider commitment
    uint256 public constant MINIMUM_STAKE = 1e17; // 0.1 OG
    uint256 public constant ACCESS_FEE = 1e15; // 0.001 OG
    bool public paused;
    
    // Core mappings
    mapping(address => uint256) public providerStakes;
    mapping(bytes32 => address) public recordOwners; // recordId => patient
    mapping(bytes32 => uint256) public consents; // keccak256(patient,provider,recordId) => expiresAt
    mapping(bytes32 => bool) public accessLog; // keccak256(provider,recordId) => accessed
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }
    
    modifier onlyStakedProvider() {
        require(providerStakes[msg.sender] >= MINIMUM_STAKE, "Not staked");
        _;
    }
    
    modifier withValidConsent(address patient, bytes32 recordId) {
        bytes32 consentKey = keccak256(abi.encodePacked(patient, msg.sender, recordId));
        require(consents[consentKey] > block.timestamp, "No consent");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    receive() external payable {}
    
    /**
     * @dev Stake to become provider
     */
    function stakeAsProvider() external payable whenNotPaused {
        require(msg.value >= MINIMUM_STAKE, "Insufficient stake");
        require(providerStakes[msg.sender] == 0, "Already staked");
        
        providerStakes[msg.sender] = msg.value;
        emit ProviderStaked(msg.sender, msg.value);
    }
    
    /**
     * @dev Patient gives consent to provider
     */
    function giveConsent(
        address provider,
        bytes32 recordId,
        uint256 durationDays
    ) external whenNotPaused {
        require(recordOwners[recordId] == msg.sender, "Not owner");
        require(providerStakes[provider] >= MINIMUM_STAKE, "Provider not staked");
        require(durationDays <= 365, "Max 1 year");
        
        bytes32 consentKey = keccak256(abi.encodePacked(msg.sender, provider, recordId));
        uint256 expiresAt = block.timestamp + (durationDays * 1 days);
        consents[consentKey] = expiresAt;
        
        emit ConsentGiven(msg.sender, provider, recordId, expiresAt);
    }
    
    /**
     * @dev Patient revokes consent
     */
    function revokeConsent(address provider, bytes32 recordId) external {
        bytes32 consentKey = keccak256(abi.encodePacked(msg.sender, provider, recordId));
        require(consents[consentKey] > block.timestamp, "No active consent");
        
        consents[consentKey] = 0;
        emit ConsentRevoked(msg.sender, provider, recordId);
    }
    
    /**
     * @dev Provider accesses record with payment
     */
    function accessRecord(
        address patient,
        bytes32 recordId,
        bytes32 purpose
    ) external payable onlyStakedProvider withValidConsent(patient, recordId) whenNotPaused {
        require(msg.value >= ACCESS_FEE, "Insufficient fee");
        require(recordOwners[recordId] == patient, "Invalid patient");
        
        // Log access for HIPAA audit
        bytes32 accessKey = keccak256(abi.encodePacked(msg.sender, recordId));
        accessLog[accessKey] = true;
        
        emit RecordAccess(msg.sender, patient, recordId, block.timestamp, purpose);
        
        // Pay patient
        (bool success, ) = patient.call{value: ACCESS_FEE}("");
        require(success, "Payment failed");
    }
    
    /**
     * @dev Register medical record
     */
    function registerRecord(bytes32 recordId, address patient) external onlyOwner {
        recordOwners[recordId] = patient;
    }
    
    /**
     * @dev Penalize provider for violations
     */
    function penalizeProvider(
        address provider,
        uint256 penalty,
        bytes32 reason
    ) external onlyOwner {
        require(providerStakes[provider] >= penalty, "Insufficient stake");
        
        providerStakes[provider] -= penalty;
        
        (bool success, ) = owner.call{value: penalty}("");
        require(success, "Transfer failed");
        
        emit ViolationReported(provider, reason, penalty);
    }
    
    /**
     * @dev Emergency pause
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }
    
    /**
     * @dev Check if provider has accessed record
     */
    function hasAccessed(address provider, bytes32 recordId) external view returns (bool) {
        bytes32 accessKey = keccak256(abi.encodePacked(provider, recordId));
        return accessLog[accessKey];
    }
    
    /**
     * @dev Check consent status
     */
    function getConsentExpiry(
        address patient,
        address provider,
        bytes32 recordId
    ) external view returns (uint256) {
        bytes32 consentKey = keccak256(abi.encodePacked(patient, provider, recordId));
        return consents[consentKey];
    }
    
    /**
     * @dev Unstake and exit
     */
    function unstake() external {
        uint256 stake = providerStakes[msg.sender];
        require(stake > 0, "No stake");
        
        providerStakes[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: stake}("");
        require(success, "Transfer failed");
    }
}
