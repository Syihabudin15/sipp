import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

async function main() {
  const role = await prisma.role.upsert({
    where: { name: "Developer" },
    create: {
      id: "RL-001",
      name: "Developer",
      permission: JSON.stringify([
        { name: "Dashboard", path: "/dashboard", access: ["read"] },
        {
          name: "Role Manajemen",
          path: "/configs/roles",
          access: ["read", "write", "update", "delete"],
        },
        {
          name: "User Manajemen",
          path: "/configs/roles",
          access: ["read", "write", "update", "delete"],
        },
      ]),
      status: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    update: {},
  });
  const area = await prisma.area.upsert({
    where: { id: "A-001" },
    create: {
      id: "A-001",
      name: "JAWA BARAT",
    },
    update: {},
  });
  const cabang = await prisma.cabang.upsert({
    where: { id: "AC-001" },
    create: {
      id: "AC-001",
      name: "PUSAT",
      areaId: area.id,
    },
    update: {},
  });
  const pass = await bcrypt.hash("Tsani182", 10);
  await prisma.user.upsert({
    where: { username: "syihabudin" },
    update: {},
    create: {
      id: "USR-001",
      fullname: "SYIHABUDIN TSANI",
      username: "syihabudin",
      password: pass,
      email: "syihabudin@gmail.com",
      phone: "0881022157439",
      nip: "202512AC0001001",
      cabangId: cabang.id,
      status: true,
      created_at: new Date(),
      updated_at: new Date(),
      roleId: role.id,
    },
  });

  console.log("Seeding succeesfully...");
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
