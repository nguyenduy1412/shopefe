import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, catid")
    .not("catid", "is", null)
    .limit(10);
  console.log("Error:", error);
  console.log("Products with catid:");
  console.dir(data, { depth: null });

  const countRes = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .not("catid", "is", null);
  console.log("Products with catid COUNT:", countRes.count);
}
check();
