// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();
// const regions = [
//   { id: 1, name: "Tigray Region" },
//   { id: 2, name: "Afar Region" },
//   { id: 3, name: "Amhara Region" },
//   { id: 4, name: "Oromia Region" },
//   { id: 5, name: "Somali Region" },
//   { id: 6, name: "Benishangul-Gumuz Region" },
//   {
//     id: 7,
//     name: "Southern Nations, Nationalities and Peoples Region (SNNPR)",
//   },
//   { id: 8, name: "Gambela Region" },
//   { id: 9, name: "Harari Region" },
//   { id: 10, name: "Addis Ababa City Administration" },
//   { id: 11, name: "Dire Dawa City Administration" },
//   { id: 12, name: "Sidama Region" },
//   { id: 13, name: "South West Ethiopia Peoples' Region" },
//   { id: 14, name: "South Ethiopia Region" },
// ];


// async function main() {
//   for (const region of regions) {
//     await prisma.region.create({
//       data: region,
//     });
//   }

//   console.log("Ethiopian regions seeded successfully!");
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });







import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const regions = [
  { id: 1, name: "Tigray Region" },
  { id: 2, name: "Afar Region" },
  { id: 3, name: "Amhara Region" },
  { id: 4, name: "Oromia Region" },
  { id: 5, name: "Somali Region" },
  { id: 6, name: "Benishangul-Gumuz Region" },
  {
    id: 7,
    name: "Southern Nations, Nationalities and Peoples Region (SNNPR)",
  },
  { id: 8, name: "Gambela Region" },
  { id: 9, name: "Harari Region" },
  { id: 10, name: "Addis Ababa City Administration" },
  { id: 11, name: "Dire Dawa City Administration" },
  { id: 12, name: "Sidama Region" },
  { id: 13, name: "South West Ethiopia Peoples' Region" },
  { id: 14, name: "South Ethiopia Region" },
];

const testTypes = [
  {
    name: "Complete Blood Count",
    code: "CBC",
    specimens: ["Blood"],
    duration: 1,
  },
  {
    name: "Lipid Profile",
    code: "LIPID",
    specimens: ["Blood"],
    duration: 2,
  },
  {
    name: "Liver Function Test",
    code: "LFT",
    specimens: ["Blood"],
    duration: 3,
  },
  {
    name: "Kidney Function Test",
    code: "KFT",
    specimens: ["Blood"],
    duration: 3,
  },
  {
    name: "Thyroid Stimulating Hormone",
    code: "TSH",
    specimens: ["Blood"],
    duration: 2,
  },
  {
    name: "Blood Glucose Fasting",
    code: "BGF",
    specimens: ["Blood"],
    duration: 1,
  },
  {
    name: "Urinalysis",
    code: "UA",
    specimens: ["Urine"],
    duration: 1,
  },
  {
    name: "COVID-19 PCR",
    code: "COVIDPCR",
    specimens: ["Nasal Swab"],
    duration: 24,
  },
  {
    name: "HbA1c",
    code: "HBA1C",
    specimens: ["Blood"],
    duration: 2,
  },
  {
    name: "Electrolyte Panel",
    code: "ELECT",
    specimens: ["Blood"],
    duration: 3,
  },
  {
    name: "Vitamin D Test",
    code: "VITD",
    specimens: ["Blood"],
    duration: 3,
  },
  {
    name: "Pregnancy Test",
    code: "PREG",
    specimens: ["Urine", "Blood"],
    duration: 1,
  },
  {
    name: "C-Reactive Protein",
    code: "CRP",
    specimens: ["Blood"],
    duration: 2,
  },
  {
    name: "Prostate Specific Antigen",
    code: "PSA",
    specimens: ["Blood"],
    duration: 2,
  },
  {
    name: "D-Dimer",
    code: "DDIMER",
    specimens: ["Blood"],
    duration: 4,
  },
];

async function main() {
  // Seed regions
  for (const region of regions) {
    await prisma.region.upsert({
      where: { id: region.id },
      update: {},
      create: region,
    });
  }
  console.log("Ethiopian regions seeded successfully!");

  // Seed test types
  for (const testType of testTypes) {
    await prisma.testType.upsert({
      where: { code: testType.code },
      update: {},
      create: testType,
    });
  }
  console.log("Test types seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
