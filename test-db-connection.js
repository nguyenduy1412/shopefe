const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

console.log(
  "DATABASE_URL:",
  process.env.DATABASE_URL ? "Defined" : "Undefined",
);
if (process.env.DATABASE_URL) {
  console.log(
    "DATABASE_URL starts with:",
    process.env.DATABASE_URL.substring(0, 10),
  );
}

console.log("DIRECT_URL:", process.env.DIRECT_URL ? "Defined" : "Undefined");

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log("Successfully connected to database");
  } catch (e) {
    console.error("Connection failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
