import { ethers } from "ethers";
import { createZGComputeNetworkBroker, ZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import OpenAI from "openai";

// Official 0G providers
export const MEDICAL_AI_PROVIDERS = {
  "llama-3.3-70b-instruct": "0xf07240Efa67755B5311bc75784a061eDB47165Dd",
  "deepseek-r1-70b": "0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3"
};

export interface MedicalInsight {
  type: 'risk_assessment' | 'treatment_suggestion' | 'diagnostic_insight' | 'preventive_care' | 'summary';
  title: string;
  content: string;
  confidence: number;
  source: string;
  timestamp: Date;
}

export interface MedicalAnalysisResult {
  insights: MedicalInsight[];
  summary: string;
  riskFactors: string[];
  recommendations: string[];
  cost: string;
  processingTime: number;
}

class MedicalAIService {
  private wallet: ethers.Wallet | null = null;
  private broker: ZGComputeNetworkBroker | null = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Initialize on first use to avoid requiring wallet connection immediately
  }

  /**
   * Initialize the service with a wallet
   */
  public async initialize(privateKey: string): Promise<void> {
    if (this.initialized) return;
    
    if (!this.initPromise) {
      this.initPromise = this.doInitialize(privateKey);
    }
    
    await this.initPromise;
  }

  private async doInitialize(privateKey: string): Promise<void> {
    try {
      const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
      this.wallet = new ethers.Wallet(privateKey, provider);
      this.broker = await createZGComputeNetworkBroker(this.wallet);
      this.initialized = true;
      console.log("Medical AI service initialized with wallet:", this.wallet.address);
    } catch (error: any) {
      console.error("Failed to initialize Medical AI service:", error.message);
      throw error;
    }
  }

  /**
   * Ensure the service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized || !this.broker || !this.wallet) {
      throw new Error("Medical AI service not initialized. Call initialize() first.");
    }
  }

  /**
   * Set up the ledger account if needed
   */
  public async setupAccount(initialFunding: number = 0.1): Promise<void> {
    await this.ensureInitialized();
    
    try {
      // Check if ledger exists
      await this.broker!.ledger.getLedger();
      console.log("Ledger account already exists");
    } catch (error) {
      console.log("Creating new ledger account with funding:", initialFunding);
      await this.broker!.ledger.addLedger(initialFunding);
    }
  }

  /**
   * Acknowledge a provider (required once per provider)
   */
  public async acknowledgeProvider(providerAddress: string): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await this.broker!.inference.acknowledgeProviderSigner(providerAddress);
      console.log(`Provider ${providerAddress} acknowledged`);
    } catch (error: any) {
      if (error.message.includes('already acknowledged')) {
        console.log("Provider already acknowledged");
      } else {
        throw error;
      }
    }
  }

  /**
   * Analyze medical file content and provide insights
   */
  public async analyzeMedicalFile(
    fileContent: string,
    fileName: string,
    fileType: string,
    patientContext?: string
  ): Promise<MedicalAnalysisResult> {
    await this.ensureInitialized();
    
    const startTime = Date.now();
    const providerAddress = MEDICAL_AI_PROVIDERS["llama-3.3-70b-instruct"];
    
    // Ensure provider is acknowledged
    await this.acknowledgeProvider(providerAddress);
    
    const prompt = this.buildMedicalAnalysisPrompt(fileContent, fileName, fileType, patientContext);
    
    try {
      const response = await this.sendQuery(providerAddress, prompt);
      const processingTime = Date.now() - startTime;
      
      return this.parseMedicalAnalysisResponse(response.content, processingTime, response.metadata?.cost || "0.001");
    } catch (error: any) {
      throw new Error(`Medical analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate health insights from patient data patterns
   */
  public async generateHealthInsights(
    patientData: {
      age?: number;
      gender?: string;
      medicalHistory?: string[];
      currentSymptoms?: string[];
      medications?: string[];
      allergies?: string[];
      vitalSigns?: Record<string, any>;
    }
  ): Promise<MedicalAnalysisResult> {
    await this.ensureInitialized();
    
    const startTime = Date.now();
    const providerAddress = MEDICAL_AI_PROVIDERS["deepseek-r1-70b"]; // Use reasoning model for insights
    
    await this.acknowledgeProvider(providerAddress);
    
    const prompt = this.buildHealthInsightsPrompt(patientData);
    
    try {
      const response = await this.sendQuery(providerAddress, prompt);
      const processingTime = Date.now() - startTime;
      
      return this.parseMedicalAnalysisResponse(response.content, processingTime, response.metadata?.cost || "0.001");
    } catch (error: any) {
      throw new Error(`Health insights generation failed: ${error.message}`);
    }
  }

  /**
   * Provide treatment recommendations based on diagnosis
   */
  public async getTreatmentRecommendations(
    diagnosis: string,
    patientProfile: string,
    currentTreatments?: string[]
  ): Promise<MedicalAnalysisResult> {
    await this.ensureInitialized();
    
    const startTime = Date.now();
    const providerAddress = MEDICAL_AI_PROVIDERS["llama-3.3-70b-instruct"];
    
    await this.acknowledgeProvider(providerAddress);
    
    const prompt = this.buildTreatmentRecommendationPrompt(diagnosis, patientProfile, currentTreatments);
    
    try {
      const response = await this.sendQuery(providerAddress, prompt);
      const processingTime = Date.now() - startTime;
      
      return this.parseMedicalAnalysisResponse(response.content, processingTime, response.metadata?.cost || "0.001");
    } catch (error: any) {
      throw new Error(`Treatment recommendation failed: ${error.message}`);
    }
  }

  /**
   * Send a query to the AI service
   */
  private async sendQuery(providerAddress: string, query: string): Promise<any> {
    await this.ensureInitialized();
    
    try {
      // Get service metadata
      const { endpoint, model } = await this.broker!.inference.getServiceMetadata(providerAddress);
      
      // Get authentication headers
      const headers = await this.broker!.inference.getRequestHeaders(providerAddress, query);
      
      // Create OpenAI client
      const openai = new OpenAI({
        baseURL: endpoint,
        apiKey: "",
      });
      
      // Prepare headers
      const requestHeaders: Record<string, string> = {};
      Object.entries(headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          requestHeaders[key] = value;
        }
      });
      
      // Send query
      const completion = await openai.chat.completions.create(
        {
          messages: [{ role: "user", content: query }],
          model,
        },
        {
          headers: requestHeaders,
        }
      );
      
      const content = completion.choices[0].message.content;
      const chatId = completion.id;
      
      // Process response and handle payment
      try {
        const isValid = await this.broker!.inference.processResponse(
          providerAddress,
          content || "",
          chatId
        );
        
        return {
          content,
          metadata: {
            model,
            isValid,
            provider: providerAddress,
            chatId,
          }
        };
      } catch (paymentError: any) {
        console.warn("Payment processing failed:", paymentError.message);
        return {
          content,
          metadata: {
            model,
            provider: providerAddress,
            paymentError: paymentError.message,
          }
        };
      }
    } catch (error: any) {
      throw new Error(`Query failed: ${error.message}`);
    }
  }

  /**
   * Build medical analysis prompt
   */
  private buildMedicalAnalysisPrompt(
    content: string, 
    fileName: string, 
    fileType: string, 
    patientContext?: string
  ): string {
    return `You are a medical AI assistant analyzing a medical file. Please provide insights in a structured format.

File Information:
- Name: ${fileName}
- Type: ${fileType}
${patientContext ? `- Patient Context: ${patientContext}` : ''}

File Content:
${content}

Please analyze this medical information and provide:

1. RISK_ASSESSMENT: Identify any potential health risks or concerning findings
2. DIAGNOSTIC_INSIGHT: Provide diagnostic insights based on the data
3. TREATMENT_SUGGESTION: Suggest appropriate treatment or follow-up actions
4. PREVENTIVE_CARE: Recommend preventive measures
5. SUMMARY: Provide a concise overall summary

Format your response as JSON with the following structure:
{
  "insights": [
    {
      "type": "risk_assessment|diagnostic_insight|treatment_suggestion|preventive_care|summary",
      "title": "Brief title",
      "content": "Detailed content",
      "confidence": 0.85
    }
  ],
  "summary": "Overall summary",
  "riskFactors": ["risk1", "risk2"],
  "recommendations": ["rec1", "rec2"]
}

IMPORTANT: 
- Only provide medical insights for educational purposes
- Always recommend consulting with healthcare professionals
- Be conservative in risk assessments
- Clearly indicate confidence levels`;
  }

  /**
   * Build health insights prompt
   */
  private buildHealthInsightsPrompt(patientData: any): string {
    return `You are a medical AI assistant analyzing patient data to provide health insights.

Patient Data:
${JSON.stringify(patientData, null, 2)}

Please analyze this patient information and provide comprehensive health insights including:

1. Risk factors based on the patient profile
2. Preventive care recommendations
3. Health monitoring suggestions
4. Lifestyle recommendations
5. When to seek medical attention

Format your response as JSON with the structure shown in the medical analysis prompt.

Focus on preventive care and health optimization while being conservative about medical advice.`;
  }

  /**
   * Build treatment recommendation prompt
   */
  private buildTreatmentRecommendationPrompt(
    diagnosis: string,
    patientProfile: string,
    currentTreatments?: string[]
  ): string {
    return `You are a medical AI assistant providing treatment recommendations.

Diagnosis: ${diagnosis}
Patient Profile: ${patientProfile}
${currentTreatments ? `Current Treatments: ${currentTreatments.join(', ')}` : ''}

Please provide evidence-based treatment recommendations including:

1. Primary treatment options
2. Alternative approaches
3. Monitoring requirements
4. Potential side effects to watch for
5. Follow-up recommendations

Format your response as JSON with the structure shown in the medical analysis prompt.

IMPORTANT: Always emphasize the need for professional medical supervision and personalized care.`;
  }

  /**
   * Parse the AI response into structured medical insights
   */
  private parseMedicalAnalysisResponse(
    response: string,
    processingTime: number,
    cost: string
  ): MedicalAnalysisResult {
    try {
      // Try to parse as JSON first
      let parsed: any;
      try {
        // Extract JSON from response if it's wrapped in text
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (jsonError) {
        // If JSON parsing fails, create structured response from text
        parsed = this.createStructuredResponseFromText(response);
      }
      
      // Ensure insights have proper structure
      const insights: MedicalInsight[] = (parsed.insights || []).map((insight: any) => ({
        type: insight.type || 'summary',
        title: insight.title || 'Medical Insight',
        content: insight.content || insight,
        confidence: insight.confidence || 0.7,
        source: 'AI Analysis',
        timestamp: new Date(),
      }));

      return {
        insights,
        summary: parsed.summary || response.substring(0, 200) + '...',
        riskFactors: parsed.riskFactors || [],
        recommendations: parsed.recommendations || [],
        cost,
        processingTime,
      };
    } catch (error) {
      console.error("Error parsing AI response:", error);
      
      // Fallback: create basic insight from response
      return {
        insights: [{
          type: 'summary',
          title: 'AI Analysis',
          content: response,
          confidence: 0.6,
          source: 'AI Analysis',
          timestamp: new Date(),
        }],
        summary: response.substring(0, 200) + '...',
        riskFactors: [],
        recommendations: [],
        cost,
        processingTime,
      };
    }
  }

  /**
   * Create structured response from plain text
   */
  private createStructuredResponseFromText(text: string): any {
    const insights = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    let currentInsight: any = null;
    
    for (const line of lines) {
      if (line.match(/^\d+\./)) {
        // New insight starting
        if (currentInsight) insights.push(currentInsight);
        
        const title = line.replace(/^\d+\.\s*/, '').split(':')[0];
        const type = this.inferInsightType(title);
        
        currentInsight = {
          type,
          title,
          content: line.split(':').slice(1).join(':').trim(),
          confidence: 0.7
        };
      } else if (currentInsight && line.trim()) {
        currentInsight.content += ' ' + line.trim();
      }
    }
    
    if (currentInsight) insights.push(currentInsight);
    
    return {
      insights,
      summary: text.substring(0, 300) + '...',
      riskFactors: [],
      recommendations: []
    };
  }

  /**
   * Infer insight type from title
   */
  private inferInsightType(title: string): MedicalInsight['type'] {
    const lower = title.toLowerCase();
    if (lower.includes('risk')) return 'risk_assessment';
    if (lower.includes('treatment') || lower.includes('therapy')) return 'treatment_suggestion';
    if (lower.includes('diagnostic') || lower.includes('diagnosis')) return 'diagnostic_insight';
    if (lower.includes('prevent')) return 'preventive_care';
    return 'summary';
  }

  /**
   * Get current account balance
   */
  public async getBalance(): Promise<any> {
    await this.ensureInitialized();
    return await this.broker!.ledger.getLedger();
  }

  /**
   * Add funds to ledger
   */
  public async addFunds(amount: number): Promise<void> {
    await this.ensureInitialized();
    await this.broker!.ledger.addLedger(amount);
  }
}

// Export singleton instance
export const medicalAIService = new MedicalAIService();
export default MedicalAIService;
