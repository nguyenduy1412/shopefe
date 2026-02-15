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
import { format } from "date-fns";
import {
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
} from "lucide-react";
import { useDebounce } from "use-debounce";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Params
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [tableFilter, setTableFilter] = useState("");
  const [debouncedTableFilter] = useDebounce(tableFilter, 500);
  const [minRevenue, setMinRevenue] = useState("");
  const [debouncedMinRevenue] = useDebounce(minRevenue, 500);
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
        table: debouncedTableFilter ? Number(debouncedTableFilter) : undefined,
        minRevenue: debouncedMinRevenue
          ? Number(debouncedMinRevenue)
          : undefined,
        sortBy, // Sort by revenue as requested? Or make it togglable? Let's generic sort by createdAt default but user asked for revenue filter/sort
        sortOrder,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }
      setUsers(response.data || []);
      setTotal(response.count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    debouncedSearch,
    debouncedTableFilter,
    debouncedMinRevenue,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await UserService.delete(id);
      fetchUsers();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Users
          </h1>
          <p className="text-sm text-gray-500">Manage system users</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchUsers()}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search username..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Input
            type="number"
            placeholder="Filter by Table"
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Input
            type="number"
            placeholder="Min Revenue"
            value={minRevenue}
            onChange={(e) => setMinRevenue(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("username")}
              >
                <div className="flex items-center">
                  Username {getSortIcon("username")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center">
                  Status {getSortIcon("status")}
                </div>
              </TableHead>
              <TableHead>Cookie</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("table")}
              >
                <div className="flex items-center">
                  Table {getSortIcon("table")}
                </div>
              </TableHead>
              <TableHead
                className="text-right cursor-pointer"
                onClick={() => handleSort("revenue")}
              >
                <div className="flex items-center justify-end">
                  Revenue {getSortIcon("revenue")}
                </div>
              </TableHead>
              <TableHead
                className="text-right cursor-pointer"
                onClick={() => handleSort("comm")}
              >
                <div className="flex items-center justify-end">
                  Commission {getSortIcon("comm")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center">
                  Created At {getSortIcon("createdAt")}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-4 w-[100px] rounded bg-gray-200 animate-pulse dark:bg-gray-700" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-[50px] rounded bg-gray-200 animate-pulse dark:bg-gray-700" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-[40px] rounded bg-gray-200 animate-pulse dark:bg-gray-700" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-[30px] rounded bg-gray-200 animate-pulse dark:bg-gray-700" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="ml-auto h-4 w-[80px] rounded bg-gray-200 animate-pulse dark:bg-gray-700" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="ml-auto h-4 w-[80px] rounded bg-gray-200 animate-pulse dark:bg-gray-700" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-[120px] rounded bg-gray-200 animate-pulse dark:bg-gray-700" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="ml-auto h-4 w-[40px] rounded bg-gray-200 animate-pulse dark:bg-gray-700" />
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.status === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.status === 1 ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.cookie ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">....</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(user.cookie, user.id)}
                        >
                          {copiedId === user.id ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3 text-gray-500" />
                          )}
                        </Button>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>{user.table}</TableCell>
                  <TableCell className="text-right font-medium">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(user.revenue)}
                  </TableCell>
                  <TableCell className="text-right text-gray-500">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(user.comm)}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {user.createdAt
                      ? format(new Date(user.createdAt), "dd/MM/yyyy HH:mm")
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
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of{" "}
          {total} results
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
