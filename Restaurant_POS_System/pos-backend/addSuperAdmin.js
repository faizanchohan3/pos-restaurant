const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    const superAdmin = await prisma.superAdmin.create({
      data: {
        name: "Faizan Chohan",
        email: "faizanchohan30@gmail.com",
        password: "Fai-9090", // In production, hash this password
      },
    });
    console.log("✅ SuperAdmin created successfully!");
    console.log("Email:", superAdmin.email);
    console.log("Password:", superAdmin.password);
  } catch (error) {
    if (error.code === "P2002") {
      console.log("❌ Email already exists!");
    } else {
      console.log("❌ Error:", error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
