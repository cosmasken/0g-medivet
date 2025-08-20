# AI Medical Analysis Integration

This document describes the AI-powered medical analysis features integrated into Medivet using the 0G Compute Network.

## Overview

The AI integration provides three main capabilities:
1. **Medical File Analysis** - Analyze uploaded medical documents, lab results, and images
2. **Patient Health Insights** - Generate comprehensive health insights from patient data
3. **Treatment Recommendations** - Get AI-powered treatment suggestions based on diagnosis

## Architecture

### Core Components

- **Medical AI Service** (`src/lib/ai/medicalAI.ts`) - Core service that interfaces with 0G Compute Network
- **Medical AI Hook** (`src/hooks/useMedicalAI.ts`) - React hook for AI functionality
- **AI Insights Component** (`src/components/medical/MedicalAIInsights.tsx`) - UI for displaying analysis results
- **AI Analysis Platform** (`src/components/medical/MedicalAIAnalysis.tsx`) - Complete analysis interface

### 0G Compute Network Integration

The system uses two official 0G AI providers:
- **LLaMA 3.3 70B Instruct** (`0xf07240Efa67755B5311bc75784a061eDB47165Dd`) - General medical analysis
- **DeepSeek R1 70B** (`0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3`) - Advanced reasoning for health insights

## Setup

### 1. Environment Configuration

Copy `.env.example` to `.env.local` and configure:

```bash
# Required: Private key for AI analysis (without 0x prefix)
NEXT_PUBLIC_AI_PRIVATE_KEY=your_private_key_here

# For non-Next.js projects:
REACT_APP_AI_PRIVATE_KEY=your_private_key_here
```

### 2. Get Testnet ETH

1. Visit the [0G Testnet Faucet](https://faucet.0g.ai)
2. Enter your wallet address
3. Request testnet ETH for AI analysis costs

### 3. Account Setup

The AI service automatically:
- Creates a ledger account on first use
- Funds it with 0.1 ETH for analysis costs
- Acknowledges AI providers for service access

## Usage

### File Analysis

```typescript
import { useMedicalAI } from '@/hooks/useMedicalAI';

const { analyzeFile, isLoading, insights } = useMedicalAI();

// Analyze a medical file
const result = await analyzeFile(
  fileContent,
  'lab-results.pdf',
  'application/pdf',
  'Patient: Age 45, Male'
);
```

### Patient Health Insights

```typescript
const { generateHealthInsights } = useMedicalAI();

const patientData = {
  age: 45,
  gender: 'Male',
  medicalHistory: ['Hypertension', 'Diabetes'],
  currentSymptoms: ['Chest pain', 'Shortness of breath'],
  medications: ['Metformin', 'Lisinopril'],
  allergies: ['Penicillin']
};

const insights = await generateHealthInsights(patientData);
```

### Treatment Recommendations

```typescript
const { getTreatmentRecommendations } = useMedicalAI();

const recommendations = await getTreatmentRecommendations(
  'Type 2 Diabetes with complications',
  'Male, 45 years old, overweight, sedentary lifestyle',
  ['Metformin 500mg twice daily']
);
```

## Features

### Analysis Types

1. **Risk Assessment** - Identifies potential health risks
2. **Diagnostic Insights** - Provides diagnostic suggestions
3. **Treatment Suggestions** - Recommends treatment approaches
4. **Preventive Care** - Suggests preventive measures
5. **Summary** - Overall analysis summary

### Insight Structure

Each AI insight includes:
- **Type** - Category of insight
- **Title** - Brief description
- **Content** - Detailed analysis
- **Confidence** - AI confidence level (0-1)
- **Source** - Analysis source
- **Timestamp** - Creation time

### Cost Management

- **Automatic Payment** - Micropayments processed automatically
- **Balance Monitoring** - Track AI usage costs
- **Funding Management** - Easy balance top-up
- **Cost Display** - Shows analysis costs in real-time

## Security & Privacy

### Data Handling
- Medical data is processed securely through 0G's TEE (Trusted Execution Environment)
- No patient data is stored permanently
- All AI queries are processed in isolated environments

### Private Key Security
- Private keys are used only for AI service authentication
- Never store private keys in version control
- Use environment variables for configuration
- Consider using separate wallets for AI features

### Compliance Notes
- AI insights are for educational purposes only
- Always include medical disclaimers
- Recommend consulting healthcare professionals
- Be conservative in risk assessments

## Error Handling

Common error scenarios and solutions:

### Initialization Errors
```
"AI_PRIVATE_KEY environment variable is required"
```
- Ensure environment variable is set correctly
- Check variable name (NEXT_PUBLIC_AI_PRIVATE_KEY or REACT_APP_AI_PRIVATE_KEY)

### Insufficient Balance
```
"Insufficient balance. Please add funds"
```
- Add more testnet ETH to your wallet
- Use the balance management UI to top up

### Provider Errors
```
"Provider not responding"
```
- Try using a different AI provider
- Check 0G network status
- Wait and retry later

## Development

### Adding New Analysis Types

1. Extend the `MedicalInsight['type']` union type
2. Update insight icon and color mappings
3. Add new prompt building methods
4. Update UI components for new types

### Custom AI Providers

To use additional AI providers:

1. Add provider address to `MEDICAL_AI_PROVIDERS`
2. Acknowledge the provider: `await acknowledgeProvider(address)`
3. Update service selection logic

### Testing

```bash
# Test AI service initialization
npm run test src/lib/ai/medicalAI.test.ts

# Test React hooks
npm run test src/hooks/useMedicalAI.test.ts

# E2E testing with test files
npm run test:e2e
```

## Performance

### Optimization Tips

1. **Batch Analysis** - Analyze multiple files together when possible
2. **Caching** - Cache analysis results for repeated queries
3. **Selective Analysis** - Only analyze files that need AI insights
4. **Provider Selection** - Choose appropriate AI models for different tasks

### Monitoring

- Track analysis response times
- Monitor AI usage costs
- Log analysis success/failure rates
- Alert on provider downtime

## Contributing

When contributing AI features:

1. Follow medical data privacy guidelines
2. Add comprehensive error handling
3. Include medical disclaimers
4. Test with sample medical data
5. Document new analysis capabilities

## Resources

- [0G Compute Network Documentation](https://docs.0g.ai/build-with-0g/compute-network)
- [0G Testnet Faucet](https://faucet.0g.ai)
- [Medical AI Best Practices](https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-and-machine-learning-aiml-enabled-medical-devices)
- [HIPAA Compliance Guidelines](https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html)
