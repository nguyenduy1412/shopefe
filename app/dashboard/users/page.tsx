"use client";

import { useEffect, useState, useCallback } from "react";
import { UserService } from "@/services/users";
import { User } from "@/types/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { formatICTDateTime } from "@/lib/timezone";

import {
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useDebounce } from "use-debounce";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<
    { id: string; name: string; code: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Params
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc"); // Default to desc for new column
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await UserService.getAll({
        page,
        limit,
        search: debouncedSearch || undefined,
        role_id: roleFilter !== "all" ? roleFilter : undefined,
        sortBy,
        sortOrder,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }
      setUsers(response.data || []);
      setTotal(response.count || 0);
    } catch {
      // setError(err instanceof Error ? err.message : "Lỗi tải người dùng");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, roleFilter, sortBy, sortOrder]);

  const fetchRoles = useCallback(async () => {
    try {
      const { data } = await UserService.getRoles();
      if (data) setRoles(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này không?")) return;
    try {
      await UserService.delete(id);
      fetchUsers();
    } catch {
      alert("Xóa người dùng thất bại");
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Người dùng
          </h1>
          <p className="text-sm text-gray-500">Quản lý người dùng hệ thống</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchUsers()}>
            Làm mới
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Tìm tên nhân viên, email..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select
            value={roleFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setRoleFilter(e.target.value)
            }
          >
            <option value="all">Tất cả phân quyền</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="rounded-lg border bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("fullName")}
              >
                <div className="flex items-center">
                  Tên người dùng {getSortIcon("fullName")}
                </div>
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phân quyền</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center">
                  Trạng thái {getSortIcon("status")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center">
                  Ngày tạo {getSortIcon("createdAt")}
                </div>
              </TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-4 w-[120px] rounded skeleton-shimmer" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-[150px] rounded skeleton-shimmer" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-[100px] rounded skeleton-shimmer" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-[80px] rounded skeleton-shimmer" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-[120px] rounded skeleton-shimmer" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="ml-auto h-4 w-[40px] rounded skeleton-shimmer" />
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Không tìm thấy người dùng.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.fullName || "Tài khoản Nội bộ"}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {user.username}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {roles.find(
                        (r) =>
                          r.id ===
                          (user as User & { role_id?: string }).role_id,
                      )?.name || "Chưa cấp quyền"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.status === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.status === 1 ? "Hoạt động" : "Không HĐ"}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {user.createdAt
                      ? formatICTDateTime(new Date(user.createdAt))
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Hiển thị {(page - 1) * limit + 1} đến {Math.min(page * limit, total)}{" "}
          trong {total} kết quả
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            Tiếp
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
