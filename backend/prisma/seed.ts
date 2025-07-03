import { hashSync } from "bcrypt";

import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient();

async function main() {
  const user1 = await prisma.user.create({
    data: {
      username: "admin_joko",
      password: hashSync("rahasia123", 10),
      role: "OFFICER",
    },
  });
  const user2 = await prisma.user.create({
    data: {
      username: "andi",
      password: hashSync("passwordandi", 10),
      role: "USER",
    },
  });

  const parking1 = await prisma.parking.create({
    data: {
      name: "Parkiran Mall A",
      location: "Jl. Merdeka No.10, Jakarta",
      capacity: 50,
    },
  });
  const parking2 = await prisma.parking.create({
    data: {
      name: "Parkiran Kampus B",
      location: "Jl. Sudirman No.20, Depok",
      capacity: 100,
    },
  });
  const parking3 = await prisma.parking.create({
    data: {
      name: "Parkiran Kantor C",
      location: "Jl. Gatot Subroto No.30, Bandung",
      capacity: 75,
    },
  });
}

main()
  .catch((e) => {
    console.error("Error when seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
