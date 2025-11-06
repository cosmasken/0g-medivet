# 🏥 MediVet - Decentralized Medical Data Platform

**Secure medical data management powered by 0G Storage and blockchain technology**

[![0G Storage](https://img.shields.io/badge/Storage-0G_Network-blue)](https://0g.ai/)
[![React](https://img.shields.io/badge/Frontend-React-61dafb)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178c6)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38b2ac)](https://tailwindcss.com/)

## 🌟 Overview

MediVet is a revolutionary decentralized platform that enables secure medical data storage, sharing, and monetization using 0G Storage's cutting-edge blockchain infrastructure. Built for patients, healthcare providers, and researchers, MediVet ensures data privacy, ownership, and accessibility while creating new opportunities for medical data collaboration.

## ✨ Key Features

### 🔐 **Secure Data Storage**
- **Decentralized Storage**: Medical files stored on 0G Storage network
- **End-to-end Encryption**: Patient data protected with advanced cryptography
- **Ownership Control**: Patients retain full control over their medical data
- **HIPAA Compliance**: Built with healthcare privacy regulations in mind

### 📊 **Smart Data Management**
- **Multi-format Support**: Upload PDFs, images, lab results, and text records
- **Intelligent Categorization**: Automatic organization by medical specialty
- **Search & Filter**: Quick access to specific medical records
- **Version Control**: Track changes and updates to medical files

### 🤝 **Provider Collaboration**
- **Selective Sharing**: Grant access to specific healthcare providers
- **Real-time Updates**: Providers see the latest patient information
- **Audit Trail**: Complete visibility into data access and modifications
- **Integration Ready**: API for existing healthcare systems

### 💰 **Data Monetization**
- **Medical Marketplace**: Trade anonymized medical data for research
- **Patient Compensation**: Earn from contributing to medical research
- **Smart Contracts**: Automated, transparent compensation system
- **Research Acceleration**: Help advance medical science

### 🤖 **AI-Powered Insights**
- **Health Analytics**: AI-driven insights from your medical data
- **Trend Analysis**: Identify patterns in your health journey
- **Predictive Health**: Early warning systems for potential issues

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- MetaMask or compatible Web3 wallet
- Access to 0G Network (mainnet)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/medivet.git

# Navigate to project directory
cd medivet

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

Create a `.env.local` file with your configuration:

```env
# 0G Storage Configuration
VITE_0G_STORAGE_RPC=https://your-0g-storage-rpc
VITE_0G_L1_RPC=https://your-l1-rpc
VITE_FLOW_CONTRACT_ADDRESS=0x...

# Network Configuration
VITE_NETWORK_TYPE=standard # or 'turbo'
VITE_CHAIN_ID=1337

# Application Settings
VITE_APP_NAME=MediVet
VITE_ENABLE_AI_FEATURES=true
```

### First Steps

1. **Connect Wallet**: Use MetaMask to connect to the application
2. **Create Profile**: Set up your patient or provider profile
3. **Upload Data**: Start with uploading a sample medical record
4. **Explore Features**: Try the download, marketplace features

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for responsive styling
- shadcn/ui for modern component library
- Zustand for state management

**Blockchain & Storage:**
- 0G Storage for decentralized file storage
- 0G Network blockchain for metadata and transactions
- Web3 integration with ethers.js
- Smart contracts for data access control


### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── medical/        # Medical-specific components
│   ├── patient/        # Patient dashboard components
│   ├── provider/       # Healthcare provider components
│   └── ui/             # Base UI components (shadcn)
├── hooks/              # Custom React hooks
│   ├── useUpload.ts    # 0G Storage upload functionality
│   ├── useDownload.ts  # File download from 0G
│   └── useMedicalAI.ts # AI-powered medical insights
├── lib/                # Utility libraries
│   ├── 0g/             # 0G Storage integration
│   └── utils/          # General utility functions
├── stores/             # Zustand state stores
├── types/              # TypeScript type definitions
└── pages/              # Application pages/routes
```

## 📱 Usage Guide

### For Patients

1. **Upload Medical Records**
   ```bash
   # Navigate to Dashboard > Upload to 0G
   # Drag & drop files or click to select
   # Add metadata and category information
   # Confirm transaction in MetaMask
   ```

2. **Manage Your Data**
   - View all uploaded files in the "My Files" tab
   - Download files using root hash in "Download" tab
   - Share files selectively with healthcare providers
   - Monitor data access and sharing permissions

3. **Monetize Your Data**
   - Create listings in the "Marketplace" tab
   - Set pricing for anonymized medical data
   - Earn ETH from research contributions
   - Track earnings in your dashboard

### For Healthcare Providers

1. **Access Patient Data**
   - Receive shared access from patients
   - View comprehensive medical histories
   - Download files for analysis
   - Add new records and observations

2. **Collaborate Securely**
   - Real-time updates on patient files
   - Secure messaging with patients
   - Integration with existing EHR systems
   - Audit trail for compliance

### For Researchers

1. **Discover Medical Data**
   - Browse anonymized datasets in marketplace
   - Filter by medical specialty and data type
   - Purchase datasets with smart contracts
   - Download data for research projects

## 🔧 Configuration

### Network Settings

Configure your 0G Storage network connection:

```typescript
// src/lib/0g/network.ts
export const networkConfigs = {
  standard: {
    name: 'Standard Network',
    storageRpc: 'https://rpc-storage.0g.ai',
    l1Rpc: 'https://rpc.0g.ai',
    flowContract: '0x...'
  },
  turbo: {
    name: 'Turbo Network',
    storageRpc: 'https://rpc-storage-turbo.0g.ai',
    l1Rpc: 'https://rpc-turbo.0g.ai',
    flowContract: '0x...'
  }
};
```


## 🧪 Testing

### Running Tests

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

### Test Data

Use the provided sample medical records for testing:

```bash
# Load sample data
npm run load-sample-data

# Upload test files
npm run upload-test-files
```

## 🗺️ Roadmap

### Version 1.0 (Current)
- ✅ Basic file upload/download to 0G Storage
- ✅ Patient dashboard with file management
- ✅ Simple marketplace for medical data
- ✅ Provider collaboration features

### Version 1.1 (Next)
- 🔄 Smart contract automation
- 🔄 Mobile app development
- 🔄 Integration with major EHR systems
- 🔄 Advanced privacy controls

### Version 2.0 (Future)
- 📋 Real-time collaboration tools
- 📋 Blockchain-based medical credentials
- 📋 Decentralized research networks
- 📋 Global health data standards
- 📋 Regulatory compliance automation

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Setup

```bash
# Fork the repository
git clone https://github.com/your-username/medivet.git

# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes
# ...

# Commit your changes
git commit -m 'feat: add amazing feature'

# Push to the branch
git push origin feature/amazing-feature

# Open a Pull Request
```

### Contribution Guidelines

- Follow the existing code style and conventions
- Write tests for new features
- Update documentation for API changes
- Ensure all tests pass before submitting PR
- Use conventional commit messages

### Areas for Contribution

- 🔐 **Security**: Enhance encryption and privacy features
- 🌐 **Integration**: Connect with healthcare systems
- 📱 **Mobile**: React Native mobile application
- 📚 **Documentation**: Improve guides and tutorials

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **0G Labs** for providing cutting-edge decentralized storage
- **AKindo** for support from idea to mainnet
---
