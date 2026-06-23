import prisma from "../../src/infrastructure/database/prisma/client";

const SKILL_NAMES = [
  "Java",
  "JavaScript",
  "Python",
  "Git",
  "SQL",
  "C++",
  "TypeScript",
  "C#",
  "Docker",
  "PHP",
  "React",
  "MongoDB",
  "Toad",
  "HTML CCS 3",
  "MS SQL server",
];

async function main() {
  for (const name of SKILL_NAMES) {
    const existing = await prisma.skill.findFirst({
      where: { name, level: "Basic" },
    });
    if (existing) {
      console.log(`skip  : ${name} (already exists)`);
      continue;
    }
    await prisma.skill.create({ data: { name, level: "Basic" } });
    console.log(`create: ${name}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
