"use client";

import { useEffect, useState, useCallback } from "react";
import { CategoryService, CategorySearchParams } from "@/services/categories";
import { Category } from "@/types/database";
import { useApi } from "@/hooks/useApi";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Format timestamp that's already in milliseconds or ISO format
function formatTimestamp(value: string | number | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}

export default function CategoryTable() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [parents, setParents] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [params, setParams] = useState<CategorySearchParams>({
    limit: 20,
    sort: { column: "name", direction: "asc" },
    filters: {},
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string>("all");
  const [showParentDropdown, setShowParentDropdown] = useState(false);
  const [showLimitDropdown, setShowLimitDropdown] = useState(false);

  const { loading, execute: fetchCategories } = useApi(CategoryService.search);

  // Load parent categories on mount
  useEffect(() => {
    CategoryService.getParents()
      .then((data) => {
        setParents(data);
      })
      .catch((err) => console.error("Failed to load parent categories", err));
  }, []);

  // Load categories for current page
  const loadCategories = useCallback(
    async (targetPage: number) => {
      try {
        const currentParams: CategorySearchParams = {
          ...params,
          page: targetPage,
        };

        if (searchTerm) {
          currentParams.filters = {
            ...currentParams.filters,
            name: searchTerm,
          };
        }

        const response = await fetchCategories(currentParams);
        setCategories(response.data);
        setTotalPages(response.totalPages);
        setTotalCount(response.totalCount);
        setPage(response.page);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    },
    [params, searchTerm, fetchCategories],
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setParams((prev) => ({
        ...prev,
        filters: { ...prev.filters, name: searchTerm },
      }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reload when params change → always reset to page 1
  useEffect(() => {
    loadCategories(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.limit, params.sort, params.filters]);

  type SortColumn = NonNullable<CategorySearchParams["sort"]>["column"];

  const handleSort = (column: SortColumn) => {
    setParams((prev) => ({
      ...prev,
      sort: {
        column,
        direction:
          prev.sort?.column === column && prev.sort.direction === "asc"
            ? "desc"
            : "asc", // Toggled default from asc instead of desc
      },
    }));
  };

  const getSortIcon = (column: string) => {
    if (params.sort?.column !== column)
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    return params.sort.direction === "desc" ? (
      <ArrowDown className="w-4 h-4 ml-1 text-blue-500" />
    ) : (
      <ArrowUp className="w-4 h-4 ml-1 text-blue-500" />
    );
  };

  const selectedParentName =
    selectedParentId === "all"
      ? "Tất cả danh mục cha"
      : parents.find((p) => p.catid === selectedParentId)?.display_name ||
        "Danh mục cha";

  // Generate page numbers to display
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const COLUMNS_COUNT = 7; // Adjust based on table

  return (
    <Card className="w-full">
      {/* Filters and Search */}
      <div className="p-4 border-b border-border/40 flex flex-wrap gap-3 items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Parent Category Filter */}
          <div className="relative">
            <button
              onClick={() => setShowParentDropdown((v) => !v)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-150 ${
                selectedParentId !== "all"
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-400"
                  : "border-border/60 text-muted-foreground hover:bg-muted/40 dark:border-white/10 dark:hover:bg-white/5"
              }`}
            >
              <Filter className="w-4 h-4" />
              {selectedParentName}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showParentDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {showParentDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowParentDropdown(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 z-50 w-64 rounded-xl border border-border/60 bg-card shadow-lg dark:border-white/10 dark:shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto">
                  <div className="p-1.5 flex flex-col gap-0.5">
                    <button
                      onClick={() => {
                        setSelectedParentId("all");
                        setParams((prev) => ({
                          ...prev,
                          filters: { ...prev.filters, parent_catid: "all" },
                        }));
                        setShowParentDropdown(false);
                      }}
                      className={`text-left px-3 py-2 text-sm rounded-md transition-colors hover:bg-muted/50 dark:hover:bg-white/5 ${
                        selectedParentId === "all"
                          ? "bg-blue-50 text-blue-600 font-medium dark:bg-blue-500/10 dark:text-blue-400"
                          : ""
                      }`}
                    >
                      Tất cả danh mục gốc (Bỏ lọc)
                    </button>

                    <div className="h-px bg-border/40 mx-2 my-1 dark:bg-white/5" />

                    {parents.map((parent) => (
                      <button
                        key={parent.catid}
                        onClick={() => {
                          setSelectedParentId(parent.catid);
                          setParams((prev) => ({
                            ...prev,
                            filters: {
                              ...prev.filters,
                              parent_catid: parent.catid,
                            },
                          }));
                          setShowParentDropdown(false);
                        }}
                        className={`text-left px-3 py-2 text-sm rounded-md transition-colors hover:bg-muted/50 dark:hover:bg-white/5 ${
                          selectedParentId === parent.catid
                            ? "bg-blue-50 text-blue-600 font-medium dark:bg-blue-500/10 dark:text-blue-400"
                            : ""
                        }`}
                      >
                        {parent.display_name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto min-h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">STT</TableHead>
              <TableHead className="w-24">Cat ID</TableHead>
              <TableHead
                onClick={() => handleSort("name")}
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  Tên hiển thị {getSortIcon("name")}
                </div>
              </TableHead>
              <TableHead>Tên gốc (Ngôn ngữ T.Anh)</TableHead>
              <TableHead>Parent ID</TableHead>
              <TableHead
                onClick={() => handleSort("level")}
                className="cursor-pointer text-center"
              >
                <div className="flex items-center justify-center">
                  Cấp độ {getSortIcon("level")}
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort("created_at")}
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  Ngày tạo {getSortIcon("created_at")}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: COLUMNS_COUNT }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-5 rounded w-full skeleton-shimmer"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : categories.map((cat, index) => (
                  <TableRow key={cat.catid}>
                    <TableCell className="text-center text-muted-foreground font-medium">
                      {(page - 1) * (params.limit || 20) + index + 1}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-blue-600 dark:text-blue-400">
                      {cat.catid}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {cat.display_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {cat.name}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {cat.parent_catid === "0" ? "-" : cat.parent_catid}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          cat.level === 1
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300"
                            : cat.level === 2
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        Lvl {cat.level}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatTimestamp(cat.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
            {!loading && categories.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={COLUMNS_COUNT}
                  className="h-24 text-center text-muted-foreground"
                >
                  Không tìm thấy danh mục.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="p-4 flex items-center justify-between border-t border-border/40 gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm text-muted-foreground">
            Hiển thị{" "}
            {categories.length > 0 ? (page - 1) * (params.limit || 20) + 1 : 0}–
            {Math.min(page * (params.limit || 20), totalCount)} trong{" "}
            {totalCount} danh mục
          </span>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Số dòng/trang:
            </span>
            <div className="relative">
              <button
                onClick={() => setShowLimitDropdown((v) => !v)}
                className="flex items-center justify-between w-16 px-2 py-1.5 text-sm font-medium border rounded-md border-border/60 bg-background hover:bg-muted/40 dark:border-white/10 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Thay đổi số lượng hiển thị"
              >
                {params.limit}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </button>

              {showLimitDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowLimitDropdown(false)}
                  />
                  <div className="absolute bottom-full mb-1 left-0 z-50 w-36 p-1.5 rounded-lg border border-border/60 bg-card shadow-xl dark:border-white/10 animate-in fade-in slide-in-from-bottom-2">
                    {[20, 40, 60, 100].map((val) => (
                      <button
                        key={val}
                        onClick={() => {
                          setParams((prev) => ({ ...prev, limit: val }));
                          setShowLimitDropdown(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors cursor-pointer hover:bg-muted dark:hover:bg-white/10 ${
                          params.limit === val
                            ? "bg-blue-50 text-blue-600 font-medium dark:bg-blue-500/10 dark:text-blue-400"
                            : "text-foreground"
                        }`}
                      >
                        {val}
                      </button>
                    ))}

                    <div className="h-px bg-border/40 my-1.5 mx-1 dark:bg-white/10" />

                    <div
                      className="px-1 py-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Input
                        type="number"
                        placeholder="Nhập tuỳ ý..."
                        className="h-8 text-[13px] px-2 w-full focus-visible:ring-1 focus-visible:ring-blue-500 font-sans"
                        defaultValue={params.limit}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const val = parseInt(e.currentTarget.value);
                            if (!isNaN(val) && val > 0) {
                              setParams((prev) => ({ ...prev, limit: val }));
                              setShowLimitDropdown(false);
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => loadCategories(page - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {getPageNumbers().map((p, idx) =>
            p === "..." ? (
              <span key={`dots-${idx}`} className="px-2 text-gray-400">
                ...
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="sm"
                disabled={loading}
                onClick={() => loadCategories(p as number)}
                className="min-w-[36px]"
              >
                {p}
              </Button>
            ),
          )}

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => loadCategories(page + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
