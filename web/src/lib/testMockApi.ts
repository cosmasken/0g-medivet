// Test script to verify mock API functionality
import { authenticateUser, getProviderPermissions, accessRecordWithPayment } from './api';

async function testMockAPI() {
  console.log('Testing mock API functionality...');
  
  try {
    // Test user authentication
    console.log('1. Testing user authentication...');
    const authResult = await authenticateUser('0x742d35Cc6634C0532925a3b844Bc454e4438f44e', 'provider');
    console.log('Authentication result:', authResult);
    
    // Test provider permissions
    console.log('2. Testing provider permissions...');
    const permissionsResult = await getProviderPermissions('user-2');
    console.log('Permissions result:', permissionsResult);
    
    // Test record access with payment
    console.log('3. Testing record access with payment...');
    const accessResult = await accessRecordWithPayment('user-2', 'user-1', 'record-1', 'VIEW_RECORD');
    console.log('Access result:', accessResult);
    
    console.log('All tests passed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (typeof window !== 'undefined') {
  // In browser environment
  testMockAPI();
} else {
  // In Node environment
  testMockAPI();
}

export { testMockAPI };