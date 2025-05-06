import { PrismaClient, RoleType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if superadmin already exists
    const existingSuperadmin = await prisma.user.findFirst({
      where: {
        role: RoleType.SUPERADMIN
      }
    });

    if (existingSuperadmin) {
      console.log('Superadmin already exists, skipping creation');
      return;
    }

    // Create person record for superadmin
    const person = await prisma.person.create({
      data: {
        firstName: 'Super',
        lastName: 'Admin',
        sex: 'UNKNOWN',
        dob: new Date(),
        phoneNumber: '+251900000000',
        address: 'System Address'
      }
    });

    // Hash password
    const hashedPassword = await bcrypt.hash('superadmin123', 10);

    // Create superadmin user
    const superadmin = await prisma.user.create({
      data: {
        email: 'superadmin@system.com',
        password: hashedPassword,
        role: RoleType.SUPERADMIN,
        personId: person.id
      },
      include: {
        person: true
      }
    });

    console.log('Superadmin created successfully:', {
      id: superadmin.id,
      email: superadmin.email,
      role: superadmin.role,
      person: superadmin.person
    });
  } catch (error) {
    console.error('Error creating superadmin:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 