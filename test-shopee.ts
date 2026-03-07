import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: recent } = await supabase
    .from("products")
    .select("*")
    .limit(3)
    .order("created_at", { ascending: false });
  console.log("Recent products manually checked:", recent);

  // Since we know the import system generated some catids like 100629
  // Let's create a temporary map if we can or check the actual categories table
  const { data: categories } = await supabase
    .from("categories")
    .select("catid, name, display_name");

  if (recent && recent.length > 0) {
    const p = recent[0];
    console.log("Product catid is:", p.catid);
  }
}

run();
