const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("=== SHOPS ===");
  const shops = await prisma.shop.findMany();
  console.log(JSON.stringify(shops, null, 2));

  console.log("\n=== SUPER ADMINS ===");
  const superAdmins = await prisma.superAdmin.findMany();
  console.log(JSON.stringify(superAdmins, null, 2));

  console.log("\n=== USERS ===");
  const users = await prisma.user.findMany();
  console.log(JSON.stringify(users, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
