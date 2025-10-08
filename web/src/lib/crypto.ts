/**
 * Generates a deterministic EVM-compatible wallet address from username and password.
 * Uses the same method as Android app for consistency.
 */
export async function generateAddressFromCredentials(username: string, password: string): Promise<string> {
  const input = `${username}:${password}`;
  
  // Use Web Crypto API for SHA-256 hashing
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const privateKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Generate address from private key (simplified version)
  const addressData = encoder.encode('0x' + privateKey);
  const addressBuffer = await crypto.subtle.digest('SHA-256', addressData);
  const addressArray = Array.from(new Uint8Array(addressBuffer));
  const address = '0x' + addressArray.slice(0, 20).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return address;
}
