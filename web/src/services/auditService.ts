const API_BASE_URL = 'https://medivet-production.up.railway.app/api';

export interface AuditLog {
  id: number;
  wallet_address: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

export interface CreateAuditLogRequest {
  wallet_address: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: string;
}

class AuditService {
  async createLog(logData: CreateAuditLogRequest): Promise<{ success: boolean; id: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create audit log:', error);
      throw error;
    }
  }

  async getLogs(walletAddress: string, limit = 50, offset = 0): Promise<{ logs: AuditLog[] }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/audit/${walletAddress}?limit=${limit}&offset=${offset}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      throw error;
    }
  }

  async getStats(walletAddress: string): Promise<{ stats: any[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/audit/${walletAddress}/stats`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch audit stats:', error);
      throw error;
    }
  }

  // Helper methods for common actions
  async logFileUpload(walletAddress: string, fileId: string, fileName: string) {
    return this.createLog({
      wallet_address: walletAddress,
      action: 'file_upload',
      resource_type: 'medical_file',
      resource_id: fileId,
      details: `Uploaded file: ${fileName}`,
    });
  }

  async logPermissionChange(walletAddress: string, providerId: string, action: 'granted' | 'revoked') {
    return this.createLog({
      wallet_address: walletAddress,
      action: `permission_${action}`,
      resource_type: 'data_access',
      resource_id: providerId,
      details: `${action === 'granted' ? 'Granted' : 'Revoked'} data access to provider`,
    });
  }

  async logLogin(walletAddress: string) {
    return this.createLog({
      wallet_address: walletAddress,
      action: 'login',
      resource_type: 'authentication',
      details: 'User logged in',
    });
  }

  async logLogout(walletAddress: string) {
    return this.createLog({
      wallet_address: walletAddress,
      action: 'logout',
      resource_type: 'authentication',
      details: 'User logged out',
    });
  }
}

export const auditService = new AuditService();
