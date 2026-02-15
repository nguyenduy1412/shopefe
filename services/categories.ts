
import { createClient } from "@/utils/supabase/client";
import { Category } from "@/types/database";

const supabase = createClient();

export const CategoryService = {
    async getAll() {
        return await supabase.from("categories").select("*");
    },

    async getById(catid: string) {
        return await supabase.from("categories").select("*").eq("catid", catid).single();
    },

    async create(category: Omit<Category, "created_at" | "updated_at">) {
        return await supabase.from("categories").insert(category).select().single();
    },

    async update(catid: string, updates: Partial<Category>) {
        return await supabase.from("categories").update(updates).eq("catid", catid).select().single();
    },

    async delete(catid: string) {
        return await supabase.from("categories").delete().eq("catid", catid);
    },
};
