import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching categories...");
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("catid, name, display_name");
  if (catError) {
    console.error("Error fetching categories:", catError);
    return;
  }
  console.log(`Loaded ${categories.length} categories`);

  console.log("Fetching unique product types...");
  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("id, name, type, catid")
    .limit(100);
  if (prodError) {
    console.error("Error fetching products:", prodError);
    return;
  }

  // Just log a few products to see what they look like
  console.log("Sample products:");
  for (const p of products.slice(0, 10)) {
    console.log(
      `- ID: ${p.id}, Type: ${p.type}, Name: ${p.name.substring(0, 30)}...`,
    );
  }

  // Count products by type to see the distribution
  const typeCounts: Record<string, number> = {};
  for (const p of products) {
    typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
  }
  console.log("Product types in sample:", typeCounts);
}

run();
