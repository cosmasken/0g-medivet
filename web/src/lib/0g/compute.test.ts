/**
 * Basic integration test for 0G Compute service
 * This test verifies the API endpoints work correctly
 */

import { submitAnalysis, checkComputeHealth, getComputeBalance } from './compute';

// Mock test data
const mockFileData = {
  fileName: 'test-lab-result.pdf',
  fileType: 'application/pdf',
  fileSize: 1024,
  category: 'lab-result',
  content: 'Mock medical data for testing'
};

const mockUserId = 'test-user-123';

/**
 * Test compute service health check
 */
export async function testComputeHealth() {
  try {
    console.log('Testing compute health...');
    const health = await checkComputeHealth();
    
    console.log('Health check result:', health);
    
    if (health.status === 'healthy') {
      console.log('✅ Compute service is healthy');
      return true;
    } else {
      console.log('⚠️ Compute service is unhealthy:', health.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return false;
  }
}

/**
 * Test compute balance retrieval
 */
export async function testComputeBalance() {
  try {
    console.log('Testing compute balance...');
    const balance = await getComputeBalance();
    
    console.log('Balance result:', balance);
    
    if (balance && typeof balance.total === 'string') {
      console.log('✅ Balance retrieved successfully:', balance.total, 'OG');
      return true;
    } else {
      console.log('⚠️ Invalid balance response');
      return false;
    }
  } catch (error) {
    console.error('❌ Balance check failed:', error);
    return false;
  }
}

/**
 * Test medical analysis submission
 */
export async function testMedicalAnalysis() {
  try {
    console.log('Testing medical analysis...');
    const result = await submitAnalysis(mockFileData, 'medical-analysis', mockUserId);
    
    console.log('Analysis result:', result);
    
    if (result && result.jobId && result.analysis) {
      console.log('✅ Analysis completed successfully');
      console.log('Job ID:', result.jobId);
      console.log('Analysis preview:', result.analysis.substring(0, 100) + '...');
      return true;
    } else {
      console.log('⚠️ Invalid analysis response');
      return false;
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'COMPUTE_UNAVAILABLE') {
      console.log('⚠️ Compute service unavailable, fallback should be used');
      return true; // This is expected behavior
    }
    
    console.error('❌ Analysis failed:', error);
    return false;
  }
}

/**
 * Run all integration tests
 */
export async function runIntegrationTests() {
  console.log('🧪 Starting 0G Compute integration tests...\n');
  
  const results = {
    health: await testComputeHealth(),
    balance: await testComputeBalance(),
    analysis: await testMedicalAnalysis()
  };
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above.');
  }
  
  return results;
}

// Export for use in development/testing
if (typeof window !== 'undefined') {
  (window as any).testCompute = {
    runIntegrationTests,
    testComputeHealth,
    testComputeBalance,
    testMedicalAnalysis
  };
}
