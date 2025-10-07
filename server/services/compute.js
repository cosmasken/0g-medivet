const { ethers } = require('ethers');
const { createZGComputeNetworkBroker } = require('@0glabs/0g-serving-broker');

// Official 0G providers
const OFFICIAL_PROVIDERS = {
  'llama-3.3-70b-instruct': '0xf07240Efa67755B5311bc75784a061eDB47165Dd',
  'deepseek-r1-70b': '0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3'
};

// Utility function to recursively replace BigInt values with strings
function replaceBigInt(obj) {
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map(item => replaceBigInt(item));
    } else {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = replaceBigInt(value);
      }
      return result;
    }
  }
  return obj;
}

/**
 * 0G Compute Service for medical AI inference
 */
class ComputeService {
  constructor() {
    this.broker = null;
    this.wallet = null;
    this.initialized = false;
    this.initPromise = null;
  }

  /**
   * Initialize the compute broker
   */
  async initialize() {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._doInitialize();
    return this.initPromise;
  }

  async _doInitialize() {
    try {
      const privateKey = process.env.ZG_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('ZG_PRIVATE_KEY is required in environment variables');
      }

      const provider = new ethers.JsonRpcProvider(
        process.env.ZG_RPC_ENDPOINT || 'https://evmrpc-testnet.0g.ai'
      );
      this.wallet = new ethers.Wallet(privateKey, provider);
      
      console.log('Initializing 0G Compute broker for wallet:', this.wallet.address);
      this.broker = await createZGComputeNetworkBroker(this.wallet);
      
      // Check and setup ledger
      await this.ensureLedgerFunded();
      
      this.initialized = true;
      console.log('0G Compute service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize compute service:', error);
      throw error;
    }
  }

  /**
   * Ensure ledger has sufficient funds
   */
  async ensureLedgerFunded() {
    try {
      const ledgerInfo = await this.broker.ledger.getLedger();
      const balance = parseFloat(ethers.formatEther(ledgerInfo.ledgerInfo[0]));
      console.log(`Current ledger balance: ${balance} OG`);
      
      if (balance < 0.001) {
        console.log('Low balance, adding minimal funds to ledger...');
        await this.broker.ledger.addLedger(0.001); // Minimal amount
        const newLedger = await this.broker.ledger.getLedger();
        console.log(`New balance: ${ethers.formatEther(newLedger.ledgerInfo[0])} OG`);
      }
    } catch (error) {
      if (error.message.includes('Account does not exist')) {
        console.log('Creating ledger account with minimal funds...');
        await this.broker.ledger.addLedger(0.001); // Very small initial amount
        console.log('Ledger account created with minimal funding');
      } else {
        console.warn('Ledger funding failed:', error.message);
        // Don't throw - let it try to work with existing funds
      }
    }
  }

  /**
   * Submit medical analysis job using official 0G implementation
   */
  async submitAnalysis(fileData, analysisType = 'medical-analysis') {
    await this.initialize();
    
    // Select provider based on analysis type
    const providerAddress = analysisType === 'enhanced-analysis' 
      ? OFFICIAL_PROVIDERS['deepseek-r1-70b']
      : OFFICIAL_PROVIDERS['llama-3.3-70b-instruct'];

    try {
      // Acknowledge provider (only needed first time)
      try {
        await this.broker.inference.acknowledgeProviderSigner(providerAddress);
      } catch (error) {
        if (!error.message.includes('already acknowledged')) {
          throw error;
        }
      }

      // Get service metadata
      const { endpoint, model } = await this.broker.inference.getServiceMetadata(providerAddress);
      
      // Prepare medical analysis prompt
      const medicalPrompt = this.createMedicalPrompt(fileData, analysisType);
      
      // Get authentication headers (single-use)
      const headers = await this.broker.inference.getRequestHeaders(providerAddress, medicalPrompt);
      
      // Make request to AI service
      const response = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: medicalPrompt }],
          model
        })
      });

      if (!response.ok) {
        throw new Error(`AI service request failed: ${response.statusText}`);
      }

      const result = await response.json();
      const analysis = result.choices[0].message.content;
      const chatId = result.id;

      // Process response and handle payment
      let isValid = false;
      try {
        isValid = await this.broker.inference.processResponse(
          providerAddress,
          analysis,
          chatId
        );
      } catch (paymentError) {
        console.warn('Payment processing failed:', paymentError.message);
        // Continue with unverified result
      }

      return {
        jobId: chatId,
        analysis,
        isValid,
        provider: providerAddress,
        model,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Analysis submission failed:', error);
      throw error;
    }
  }

  /**
   * Create medical analysis prompt
   */
  createMedicalPrompt(fileData, analysisType) {
    const basePrompt = `You are a medical AI assistant. Analyze the following medical data and provide insights:

Data: ${JSON.stringify(fileData, null, 2)}

Please provide:
1. Key observations from the data
2. Potential health insights
3. Recommendations for follow-up
4. Any notable patterns or concerns

Keep the analysis professional and note that this is for informational purposes only.`;

    if (analysisType === 'enhanced-analysis') {
      return basePrompt + `

Please provide an enhanced analysis with:
- Detailed clinical assessment
- Risk stratification
- Specific recommendations for healthcare providers
- Potential differential diagnoses if applicable`;
    }

    return basePrompt;
  }

  /**
   * Get account balance
   */
  async getBalance() {
    await this.initialize();
    try {
      const ledgerInfo = await this.broker.ledger.getLedger();
      return {
        total: ethers.formatEther(ledgerInfo.ledgerInfo[0]),
        locked: '0' // Simplified for now
      };
    } catch (error) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  /**
   * List available services
   */
  async listServices() {
    await this.initialize();
    try {
      const services = await this.broker.inference.listService();
      return services.map(service => {
        // Use utility function to recursively replace any BigInts with strings
        const processedService = replaceBigInt(service);
        
        return {
          ...processedService,
          inputPriceFormatted: ethers.formatEther(service.inputPrice || 0),
          outputPriceFormatted: ethers.formatEther(service.outputPrice || 0),
          isOfficial: Object.values(OFFICIAL_PROVIDERS).includes(service.provider),
          modelName: Object.entries(OFFICIAL_PROVIDERS).find(([_, addr]) => addr === service.provider)?.[0] || 'Unknown'
        };
      });
    } catch (error) {
      throw new Error(`Failed to list services: ${error.message}`);
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      await this.initialize();
      const balance = await this.getBalance();
      
      return {
        status: 'healthy',
        balance: balance.total,
        wallet: this.wallet?.address,
        providers: Object.keys(OFFICIAL_PROVIDERS)
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

module.exports = new ComputeService();
