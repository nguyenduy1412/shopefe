import { createClient } from "@/utils/supabase/client";
import { User } from "@/types/database";

const supabase = createClient();

export const UserService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role_id?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const {
      page = 1,
      limit = 10,
      search,
      role_id,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params || {};

    let query = supabase.from("user").select("*", { count: "exact" });

    if (search) {
      query = query.or(`username.ilike.%${search}%,fullName.ilike.%${search}%`);
    }

    if (role_id) {
      query = query.eq("role_id", role_id);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(from, to);

    return await query;
  },

  async getRoles() {
    return await supabase.from("role").select("id, name, code");
  },

  async getById(id: string) {
    return await supabase.from("user").select("*").eq("id", id).single();
  },

  async create(user: Omit<User, "createdAt" | "updatedAt" | "deletedAt">) {
    return await supabase.from("user").insert(user).select().single();
  },

  async update(id: string, updates: Partial<User>) {
    return await supabase
      .from("user")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
  },

  async delete(id: string) {
    // Soft delete if deletedAt exists, otherwise hard delete
    return await supabase
      .from("user")
      .update({ deletedAt: new Date().toISOString() })
      .eq("id", id);
  },

  async hardDelete(id: string) {
    return await supabase.from("user").delete().eq("id", id);
  },
};
