
import { createClient } from "@/utils/supabase/client";
import { Product } from "@/types/database";

const supabase = createClient();

export interface ProductSearchParams {
    cursor?: string | number; // Value of the sort column for the last item
    limit?: number;
    filters?: {
        name?: string;
        shop_id?: string;
        type?: string;
    };
    sort?: {
        column: "created_at" | "price" | "sold" | "comm" | "comm_rate";
        direction: "asc" | "desc";
    };
}

export const ProductService = {
    // Supports search filters, sorting, and cursor-based pagination
    async search({ cursor, limit = 10, filters, sort }: ProductSearchParams) {
        // Default sort: created_at DESC
        const sortColumn = sort?.column || "created_at";
        const sortDirection = sort?.direction || "desc";
        const isAsc = sortDirection === "asc";

        let query = supabase
            .from("products")
            .select("*")
            .order(sortColumn, { ascending: isAsc })
            .order("id", { ascending: true }) // Deterministic tie-breaker
            .limit(limit);

        // Apply cursor (pagination)
        // Using simple value cursor. Note: For non-unique columns like 'price',
        // robust cursor pagination requires (value, id) tuple comparison.
        // This implementation uses the value only, which is sufficient for basic cases
        // but might skip items if many share the exact same sort value on page boundaries.
        if (cursor !== undefined && cursor !== null) {
            if (isAsc) {
                query = query.gt(sortColumn, cursor);
            } else {
                query = query.lt(sortColumn, cursor);
            }
        }

        // Apply Filters (AND conditions)
        if (filters) {
            if (filters.name) {
                query = query.ilike("name", `%${filters.name}%`);
            }
            if (filters.shop_id) {
                query = query.eq("shop_id", filters.shop_id);
            }
            if (filters.type) {
                query = query.eq("type", filters.type);
            }
        }

        const { data, error } = await query;
        if (error) throw error;

        // Determine the next cursor
        const nextCursor =
            data && data.length === limit ? data[data.length - 1][sortColumn] : null;

        return {
            data: data || [],
            nextCursor,
        };
    },

    async getById(id: string) {
        return await supabase.from("products").select("*").eq("id", id).single();
    },

    async create(product: Omit<Product, "created_at" | "updated_at">) {
        return await supabase.from("products").insert(product).select().single();
    },

    async update(id: string, updates: Partial<Product>) {
        return await supabase.from("products").update(updates).eq("id", id).select().single();
    },

    async delete(id: string) {
        return await supabase.from("products").delete().eq("id", id);
    },
};
