#!/usr/bin/env node

const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://ypkizdvaxvsedvbbntxj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwa2l6ZHZheHZzZWR2YmJudHhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjA5OTE4OCwiZXhwIjoyMDcxNjc1MTg4fQ.nNYZhtahPA2PvuriWF_5QUWk_VkMbmU519Ai7i3WCwY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Generates EVM address from username/password using same method as Android
 */
function generateAddressFromCredentials(username, password) {
    const input = `${username}:${password}`;
    const hash = crypto.createHash('sha256').update(input).digest('hex');
    const privateKey = '0x' + hash;
    
    // Simple address generation (mimicking Web3j behavior)
    const addressHash = crypto.createHash('sha256').update(privateKey).digest('hex');
    return '0x' + addressHash.substring(0, 40);
}

// 80 Creative patient usernames
const patientNames = [
    { username: 'alex_runner', firstName: 'Alex', lastName: 'Thompson' },
    { username: 'sarah_yoga', firstName: 'Sarah', lastName: 'Chen' },
    { username: 'mike_cyclist', firstName: 'Michael', lastName: 'Rodriguez' },
    { username: 'emma_swimmer', firstName: 'Emma', lastName: 'Johnson' },
    { username: 'david_hiker', firstName: 'David', lastName: 'Williams' },
    { username: 'lisa_dancer', firstName: 'Lisa', lastName: 'Brown' },
    { username: 'john_climber', firstName: 'John', lastName: 'Davis' },
    { username: 'maria_boxer', firstName: 'Maria', lastName: 'Garcia' },
    { username: 'james_surfer', firstName: 'James', lastName: 'Miller' },
    { username: 'anna_skier', firstName: 'Anna', lastName: 'Wilson' },
    { username: 'robert_golfer', firstName: 'Robert', lastName: 'Moore' },
    { username: 'jennifer_tennis', firstName: 'Jennifer', lastName: 'Taylor' },
    { username: 'william_soccer', firstName: 'William', lastName: 'Anderson' },
    { username: 'jessica_volleyball', firstName: 'Jessica', lastName: 'Thomas' },
    { username: 'christopher_basketball', firstName: 'Christopher', lastName: 'Jackson' },
    { username: 'amanda_crossfit', firstName: 'Amanda', lastName: 'White' },
    { username: 'matthew_marathon', firstName: 'Matthew', lastName: 'Harris' },
    { username: 'ashley_pilates', firstName: 'Ashley', lastName: 'Martin' },
    { username: 'daniel_weightlifter', firstName: 'Daniel', lastName: 'Thompson' },
    { username: 'stephanie_zumba', firstName: 'Stephanie', lastName: 'Garcia' },
    { username: 'joshua_triathlete', firstName: 'Joshua', lastName: 'Martinez' },
    { username: 'michelle_kickboxer', firstName: 'Michelle', lastName: 'Robinson' },
    { username: 'andrew_rock_climber', firstName: 'Andrew', lastName: 'Clark' },
    { username: 'nicole_gymnast', firstName: 'Nicole', lastName: 'Rodriguez' },
    { username: 'ryan_snowboarder', firstName: 'Ryan', lastName: 'Lewis' },
    { username: 'samantha_archer', firstName: 'Samantha', lastName: 'Lee' },
    { username: 'brandon_martial_artist', firstName: 'Brandon', lastName: 'Walker' },
    { username: 'rachel_equestrian', firstName: 'Rachel', lastName: 'Hall' },
    { username: 'justin_skateboarder', firstName: 'Justin', lastName: 'Allen' },
    { username: 'megan_cheerleader', firstName: 'Megan', lastName: 'Young' },
    { username: 'tyler_baseball', firstName: 'Tyler', lastName: 'Hernandez' },
    { username: 'lauren_softball', firstName: 'Lauren', lastName: 'King' },
    { username: 'kevin_hockey', firstName: 'Kevin', lastName: 'Wright' },
    { username: 'brittany_figure_skater', firstName: 'Brittany', lastName: 'Lopez' },
    { username: 'zachary_wrestler', firstName: 'Zachary', lastName: 'Hill' },
    { username: 'courtney_track_field', firstName: 'Courtney', lastName: 'Scott' },
    { username: 'nathan_swimmer_pro', firstName: 'Nathan', lastName: 'Green' },
    { username: 'crystal_badminton', firstName: 'Crystal', lastName: 'Adams' },
    { username: 'derek_fencer', firstName: 'Derek', lastName: 'Baker' },
    { username: 'vanessa_rower', firstName: 'Vanessa', lastName: 'Gonzalez' },
    { username: 'austin_lacrosse', firstName: 'Austin', lastName: 'Nelson' },
    { username: 'tiffany_water_polo', firstName: 'Tiffany', lastName: 'Carter' },
    { username: 'sean_ultimate_frisbee', firstName: 'Sean', lastName: 'Mitchell' },
    { username: 'diana_table_tennis', firstName: 'Diana', lastName: 'Perez' },
    { username: 'marcus_parkour', firstName: 'Marcus', lastName: 'Roberts' },
    { username: 'kelly_bouldering', firstName: 'Kelly', lastName: 'Turner' },
    { username: 'eric_sailing', firstName: 'Eric', lastName: 'Phillips' },
    { username: 'christina_kayaking', firstName: 'Christina', lastName: 'Campbell' },
    { username: 'jordan_motocross', firstName: 'Jordan', lastName: 'Parker' },
    { username: 'heather_horseback', firstName: 'Heather', lastName: 'Evans' },
    { username: 'adam_powerlifting', firstName: 'Adam', lastName: 'Edwards' },
    { username: 'melanie_aerial_yoga', firstName: 'Melanie', lastName: 'Collins' },
    { username: 'carlos_capoeira', firstName: 'Carlos', lastName: 'Stewart' },
    { username: 'lindsay_pole_vault', firstName: 'Lindsay', lastName: 'Sanchez' },
    { username: 'gregory_discus', firstName: 'Gregory', lastName: 'Morris' },
    { username: 'patricia_hammer_throw', firstName: 'Patricia', lastName: 'Rogers' },
    { username: 'benjamin_javelin', firstName: 'Benjamin', lastName: 'Reed' },
    { username: 'kimberly_shot_put', firstName: 'Kimberly', lastName: 'Cook' },
    { username: 'jacob_high_jump', firstName: 'Jacob', lastName: 'Morgan' },
    { username: 'rebecca_long_jump', firstName: 'Rebecca', lastName: 'Bell' },
    { username: 'alexander_hurdles', firstName: 'Alexander', lastName: 'Murphy' },
    { username: 'monica_steeplechase', firstName: 'Monica', lastName: 'Bailey' },
    { username: 'nicholas_decathlon', firstName: 'Nicholas', lastName: 'Rivera' },
    { username: 'stephanie_heptathlon', firstName: 'Stephanie', lastName: 'Cooper' },
    { username: 'jonathan_pentathlon', firstName: 'Jonathan', lastName: 'Richardson' },
    { username: 'angela_biathlon', firstName: 'Angela', lastName: 'Cox' },
    { username: 'timothy_triathlon_pro', firstName: 'Timothy', lastName: 'Howard' },
    { username: 'sandra_ironman', firstName: 'Sandra', lastName: 'Ward' },
    { username: 'scott_ultramarathon', firstName: 'Scott', lastName: 'Torres' },
    { username: 'karen_obstacle_race', firstName: 'Karen', lastName: 'Peterson' },
    { username: 'paul_mud_run', firstName: 'Paul', lastName: 'Gray' },
    { username: 'lisa_spartan_race', firstName: 'Lisa', lastName: 'Ramirez' },
    { username: 'mark_tough_mudder', firstName: 'Mark', lastName: 'James' },
    { username: 'nancy_color_run', firstName: 'Nancy', lastName: 'Watson' },
    { username: 'steven_zombie_run', firstName: 'Steven', lastName: 'Brooks' },
    { username: 'donna_charity_walk', firstName: 'Donna', lastName: 'Kelly' },
    { username: 'richard_fun_run', firstName: 'Richard', lastName: 'Sanders' },
    { username: 'carol_5k_runner', firstName: 'Carol', lastName: 'Price' },
    { username: 'thomas_10k_runner', firstName: 'Thomas', lastName: 'Bennett' },
    { username: 'helen_half_marathon', firstName: 'Helen', lastName: 'Wood' },
    { username: 'gary_full_marathon', firstName: 'Gary', lastName: 'Barnes' },
    { username: 'ruth_ultra_runner', firstName: 'Ruth', lastName: 'Ross' }
];

// 20 Creative provider usernames with specialties
const providerNames = [
    { username: 'dr_heartbeat', firstName: 'Dr. Elena', lastName: 'Cardwell', specialty: 'Cardiology' },
    { username: 'dr_brainwave', firstName: 'Dr. Marcus', lastName: 'Neufeld', specialty: 'Neurology' },
    { username: 'dr_bonedoc', firstName: 'Dr. Sarah', lastName: 'Orthman', specialty: 'Orthopedics' },
    { username: 'dr_skindoctor', firstName: 'Dr. James', lastName: 'Dermis', specialty: 'Dermatology' },
    { username: 'dr_eyecare', firstName: 'Dr. Lisa', lastName: 'Visionary', specialty: 'Ophthalmology' },
    { username: 'dr_earnosethroat', firstName: 'Dr. Michael', lastName: 'Sinuswell', specialty: 'ENT' },
    { username: 'dr_kidneydoc', firstName: 'Dr. Amanda', lastName: 'Nephron', specialty: 'Nephrology' },
    { username: 'dr_lungdoctor', firstName: 'Dr. Robert', lastName: 'Breathwell', specialty: 'Pulmonology' },
    { username: 'dr_stomachdoc', firstName: 'Dr. Jennifer', lastName: 'Gastro', specialty: 'Gastroenterology' },
    { username: 'dr_hormonedoc', firstName: 'Dr. David', lastName: 'Endocrine', specialty: 'Endocrinology' },
    { username: 'dr_cancerdoc', firstName: 'Dr. Maria', lastName: 'Oncologist', specialty: 'Oncology' },
    { username: 'dr_blooddoc', firstName: 'Dr. Christopher', lastName: 'Hematol', specialty: 'Hematology' },
    { username: 'dr_rheumatology', firstName: 'Dr. Patricia', lastName: 'Jointwell', specialty: 'Rheumatology' },
    { username: 'dr_infectiousdoc', firstName: 'Dr. William', lastName: 'Germfree', specialty: 'Infectious Disease' },
    { username: 'dr_emergencydoc', firstName: 'Dr. Jessica', lastName: 'Urgent', specialty: 'Emergency Medicine' },
    { username: 'dr_familydoc', firstName: 'Dr. Matthew', lastName: 'Primary', specialty: 'Family Medicine' },
    { username: 'dr_internaldoc', firstName: 'Dr. Ashley', lastName: 'Internal', specialty: 'Internal Medicine' },
    { username: 'dr_radiologist', firstName: 'Dr. Daniel', lastName: 'Xrayview', specialty: 'Radiology' },
    { username: 'dr_pathologist', firstName: 'Dr. Michelle', lastName: 'Labtest', specialty: 'Pathology' },
    { username: 'dr_anesthesia', firstName: 'Dr. Joshua', lastName: 'Sleepwell', specialty: 'Anesthesiology' }
];

// Sample medical records for patients
const medicalRecordTemplates = [
    { title: 'Complete Blood Count', category: 'lab', specialty: 'pathology', description: 'Routine blood work analysis' },
    { title: 'Chest X-Ray', category: 'imaging', specialty: 'radiology', description: 'Chest radiograph examination' },
    { title: 'ECG Report', category: 'diagnostic', specialty: 'cardiology', description: 'Electrocardiogram results' },
    { title: 'Lipid Panel', category: 'lab', specialty: 'pathology', description: 'Cholesterol and triglyceride levels' },
    { title: 'MRI Brain Scan', category: 'imaging', specialty: 'neurology', description: 'Brain magnetic resonance imaging' },
    { title: 'Thyroid Function Test', category: 'lab', specialty: 'endocrinology', description: 'TSH, T3, T4 levels' },
    { title: 'Ultrasound Abdomen', category: 'imaging', specialty: 'radiology', description: 'Abdominal ultrasound examination' },
    { title: 'Bone Density Scan', category: 'imaging', specialty: 'orthopedics', description: 'DEXA scan for osteoporosis' },
    { title: 'Skin Biopsy Report', category: 'lab', specialty: 'dermatology', description: 'Histopathological analysis' },
    { title: 'Pulmonary Function Test', category: 'diagnostic', specialty: 'pulmonology', description: 'Lung capacity assessment' },
    { title: 'Colonoscopy Report', category: 'procedure', specialty: 'gastroenterology', description: 'Colon examination findings' },
    { title: 'Echocardiogram', category: 'imaging', specialty: 'cardiology', description: 'Heart ultrasound examination' },
    { title: 'CT Scan Head', category: 'imaging', specialty: 'neurology', description: 'Computed tomography of brain' },
    { title: 'Mammography', category: 'imaging', specialty: 'radiology', description: 'Breast cancer screening' },
    { title: 'Kidney Function Panel', category: 'lab', specialty: 'nephrology', description: 'Creatinine and BUN levels' }
];

async function createTestUsers() {
    console.log('🚀 Starting test user generation (80 patients + 20 providers)...\n');
    
    const results = {
        users: [],
        profiles: [],
        records: [],
        relations: [],
        permissions: [],
        errors: []
    };

    // Create patients
    console.log('👥 Creating 80 patients...\n');
    for (const userData of patientNames) {
        try {
            const walletAddress = generateAddressFromCredentials(userData.username, 'patient123');
            
            console.log(`Creating patient: ${userData.username}`);
            
            // Create user
            const { data: user, error: userError } = await supabase
                .from('users')
                .insert({
                    wallet_address: walletAddress,
                    username: userData.username,
                    role: 'patient',
                    email: `${userData.username}@medivet.test`,
                    is_onboarded: true
                })
                .select()
                .single();

            if (userError) {
                console.log(`  ❌ User creation failed: ${userError.message}`);
                results.errors.push({ username: userData.username, error: userError.message });
                continue;
            }

            results.users.push(user);

            // Create user profile
            const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .insert({
                    user_id: user.id,
                    first_name: userData.firstName,
                    last_name: userData.lastName,
                    date_of_birth: new Date(1970 + Math.floor(Math.random() * 40), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
                    gender: Math.random() > 0.5 ? 'male' : 'female',
                    address: `${Math.floor(Math.random() * 9999)} ${userData.lastName} St, Health City, HC ${Math.floor(Math.random() * 90000) + 10000}`
                })
                .select()
                .single();

            if (!profileError) {
                results.profiles.push(profile);
            }

            // Create 2-6 medical records per patient
            const numRecords = Math.floor(Math.random() * 5) + 2;
            
            for (let i = 0; i < numRecords; i++) {
                const template = medicalRecordTemplates[Math.floor(Math.random() * medicalRecordTemplates.length)];
                
                const { data: record, error: recordError } = await supabase
                    .from('medical_records')
                    .insert({
                        user_id: user.id,
                        title: `${template.title} - ${userData.firstName}`,
                        description: template.description,
                        category: template.category,
                        specialty: template.specialty,
                        priority_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
                        file_type: 'pdf',
                        file_size: Math.floor(Math.random() * 5000000) + 100000,
                        zero_g_hash: `0x${crypto.randomBytes(32).toString('hex')}`,
                        tags: [template.category, template.specialty],
                        upload_status: 'completed'
                    })
                    .select()
                    .single();

                if (!recordError) {
                    results.records.push(record);
                }
            }

            console.log(`  ✅ Patient created with ${numRecords} records`);

        } catch (error) {
            console.log(`  ❌ Error processing ${userData.username}: ${error.message}`);
            results.errors.push({ username: userData.username, error: error.message });
        }
    }

    // Create providers
    console.log('\n🏥 Creating 20 providers...\n');
    for (const userData of providerNames) {
        try {
            const walletAddress = generateAddressFromCredentials(userData.username, 'doctor123');
            
            console.log(`Creating provider: ${userData.username} (${userData.specialty})`);
            
            // Create user
            const { data: user, error: userError } = await supabase
                .from('users')
                .insert({
                    wallet_address: walletAddress,
                    username: userData.username,
                    role: 'provider',
                    email: `${userData.username}@medivet.test`,
                    is_onboarded: true
                })
                .select()
                .single();

            if (userError) {
                console.log(`  ❌ User creation failed: ${userError.message}`);
                results.errors.push({ username: userData.username, error: userError.message });
                continue;
            }

            results.users.push(user);

            // Create user profile
            const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .insert({
                    user_id: user.id,
                    first_name: userData.firstName,
                    last_name: userData.lastName,
                    date_of_birth: new Date(1960 + Math.floor(Math.random() * 25), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
                    gender: Math.random() > 0.5 ? 'male' : 'female',
                    address: `${Math.floor(Math.random() * 999)} Medical Plaza, Healthcare District, HD ${Math.floor(Math.random() * 90000) + 10000}`
                })
                .select()
                .single();

            if (!profileError) {
                results.profiles.push(profile);
            }

            console.log(`  ✅ Provider created`);

        } catch (error) {
            console.log(`  ❌ Error processing ${userData.username}: ${error.message}`);
            results.errors.push({ username: userData.username, error: error.message });
        }
    }

    // Create provider-patient relationships and permissions
    console.log('\n🔗 Creating provider-patient relationships and permissions...\n');
    
    const patients = results.users.filter(u => u.role === 'patient');
    const providers = results.users.filter(u => u.role === 'provider');
    
    for (const patient of patients) {
        // Each patient gets 2-4 providers
        const numProviders = Math.floor(Math.random() * 3) + 2;
        const selectedProviders = providers.sort(() => 0.5 - Math.random()).slice(0, numProviders);
        
        for (const provider of selectedProviders) {
            const providerData = providerNames.find(p => p.username === provider.username);
            
            // Create relationship
            const { data: relation, error: relationError } = await supabase
                .from('provider_patient_relations')
                .insert({
                    provider_id: provider.id,
                    patient_id: patient.id,
                    relationship_type: 'treating',
                    specialty: providerData?.specialty || 'general'
                })
                .select()
                .single();

            if (!relationError) {
                results.relations.push(relation);
                
                // Grant permissions to 60-80% of patient's records for this provider
                const patientRecords = results.records.filter(r => r.user_id === patient.id);
                const recordsToGrant = patientRecords.filter(() => Math.random() > 0.3); // 70% chance
                
                for (const record of recordsToGrant) {
                    const { data: permission, error: permissionError } = await supabase
                        .from('provider_permissions')
                        .insert({
                            patient_id: patient.id,
                            provider_id: provider.id,
                            record_id: record.id,
                            permission_level: Math.random() > 0.8 ? 'edit' : 'view', // 20% edit, 80% view
                            is_active: true
                        })
                        .select()
                        .single();

                    if (!permissionError) {
                        results.permissions.push(permission);
                    }
                }
                
                console.log(`  ✅ ${provider.username} -> ${patient.username} (${recordsToGrant.length} records)`);
            }
        }
    }

    return results;
}

async function main() {
    try {
        const results = await createTestUsers();
        
        console.log('\n📊 Generation Summary:');
        console.log(`✅ Users created: ${results.users.length}`);
        console.log(`   - Patients: ${results.users.filter(u => u.role === 'patient').length}`);
        console.log(`   - Providers: ${results.users.filter(u => u.role === 'provider').length}`);
        console.log(`✅ Profiles created: ${results.profiles.length}`);
        console.log(`✅ Medical records created: ${results.records.length}`);
        console.log(`✅ Provider relations created: ${results.relations.length}`);
        console.log(`✅ Record permissions created: ${results.permissions.length}`);
        
        if (results.errors.length > 0) {
            console.log(`❌ Errors: ${results.errors.length}`);
            results.errors.forEach(err => {
                console.log(`   - ${err.username}: ${err.error}`);
            });
        }

        console.log('\n🔑 Test Credentials:');
        console.log('Patients: username=<creative_name>, password=patient123');
        console.log('Providers: username=<dr_name>, password=doctor123');
        
        console.log('\n🏥 Access Model:');
        console.log('- Providers have relationships with patients');
        console.log('- Providers need explicit permissions for each medical record');
        console.log('- ~70% of records are accessible to assigned providers');
        console.log('- 80% view permissions, 20% edit permissions');
        
        console.log('\n🎯 Next Steps:');
        console.log('1. Login as provider to see assigned patients');
        console.log('2. View accessible medical records');
        console.log('3. Test permission-based access control');
        console.log('4. Upload new files and grant permissions');
        
    } catch (error) {
        console.error('❌ Script failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { generateAddressFromCredentials, createTestUsers };
