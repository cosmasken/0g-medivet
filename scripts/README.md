# MediVet Test Data Generation Scripts

This directory contains scripts for generating test data for the MediVet platform.

## Scripts

### `generate-test-users.js`

Generates 100 test users (80 patients + 20 providers) with realistic medical data for development and testing.

**Features:**
- Uses same address generation method as Android app
- Creates 80 patients with creative usernames
- Creates 20 providers with medical specialties
- Generates 2-6 medical records per patient
- Establishes provider-patient relationships
- Sets up record-level permissions (70% of records accessible to providers)

**Usage:**
```bash
cd scripts
npm install
npm run generate
```

**Or directly:**
```bash
node generate-test-users.js
```

## Generated Data

### Patients (80 users)
- **Username pattern:** Creative names like `alex_runner`, `sarah_yoga`, etc.
- **Password:** `patient123` (for all patients)
- **Records:** 2-6 medical records each (lab results, imaging, diagnostics)

### Providers (20 users)
- **Username pattern:** `dr_heartbeat`, `dr_brainwave`, etc.
- **Password:** `doctor123` (for all providers)
- **Specialties:** Cardiology, Neurology, Orthopedics, Dermatology, etc.

### Access Model
- **Provider-Patient Relations:** Each patient assigned to 2-4 providers
- **Record Permissions:** Providers get access to ~70% of their patients' records
- **Permission Levels:** 80% view-only, 20% edit permissions

## Test Credentials

### Sample Patient Logins
```
Username: alex_runner, Password: patient123
Username: sarah_yoga, Password: patient123
Username: mike_cyclist, Password: patient123
```

### Sample Provider Logins
```
Username: dr_heartbeat, Password: doctor123 (Cardiology)
Username: dr_brainwave, Password: doctor123 (Neurology)
Username: dr_bonedoc, Password: doctor123 (Orthopedics)
```

## Database Schema

The script populates these tables:
- `users` - User accounts with wallet addresses
- `user_profiles` - Personal information
- `medical_records` - Patient medical files
- `provider_patient_relations` - Provider-patient assignments
- `provider_permissions` - Record-level access control

## Address Generation

Uses the same deterministic method as the Android app:
```javascript
function generateAddressFromCredentials(username, password) {
    const input = `${username}:${password}`;
    const hash = crypto.createHash('sha256').update(input).digest('hex');
    // ... generates EVM-compatible address
}
```

## Testing Scenarios

1. **Patient Login:** Login as patient, view medical records
2. **Provider Login:** Login as provider, see assigned patients and accessible records
3. **Permission Testing:** Verify providers can only access permitted records
4. **File Upload:** Upload new files and test permission granting
5. **Cross-Platform:** Test same credentials work on web and mobile

## Notes

- All data is for development/testing only
- Uses Supabase for data storage
- Generates realistic but fake medical data
- Safe to run multiple times (will create duplicates)
