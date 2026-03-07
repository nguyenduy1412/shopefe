import { createClient } from "@/utils/supabase/client";
import { Category } from "@/types/database";

const supabase = createClient();

export interface CategorySearchParams {
  page?: number; // 1-indexed page number
  limit?: number; // items per page, default 20
  filters?: {
    name?: string;
    parent_catid?: string;
  };
  sort?: {
    column: "created_at" | "name" | "display_name" | "level";
    direction: "asc" | "desc";
  };
}

export interface CategorySearchResult {
  data: Category[];
  totalCount: number;
  page: number;
  totalPages: number;
}

export const CategoryService = {
  // Supports search filters, sorting, and page-based pagination
  async search({
    page = 1,
    limit = 20,
    filters,
    sort,
  }: CategorySearchParams): Promise<CategorySearchResult> {
    const sortColumn = sort?.column || "created_at";
    const sortDirection = sort?.direction || "desc";
    const isAsc = sortDirection === "asc";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("categories")
      .select("*", { count: "exact" })
      .order(sortColumn, { ascending: isAsc })
      .order("catid", { ascending: true }) // Deterministic tie-breaker
      .range(from, to);

    // Apply Filters (AND conditions)
    if (filters) {
      if (filters.name) {
        // Search in both name and display_name
        query = query.or(
          `name.ilike.%${filters.name}%,display_name.ilike.%${filters.name}%`,
        );
      }
      if (filters.parent_catid && filters.parent_catid !== "all") {
        query = query.eq("parent_catid", filters.parent_catid);
      }
    }

    // Hide level 3 (or deeper) categories globally
    query = query.lt("level", 3);

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

  // Get all parent categories (level 1 or parent_catid = "0")
  async getParents(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("parent_catid", "0")
      .lt("level", 3)
      .order("display_name", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getAll() {
    return await supabase.from("categories").select("*").lt("level", 3);
  },

  async getById(catid: string) {
    return await supabase
      .from("categories")
      .select("*")
      .eq("catid", catid)
      .single();
  },

  async create(category: Omit<Category, "created_at" | "updated_at">) {
    return await supabase.from("categories").insert(category).select().single();
  },

  async update(catid: string, updates: Partial<Category>) {
    return await supabase
      .from("categories")
      .update(updates)
      .eq("catid", catid)
      .select()
      .single();
  },

  async delete(catid: string) {
    return await supabase.from("categories").delete().eq("catid", catid);
  },
};
