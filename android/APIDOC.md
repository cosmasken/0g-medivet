# MediVet API Documentation

Base URL: `https://medivet-backend-72tq.onrender.com`

## Authentication

The API uses wallet-based authentication. Most endpoints that require user identification expect the user's wallet address to be provided in the request body.

## Rate Limits

- General API: 100 requests per 15 minutes per IP
- Compute endpoints: 20 requests per 15 minutes per IP
- Authentication: 5 requests per 15 minutes per IP

## Endpoints

### Health Check
- `GET /health` - Check server health status

Response:
```json
{
  "status": "OK",
  "timestamp": "2025-10-07T06:03:36.889Z",
  "services": {
    "database": "OK",
    "supabase": "OK",
    "compute": "Available"
  }
}
```

### User Authentication
- `POST /api/users/auth` - Authenticate user by wallet address

Request:
```json
{
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "role": "patient",
  "username": "johndoe"
}
```

Response:
```json
{
  "user": {
    "id": "uuid-v4-identifier",
    "wallet_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "username": "johndoe",
    "role": "patient",
    "is_onboarded": false,
    "created_at": "2023-01-01T00:00:00Z"
  }
}
```

### User Login
- `POST /api/users/login` - Login with username

Request:
```json
{
  "username": "johndoe",
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
}
```

### Medical Records
- `POST /api/records` - Create a medical record

Request:
```json
{
  "user_id": "user-uuid",
  "title": "Lab Results",
  "description": "Annual blood test results",
  "category": "laboratory",
  "specialty": "cardiology",
  "priority_level": "medium",
  "file_type": "pdf",
  "file_size": 2048000,
  "zero_g_hash": "0x123456789abcdef",
  "merkle_root": "0x123456789abcdef",
  "transaction_hash": "0x123456789abcdef",
  "tags": ["annual", "blood-test", "2023"],
  "parent_record_id": "uuid",
  "upload_status": "completed"
}
```

- `GET /api/records/user/:userId` - Get user's medical records

Query parameters:
- `limit`, `offset`, `category`, `specialty`, `priority_level`, `tags`, `search`, `date_from`, `date_to`, `include_versions`

### Compute Services (AI Analysis)
- `POST /api/compute/analyze` - Submit medical data for AI analysis

Request:
```json
{
  "fileData": {
    "name": "medical_data.json",
    "age": 45,
    "medications": ["aspirin", "metformin"],
    "diagnosis": "Type 2 diabetes",
    "lab_results": {}
  },
  "analysisType": "medical-analysis",
  "userId": "user-uuid",
  "fileId": "file-uuid"
}
```

Response:
```json
{
  "success": true,
  "jobId": "job-uuid",
  "analysis": "AI-generated analysis of medical data...",
  "isValid": true,
  "provider": "0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3",
  "timestamp": "2023-01-01T00:00:00Z",
  "computeTime": 1500
}
```

- `GET /api/compute/jobs/:jobId` - Get job status
- `GET /api/compute/balance` - Get compute balance
- `GET /api/compute/services` - Get available services

### Provider-Patient Relationships
- `POST /api/providers/patient-relationships` - Create relationship

Request:
```json
{
  "provider_id": "provider-uuid",
  "patient_id": "patient-uuid",
  "relationship_type": "treated",
  "specialty": "cardiology",
  "start_date": "2023-01-01",
  "notes": "Patient under regular care"
}
```

### Audit Logs
- `POST /api/audit` - Create audit log

Request:
```json
{
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "action": "view_record",
  "resource_type": "medical_record",
  "resource_id": "record-uuid",
  "details": {
    "provider_id": "provider-uuid",
    "user_agent": "Mobile App v1.0"
  }
}
```

- `GET /api/audit/:walletAddress` - Get user's audit logs

### Marketplace Monetization
- `POST /api/providers/monetization` - List record for sale

Request:
```json
{
  "patient_id": "patient-uuid",
  "record_id": "record-uuid",
  "price_eth": 0.001,
  "anonymized_data": {}
}

### Health Connect Integration
- `POST /api/health-connect/sync` - Sync health data from Health Connect

Request:
```json
{
  "user_id": "user-uuid",
  "health_data": [
    {
      "data_type": "steps",
      "start_time": "2023-01-01T08:00:00Z",
      "end_time": "2023-01-01T09:00:00Z",
      "value": 1500,
      "unit": "count",
      "source_app": "Google Fit",
      "source_device": "Pixel 7",
      "metadata": {
        "confidence": 0.95
      }
    }
  ]
}
```

Response:
```json
{
  "success": true,
  "message": "1 health data points synced successfully",
  "synced_count": 1
}
```

- `GET /api/health-connect/user/:userId` - Get Health Connect data with filtering

Query parameters:
- `limit`, `offset`, `data_type`, `start_date`, `end_date`, `source_app`

- `GET /api/health-connect/user/:userId/stats` - Get aggregated health statistics

Query parameters:
- `start_date`, `end_date`, `data_type`

- `GET /api/health-connect/user/:userId/summary` - Get data summary

- `DELETE /api/health-connect/user/:userId` - Delete Health Connect data by filters

Query parameters:
- `start_date`, `end_date`, `data_type`

## Error Responses

All error responses follow the format:
```json
{
  "error": "Descriptive error message",
  "message": "Generic message to prevent information leakage"
}
```

## Headers

- Content-Type: application/json
- Authentication is done via wallet address in request body

## Notes for Frontend/Mobile Developers

1. Always include proper error handling for 429 (rate limit exceeded) status codes
2. For Web3 authentication, integrate with wallet providers like MetaMask
3. The API expects valid UUIDs for user_id and record_id fields
4. Validate user input on the client side before making API calls
5. Implement retry logic for compute-intensive operations
6. Store user authentication data securely in the mobile app
7. Use the test endpoints during development to save on 0G compute costs
8. The Health Connect endpoints are specifically designed for Android Health Connect integration
9. When syncing from Health Connect, batch multiple data points in a single request for efficiency