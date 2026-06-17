import { initDatabase, getDatabase } from '../src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const generateFakeDate = (yearsAgo = 3) => {
  const now = new Date();
  const date = new Date(now.getFullYear() - yearsAgo, Math.random() * 12, Math.random() * 28 + 1);
  return date.toISOString().split('T')[0];
};

const generateExpiryDate = (yearsFromNow = 2) => {
  const now = new Date();
  const date = new Date(now.getFullYear() + yearsFromNow, Math.random() * 12, Math.random() * 28 + 1);
  return date.toISOString().split('T')[0];
};

const states = ['CA', 'NY', 'TX', 'FL', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI'];
const specialties = ['Cardiology', 'Oncology', 'Orthopedic Surgery', 'Pediatrics', 'Neurology', 'OB/GYN', 'Pulmonology', 'Radiology', 'Gastroenterology', 'Psychiatry', 'Urology'];
const certifications = [
  { name: 'American Board of Internal Medicine', body: 'ABIM' },
  { name: 'American Board of Surgery', body: 'ABS' },
  { name: 'American Board of Pediatrics', body: 'ABP' },
  { name: 'American Board of Psychiatry', body: 'ABPsy' },
  { name: 'American Board of Radiology', body: 'ABR' },
  { name: 'Board Certification in Cardiology', body: 'ACC' },
  { name: 'Board Certification in Orthopedic Surgery', body: 'ABOS' },
];

const seedCredentials = async () => {
  try {
    console.log('🌱 Seeding credentials for all providers...');
    
    await initDatabase();
    const sequelize = getDatabase();
    const { Provider, License, Certification, DEA, Malpractice, Privilege, Task } = sequelize.models;

    const providers = await Provider.findAll();
    console.log(`📋 Found ${providers.length} providers`);

    for (const provider of providers) {
      console.log(`\n👤 Adding credentials for ${provider.firstName} ${provider.lastName}...`);

      // Add 2 Licenses
      for (let i = 0; i < 2; i++) {
        const state = states[i % states.length];
        await License.create({
          providerId: provider.id,
          state,
          licenseNumber: `MD-${state}-${2019 + i}-${Math.random().toString().slice(2, 8)}`,
          licenseType: 'MD',
          issueDate: generateFakeDate(3 + i),
          expiryDate: generateExpiryDate(2 - i),
          status: Math.random() > 0.2 ? 'active' : 'expired',
          psvStatus: 'verified'
        });
      }

      // Add 2 Certifications
      for (let i = 0; i < 2; i++) {
        const cert = certifications[Math.floor(Math.random() * certifications.length)];
        await Certification.create({
          providerId: provider.id,
          certName: cert.name,
          certifyingBody: cert.body,
          certificateNumber: `CERT-${Date.now()}-${i}`,
          issueDate: generateFakeDate(4),
          expiryDate: generateExpiryDate(3),
          status: 'active',
          psvStatus: 'verified'
        });
      }

      // Add 1 DEA Registration
      await DEA.create({
        providerId: provider.id,
        deaNumber: `AS${Math.random().toString().slice(2, 10)}`,
        state: states[Math.floor(Math.random() * states.length)],
        issueDate: generateFakeDate(2),
        expiryDate: generateExpiryDate(2),
        status: 'active',
        schedulesAuthorized: '1,2,3,4,5',
        psvStatus: 'verified'
      });

      // Add 1 Malpractice Insurance
      await Malpractice.create({
        providerId: provider.id,
        carrier: ['The Doctors Company', 'NCMB', 'AMA Liability Insurance', 'ProAssurance', 'Midwest Medical Insurance'][Math.floor(Math.random() * 5)],
        policyNumber: `POL-${Date.now()}-${Math.random().toString().slice(2, 6)}`,
        policyType: Math.random() > 0.5 ? 'occurrence' : 'claims_made',
        coveragePerClaim: 1000000,
        aggregateLimit: 5000000,
        effectiveDate: generateFakeDate(1),
        expiryDate: generateExpiryDate(1),
        tailCoverage: true,
        status: 'active',
        psvStatus: 'verified'
      });

      // Add 2 Privileges
      for (let i = 0; i < 2; i++) {
        await Privilege.create({
          providerId: provider.id,
          facilityId: null,
          privilegeType: i === 0 ? 'surgical' : 'clinical',
          procedures: JSON.stringify(['36415', '36410', '92004']),
          grantedDate: generateFakeDate(2),
          expiryDate: generateExpiryDate(2),
          approvalStatus: Math.random() > 0.1 ? 'approved' : 'pending',
          restrictions: i === 0 ? 'Requires supervision for complex procedures' : null,
          scopeOfPractice: `${provider.specialty} procedures`
        });
      }

      // Add 1-2 Tasks
      const numTasks = Math.random() > 0.5 ? 2 : 1;
      for (let i = 0; i < numTasks; i++) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + Math.random() * 30 + 5);
        
        await Task.create({
          providerId: provider.id,
          assignedTo: 'Credentialing Team',
          taskType: ['credential_renewal', 'document_upload', 'verification'][Math.floor(Math.random() * 3)],
          title: `${['Renew', 'Verify', 'Update'][i]} credentials for ${provider.firstName} ${provider.lastName}`,
          description: `Complete ${['license renewal', 'certification verification', 'document upload'][i % 3]}`,
          dueDate: dueDate.toISOString().split('T')[0],
          status: Math.random() > 0.7 ? 'completed' : 'pending',
          priority: Math.random() > 0.7 ? 'high' : 'medium'
        });
      }

      console.log(`   ✅ Added credentials for ${provider.firstName} ${provider.lastName}`);
    }

    console.log('\n✨ Credential seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedCredentials();
