
import { createClient } from "@/utils/supabase/client";
import { Shop } from "@/types/database";

const supabase = createClient();

export const ShopService = {
    async getAll() {
        return await supabase.from("shops").select("*");
    },

    async getById(id: string) {
        return await supabase.from("shops").select("*").eq("id", id).single();
    },

    async create(shop: Partial<Shop>) {
        return await supabase.from("shops").insert(shop).select().single();
    },

    async update(id: string, updates: Partial<Shop>) {
        return await supabase.from("shops").update(updates).eq("id", id).select().single();
    },

    async delete(id: string) {
        return await supabase.from("shops").delete().eq("id", id);
    },
};
