import { PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

type CategoryInput = {
  catid: number;
  parent_catid: number;
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

async function main() {
  // Load data from JSON file
  const data: CategoryInput[] = require("./categories_data.json");
  const flat = flattenCategories(data);

  console.log(`Inserting ${flat.length} categories...`);

  for (const cat of flat) {
    await prisma.categories.upsert({
      where: { catid: String(cat.catid) },
      update: {
        parent_catid: String(cat.parent_catid),
        name: cat.name,
        display_name: cat.display_name,
        image: cat.image ?? "",
        unselected_image: cat.unselected_image ?? "",
        selected_image: cat.selected_image ?? "",
        level: cat.level,
        updated_at: new Date(),
      },
      create: {
        catid: String(cat.catid),
        parent_catid: String(cat.parent_catid),
        name: cat.name,
        display_name: cat.display_name,
        image: cat.image ?? "",
        unselected_image: cat.unselected_image ?? "",
        selected_image: cat.selected_image ?? "",
        level: cat.level,
        updated_at: new Date(),
      },
    });
  }

  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
