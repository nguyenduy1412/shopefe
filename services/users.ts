
import { createClient } from "@/utils/supabase/client";
import { User } from "@/types/database";

const supabase = createClient();

export const UserService = {
    async getAll(params?: {
        page?: number;
        limit?: number;
        search?: string;
        table?: number;
        minRevenue?: number;
        maxRevenue?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const {
            page = 1,
            limit = 10,
            search,
            table,
            minRevenue,
            maxRevenue,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = params || {};

        let query = supabase.from("user").select("*", { count: "exact" });

        if (search) {
            query = query.ilike("username", `%${search}%`);
        }

        if (table) {
            query = query.eq("table", table);
        }

        if (minRevenue !== undefined) {
            query = query.gte("revenue", minRevenue);
        }

        if (maxRevenue !== undefined) {
            query = query.lte("revenue", maxRevenue);
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(from, to);

        return await query;
    },

    async getById(id: string) {
        return await supabase.from("user").select("*").eq("id", id).single();
    },

    async create(user: Omit<User, "createdAt" | "updatedAt" | "deletedAt">) {
        return await supabase.from("user").insert(user).select().single();
    },

    async update(id: string, updates: Partial<User>) {
        return await supabase.from("user").update(updates).eq("id", id).select().single();
    },

    async delete(id: string) {
        // Soft delete if deletedAt exists, otherwise hard delete
        return await supabase.from("user").update({ deletedAt: new Date().toISOString() }).eq("id", id);
    },

    async hardDelete(id: string) {
        return await supabase.from("user").delete().eq("id", id);
    }
};
