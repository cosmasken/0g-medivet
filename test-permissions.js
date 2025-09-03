// Test script to verify the varied permission patterns in the mock patient pool

const MOCK_PATIENTS_POOL = [
  {
    name: 'Emma Johnson',
    permissions: {
      basicInfo: true,
      medicalHistory: true,
      labResults: true,
      imaging: true,
      prescriptions: true,
      vitals: true,
      allergies: true,
      emergencyContact: true
    },
    description: 'Full Access Patient - shares everything'
  },
  {
    name: 'Liam Williams',
    permissions: {
      basicInfo: true,
      medicalHistory: false,
      labResults: false,
      imaging: false,
      prescriptions: false,
      vitals: true,
      allergies: false,
      emergencyContact: false
    },
    description: 'Basic Info Only - very privacy conscious'
  },
  {
    name: 'Olivia Brown',
    permissions: {
      basicInfo: true,
      medicalHistory: true,
      labResults: true,
      imaging: false,
      prescriptions: true,
      vitals: true,
      allergies: true,
      emergencyContact: false
    },
    description: 'Medical Focused - shares health data but not emergency contact'
  },
  {
    name: 'Noah Garcia',
    permissions: {
      basicInfo: false,
      medicalHistory: false,
      labResults: true,
      imaging: false,
      prescriptions: false,
      vitals: true,
      allergies: false,
      emergencyContact: false
    },
    description: 'Labs & Vitals Only - minimal sharing for monitoring'
  },
  {
    name: 'Ava Miller',
    permissions: {
      basicInfo: true,
      medicalHistory: false,
      labResults: false,
      imaging: false,
      prescriptions: true,
      vitals: true,
      allergies: true,
      emergencyContact: true
    },
    description: 'Emergency Focused - medications and emergency contact only'
  },
  {
    name: 'Ethan Davis',
    permissions: {
      basicInfo: false,
      medicalHistory: true,
      labResults: true,
      imaging: true,
      prescriptions: false,
      vitals: true,
      allergies: false,
      emergencyContact: false
    },
    description: 'Research Friendly - medical data without personal info'
  },
  {
    name: 'Sophia Rodriguez',
    permissions: {
      basicInfo: true,
      medicalHistory: true,
      labResults: false,
      imaging: true,
      prescriptions: false,
      vitals: true,
      allergies: false,
      emergencyContact: true
    },
    description: 'Partial Access - selective sharing with emergency contact'
  },
  {
    name: 'Mason Martinez',
    permissions: {
      basicInfo: false,
      medicalHistory: false,
      labResults: false,
      imaging: false,
      prescriptions: false,
      vitals: false,
      allergies: false,
      emergencyContact: false
    },
    description: 'Very Restrictive - no access granted'
  }
];

console.log('=== PERMISSION VARIATION ANALYSIS ===\n');

// Analyze permission patterns
const permissionKeys = Object.keys(MOCK_PATIENTS_POOL[0].permissions);
console.log('Available Permission Types:', permissionKeys.join(', '), '\n');

MOCK_PATIENTS_POOL.forEach((patient, index) => {
  const enabledPermissions = permissionKeys.filter(key => patient.permissions[key]);
  const enabledCount = enabledPermissions.length;
  
  console.log(`${index + 1}. ${patient.name}`);
  console.log(`   Description: ${patient.description}`);
  console.log(`   Enabled: ${enabledCount}/${permissionKeys.length} permissions`);
  console.log(`   Granted Access: [${enabledPermissions.join(', ')}]`);
  console.log(`   Denied Access: [${permissionKeys.filter(key => !patient.permissions[key]).join(', ')}]`);
  console.log('');
});

// Statistical analysis
console.log('=== PERMISSION STATISTICS ===');
const permissionStats = {};
permissionKeys.forEach(key => {
  const grantedCount = MOCK_PATIENTS_POOL.filter(p => p.permissions[key]).length;
  const percentage = Math.round((grantedCount / MOCK_PATIENTS_POOL.length) * 100);
  permissionStats[key] = { granted: grantedCount, percentage };
});

console.log('Permission Grant Rates:');
Object.entries(permissionStats).forEach(([permission, stats]) => {
  console.log(`  ${permission}: ${stats.granted}/${MOCK_PATIENTS_POOL.length} patients (${stats.percentage}%)`);
});

console.log('\n=== PERMISSION DIVERSITY TEST ===');
const uniquePatterns = new Set();
MOCK_PATIENTS_POOL.forEach(patient => {
  const pattern = JSON.stringify(patient.permissions);
  uniquePatterns.add(pattern);
});

console.log(`Unique Permission Patterns: ${uniquePatterns.size}/${MOCK_PATIENTS_POOL.length}`);
console.log(`Diversity Score: ${Math.round((uniquePatterns.size / MOCK_PATIENTS_POOL.length) * 100)}%`);

if (uniquePatterns.size === MOCK_PATIENTS_POOL.length) {
  console.log('✅ PASS: All patients have unique permission patterns');
} else {
  console.log('⚠️  Some patients have identical permission patterns');
}

// Range analysis
const permissionCounts = MOCK_PATIENTS_POOL.map(p => 
  Object.values(p.permissions).filter(Boolean).length
);
const minPermissions = Math.min(...permissionCounts);
const maxPermissions = Math.max(...permissionCounts);

console.log(`\nPermission Range: ${minPermissions} to ${maxPermissions} permissions granted`);
console.log(`Average: ${(permissionCounts.reduce((a, b) => a + b) / permissionCounts.length).toFixed(1)} permissions per patient`);

console.log('\n=== CONCLUSION ===');
if (uniquePatterns.size === MOCK_PATIENTS_POOL.length && maxPermissions - minPermissions >= 5) {
  console.log('✅ SUCCESS: Permission system shows good diversity with varied access patterns');
} else {
  console.log('❌ IMPROVEMENT NEEDED: Permission system could be more diverse');
}
