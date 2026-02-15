require("dotenv").config();

console.log("Checking environment variables...");
console.log(
  "NEXT_PUBLIC_DATABASE_URL defined:",
  !!process.env.NEXT_PUBLIC_DATABASE_URL,
);
if (process.env.NEXT_PUBLIC_DATABASE_URL) {
  console.log(
    "NEXT_PUBLIC_DATABASE_URL length:",
    process.env.NEXT_PUBLIC_DATABASE_URL.length,
  );
}
console.log(
  "NEXT_PUBLIC_DIRECT_URL defined:",
  !!process.env.NEXT_PUBLIC_DIRECT_URL,
);
