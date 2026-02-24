
import { createClient } from "@/utils/supabase/client";
import { Product } from "@/types/database";

const supabase = createClient();

export interface ProductSearchParams {
    page?: number;       // 1-indexed page number
    limit?: number;      // items per page, default 20
    filters?: {
        name?: string;
        shop_id?: string;
        type?: string[];  // array of selected types
        flash_sale_start_before?: number;
        flash_sale_end_before?: number;
    };
    sort?: {
        column: "created_at" | "price" | "sold" | "comm" | "comm_rate";
        direction: "asc" | "desc";
    };
}

export interface ProductSearchResult {
    data: Product[];
    totalCount: number;
    page: number;
    totalPages: number;
}

export const ProductService = {
    // Supports search filters, sorting, and page-based pagination
    async search({ page = 1, limit = 20, filters, sort }: ProductSearchParams): Promise<ProductSearchResult> {
        const sortColumn = sort?.column || "created_at";
        const sortDirection = sort?.direction || "desc";
        const isAsc = sortDirection === "asc";

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase
            .from("products")
            .select("*", { count: "exact" })
            .order(sortColumn, { ascending: isAsc })
            .order("id", { ascending: true }) // Deterministic tie-breaker
            .range(from, to);

        // Apply Filters (AND conditions)
        if (filters) {
            if (filters.name) {
                query = query.ilike("name", `%${filters.name}%`);
            }
            if (filters.shop_id) {
                query = query.eq("shop_id", filters.shop_id);
            }
            if (filters.type && filters.type.length > 0) {
                query = query.in("type", filters.type);
            }
            if (filters.flash_sale_start_before != null) {
                query = query.not("flash_sale_start", "is", null)
                    .lte("flash_sale_start", filters.flash_sale_start_before);
            }
            if (filters.flash_sale_end_before != null) {
                query = query.not("flash_sale_end", "is", null)
                    .lte("flash_sale_end", filters.flash_sale_end_before);
            }
        }

        const { data, error, count } = await query;
        if (error) throw error;

        const totalCount = count ?? 0;
        const totalPages = Math.ceil(totalCount / limit);

        return {
            data: data || [],
            totalCount,
            page,
            totalPages,
        };
    },

    // Get all distinct product types
    async getTypes(): Promise<string[]> {
        // Query distinct types — Supabase doesn't have native DISTINCT,
        // so we select type column and dedupe client-side
        const { data, error } = await supabase
            .from("products")
            .select("type")
            .limit(1000);
        if (error) throw error;
        const types = [...new Set((data || []).map((d: { type: string }) => d.type))].filter(Boolean).sort();
        return types;
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
