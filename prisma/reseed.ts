import { PrismaClient } from "../lib/generated/prisma/index.js";
import fs from "fs";

const prisma = new PrismaClient();

type CategoryInput = {
  catid: number | string;
  parent_catid: number | string;
  name: string;
  display_name: string;
  image: string;
  unselected_image: string | null;
  selected_image: string | null;
  level: number;
  children?: CategoryInput[] | null;
};

function flattenCategories(list: CategoryInput[]): CategoryInput[] {
  const result: CategoryInput[] = [];
  for (const cat of list) {
    result.push(cat);
    if (cat.children) {
      result.push(...flattenCategories(cat.children));
    }
  }
  return result;
}

async function run() {
  console.log("Loading data from categories_data.json...");
  const rawData = fs.readFileSync("./prisma/categories_data.json", "utf-8");
  const data: CategoryInput[] = JSON.parse(rawData);
  const flat = flattenCategories(data);

  console.log("Deleting all existing categories...");
  const deleted = await prisma.categories.deleteMany({});
  console.log(`Deleted ${deleted.count} categories.`);

  console.log(`Re-inserting ${flat.length} categories...`);

  // Use createMany for bulk insertion much faster
  const toInsert = flat.map((cat) => ({
    catid: String(cat.catid),
    parent_catid: String(cat.parent_catid),
    name: cat.name,
    display_name: cat.display_name,
    image: cat.image ?? "",
    unselected_image: cat.unselected_image ?? "",
    selected_image: cat.selected_image ?? "",
    level: cat.level,
    updated_at: new Date(),
  }));

  // Chunk to avoid payload size limits
  const BATCH_SIZE = 100;
  let inserted = 0;

  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const chunk = toInsert.slice(i, i + BATCH_SIZE);
    try {
      const result = await prisma.categories.createMany({
        data: chunk,
        skipDuplicates: true,
      });
      inserted += result.count;
      console.log(`Progress: ${inserted}/${toInsert.length}`);
    } catch (e) {
      console.error(`Error inserting chunk starting at ${i}:`, e);
    }
  }

  console.log(`Done! Successfully seeded ${inserted} categories.`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
