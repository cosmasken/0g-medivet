const { ethers } = require('hardhat');

async function main() {
  console.log('Deploying MediVet contracts to 0G Galileo testnet...');

  // Deploy MedicalRecordAccess contract
  const MedicalRecordAccess = await ethers.getContractFactory('MedicalRecordAccess');
  const medicalRecordAccess = await MedicalRecordAccess.deploy();
  await medicalRecordAccess.waitForDeployment();

  const address = await medicalRecordAccess.getAddress();
  console.log('MedicalRecordAccess deployed to:', address);

  // Save deployment addresses
  const deploymentInfo = {
    network: 'galileo-testnet',
    contracts: {
      MedicalRecordAccess: address
    },
    timestamp: new Date().toISOString()
  };

  console.log('Deployment completed:', deploymentInfo);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
