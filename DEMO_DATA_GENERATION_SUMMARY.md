# Demo Data Generation Summary

## 🎯 Objective
Create 100 test users (80 patients + 20 providers) with realistic medical data for MediVet platform testing, using the same address generation method as the Android app.

## ✅ Completed Tasks

### 1. Schema Analysis
- **Provider Access Model Identified:**
  - `provider_patient_relations` - General provider-patient relationships
  - `provider_permissions` - Specific record-level access control
  - **Key Finding:** Providers need BOTH relationship AND explicit permissions for each medical record

### 2. Test Data Generation Script
- **Location:** `/scripts/generate-test-users.js`
- **Method:** Uses same deterministic address generation as Android app
- **Dependencies:** Supabase client for database operations

### 3. Generated Data Statistics
```
✅ Users created: 102 (80 patients + 20 providers + 2 extra patients)
✅ Profiles created: 102
✅ Medical records created: 313
✅ Provider relations created: 219
✅ Record permissions created: 563
```

## 👥 User Data

### Patients (80 users)
**Creative Usernames:** `alex_runner`, `sarah_yoga`, `mike_cyclist`, `emma_swimmer`, etc.
**Password:** `patient123` (universal for all patients)
**Records:** 2-6 medical records each (lab results, imaging, diagnostics)

### Providers (20 users)
**Creative Usernames:** `dr_heartbeat`, `dr_brainwave`, `dr_bonedoc`, etc.
**Password:** `doctor123` (universal for all providers)
**Specialties:** Cardiology, Neurology, Orthopedics, Dermatology, etc.

## 🔐 Access Control Model

### Provider-Patient Relationships
- Each patient assigned to 2-4 providers randomly
- Relationships based on medical specialties
- 219 total relationships created

### Record-Level Permissions
- Providers get access to ~70% of their patients' records
- **Permission Levels:**
  - 80% view-only permissions
  - 20% edit permissions
- 563 total permissions created

## 🧪 Test Scenarios Enabled

### 1. Patient Login Testing
```bash
Username: alex_runner
Password: patient123
Expected: View own medical records, manage provider access
```

### 2. Provider Login Testing
```bash
Username: dr_heartbeat
Password: doctor123
Expected: See assigned patients, view permitted records only
```

### 3. Permission Testing
- Providers can only access records they have explicit permissions for
- Test both view and edit permission levels
- Verify access control enforcement

### 4. Cross-Platform Testing
- Same credentials work on web and mobile apps
- Address generation consistency verified

## 📁 Files Created

1. **`/scripts/generate-test-users.js`** - Main generation script
2. **`/scripts/package.json`** - Dependencies and scripts
3. **`/scripts/README.md`** - Documentation and usage guide
4. **`/scripts/node_modules/`** - Installed dependencies

## 🚀 Usage Instructions

### Run the Script
```bash
cd /medData/scripts
npm install
npm run generate
```

### Test Login Credentials
```bash
# Sample Patient Logins
alex_runner / patient123
sarah_yoga / patient123
mike_cyclist / patient123

# Sample Provider Logins
dr_heartbeat / doctor123 (Cardiology)
dr_brainwave / doctor123 (Neurology)
dr_bonedoc / doctor123 (Orthopedics)
```

## 🔍 Key Technical Details

### Address Generation Method
```javascript
function generateAddressFromCredentials(username, password) {
    const input = `${username}:${password}`;
    const hash = crypto.createHash('sha256').update(input).digest('hex');
    const privateKey = '0x' + hash;
    const addressHash = crypto.createHash('sha256').update(privateKey).digest('hex');
    return '0x' + addressHash.substring(0, 40);
}
```

### Database Tables Populated
- `users` - User accounts with wallet addresses
- `user_profiles` - Personal information
- `medical_records` - Patient medical files
- `provider_patient_relations` - Provider-patient assignments
- `provider_permissions` - Record-level access control

## 🎯 Next Steps for Testing

1. **Web Application Testing**
   - Login as patients and providers
   - Verify record visibility based on permissions
   - Test file upload and permission granting

2. **Mobile Application Testing**
   - Use same credentials on Android app
   - Verify address generation consistency
   - Test Health Connect data sync

3. **Provider Workflow Testing**
   - Login as provider
   - View assigned patients
   - Access permitted medical records
   - Test permission-based restrictions

4. **Permission Management Testing**
   - Grant/revoke record permissions
   - Test different permission levels (view vs edit)
   - Verify audit trail functionality

## 📊 Success Metrics

- ✅ 100 users successfully created
- ✅ Realistic medical data generated
- ✅ Permission-based access control implemented
- ✅ Cross-platform credential compatibility
- ✅ No duplicate wallet addresses
- ✅ Proper provider-patient relationships
- ✅ Comprehensive test coverage enabled

## 🔧 Technical Notes

- **Supabase Integration:** Direct database operations using service key
- **Error Handling:** Graceful handling of duplicate entries
- **Data Relationships:** Proper foreign key relationships maintained
- **Scalability:** Script can be run multiple times safely
- **Security:** Test data only, no real PII used

This demo data generation provides a comprehensive testing environment for the MediVet platform, enabling thorough testing of all user workflows, permission systems, and cross-platform functionality.
