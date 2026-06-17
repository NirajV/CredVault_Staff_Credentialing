import { initDatabase, getDatabase } from '../src/config/database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const sampleProviders = [
  {
    npi: '1234567890',
    firstName: 'John',
    lastName: 'Smith',
    specialty: 'Cardiology',
    subSpecialty: 'Interventional Cardiology',
    email: 'john.smith@hospital.com',
    phone: '(555) 123-4567',
    employmentType: 'full_time',
    status: 'active',
    hireDate: '2020-01-15',
    complianceScore: 95
  },
  {
    npi: '1234567891',
    firstName: 'Sarah',
    lastName: 'Johnson',
    specialty: 'Oncology',
    subSpecialty: 'Medical Oncology',
    email: 'sarah.johnson@hospital.com',
    phone: '(555) 234-5678',
    employmentType: 'full_time',
    status: 'active',
    hireDate: '2019-06-01',
    complianceScore: 88
  },
  {
    npi: '1234567892',
    firstName: 'Michael',
    lastName: 'Williams',
    specialty: 'Orthopedic Surgery',
    subSpecialty: 'Sports Medicine',
    email: 'michael.williams@hospital.com',
    phone: '(555) 345-6789',
    employmentType: 'full_time',
    status: 'active',
    hireDate: '2021-03-20',
    complianceScore: 92
  },
  {
    npi: '1234567893',
    firstName: 'Emily',
    lastName: 'Brown',
    specialty: 'Pediatrics',
    subSpecialty: 'Pediatric Cardiology',
    email: 'emily.brown@hospital.com',
    phone: '(555) 456-7890',
    employmentType: 'part_time',
    status: 'active',
    hireDate: '2021-09-10',
    complianceScore: 85
  },
  {
    npi: '1234567894',
    firstName: 'David',
    lastName: 'Martinez',
    specialty: 'Neurology',
    subSpecialty: 'Neurosurgery',
    email: 'david.martinez@hospital.com',
    phone: '(555) 567-8901',
    employmentType: 'full_time',
    status: 'active',
    hireDate: '2018-05-12',
    complianceScore: 98
  },
  {
    npi: '1234567895',
    firstName: 'Jennifer',
    lastName: 'Garcia',
    specialty: 'Obstetrics & Gynecology',
    subSpecialty: 'Maternal-Fetal Medicine',
    email: 'jennifer.garcia@hospital.com',
    phone: '(555) 678-9012',
    employmentType: 'full_time',
    status: 'active',
    hireDate: '2020-07-22',
    complianceScore: 90
  },
  {
    npi: '1234567896',
    firstName: 'Robert',
    lastName: 'Davis',
    specialty: 'Pulmonology',
    subSpecialty: 'Critical Care Medicine',
    email: 'robert.davis@hospital.com',
    phone: '(555) 789-0123',
    employmentType: 'full_time',
    status: 'active',
    hireDate: '2019-11-05',
    complianceScore: 87
  },
  {
    npi: '1234567897',
    firstName: 'Lisa',
    lastName: 'Anderson',
    specialty: 'Radiology',
    subSpecialty: 'Diagnostic Radiology',
    email: 'lisa.anderson@hospital.com',
    phone: '(555) 890-1234',
    employmentType: 'full_time',
    status: 'inactive',
    hireDate: '2017-02-14',
    complianceScore: 75
  },
  {
    npi: '1234567898',
    firstName: 'James',
    lastName: 'Taylor',
    specialty: 'Gastroenterology',
    subSpecialty: 'Hepatology',
    email: 'james.taylor@hospital.com',
    phone: '(555) 901-2345',
    employmentType: 'contractor',
    status: 'active',
    hireDate: '2022-01-10',
    complianceScore: 82
  },
  {
    npi: '1234567899',
    firstName: 'Patricia',
    lastName: 'Thomas',
    specialty: 'Psychiatry',
    subSpecialty: 'Forensic Psychiatry',
    email: 'patricia.thomas@hospital.com',
    phone: '(555) 012-3456',
    employmentType: 'part_time',
    status: 'active',
    hireDate: '2021-04-18',
    complianceScore: 79
  },
  {
    npi: '1234567800',
    firstName: 'Christopher',
    lastName: 'Jackson',
    specialty: 'Urology',
    subSpecialty: 'Urologic Oncology',
    email: 'christopher.jackson@hospital.com',
    phone: '(555) 111-2222',
    employmentType: 'full_time',
    status: 'suspended',
    hireDate: '2020-08-30',
    complianceScore: 65
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...');

    await initDatabase();

    const sequelize = getDatabase();
    const Provider = sequelize.models.Provider;

    // Delete existing providers
    await Provider.destroy({ where: {} });
    console.log('🗑️  Cleared existing providers');

    // Insert sample providers
    const createdProviders = await Provider.bulkCreate(sampleProviders);
    console.log(`✅ Created ${createdProviders.length} sample providers`);

    // Display created providers
    console.log('\n📋 Sample Providers Created:');
    console.log('─'.repeat(80));
    createdProviders.forEach((provider, index) => {
      console.log(`${index + 1}. ${provider.firstName} ${provider.lastName}`);
      console.log(`   NPI: ${provider.npi} | Specialty: ${provider.specialty}`);
      console.log(`   Status: ${provider.status} | Compliance: ${provider.complianceScore}%`);
      console.log('');
    });

    console.log('─'.repeat(80));
    console.log('✨ Database seeding completed successfully!');
    console.log('\nYou can now view these providers at: http://localhost:5173/');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedDatabase();
