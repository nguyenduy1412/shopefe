import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSearch() {
  const catidArray = [100629]; // As number!
  
  console.log("Testing search with catid filter:", catidArray);
  
  let query = supabase
    .from('products')
    .select('*, categories(catid, display_name, name, parent_catid)', { count: 'exact' });
    
  query = query.in('catid', catidArray as any);
  
  const { data, count, error } = await query;
  
  console.log("Error:", error);
  console.log("Count:", count);
  console.log("Data length:", data?.length);
}

testSearch();
