import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'superadmin@example.com';

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('❗ Superadmin already exists.');
    return;
  }

  const hashedPassword = await bcrypt.hash('supersecure123', 10);

  const person = await prisma.person.create({
    data: {
      firstName: 'Super',
      middleName: 'Admin',
      lastName: 'User',
      sex: 'Male',
      dob: new Date('1980-01-01'),
      phoneNumber: '1234567890',
      address: 'Admin HQ',
    },
  });

const user = await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    role: "SUPERADMIN",
 
    personId: person.id,
  },
});

  console.log('✅ Superadmin created:', user);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
