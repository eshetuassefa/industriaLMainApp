// prisma/seed.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const regions = [
  { id: "1", name: "Tigray Region" },
  { id: "2", name: "Afar Region" },
  { id: "3", name: "Amhara Region" },
  { id: "4", name: "Oromia Region" },
  { id: "5", name: "Somali Region" },
  { id: "6", name: "Benishangul-Gumuz Region" },
  {
    id: "7",
    name: "Southern Nations, Nationalities and Peoples Region (SNNPR) ",
  },
  { id: "8", name: "Gambela Region" },
  { id: "9", name: "Harari Region" },
  { id: "10", name: "Addis Ababa City Administration" },
  { id: "11", name: "Dire Dawa City Administration" },
  { id: "12", name: "Sidama Region " },
  { id: "13", name: "South West Ethiopia Peoples' Region " },
  { id: "14", name: "South Ethiopia Region " },
];

async function main() {
  for (const region of regions) {
    await prisma.region.create({
      data: region,
    });
  }

  console.log("Ethiopian regions seeded successfully !");
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
