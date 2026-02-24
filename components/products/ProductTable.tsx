"use client";

import { useEffect, useState, useCallback } from "react";
import { ProductService, ProductSearchParams } from "@/services/products";
import { Product } from "@/types/database";
import { useApi } from "@/hooks/useApi";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  ChevronLeft,
  ChevronRight,
  ListFilter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Format timestamp that's already in milliseconds
function formatTimestamp(value: number | null | undefined): string {
  if (!value) return "-";
  const date = new Date(Number(value));
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}

// Format sold number: 1500 → 1.5k, 1200000 → 1.2tr
function formatSold(value: number): string {
  if (value >= 1_000_000) {
    const tr = value / 1_000_000;
    return tr % 1 === 0 ? `${tr}tr` : `${tr.toFixed(1)}tr`;
  }
  if (value >= 1_000) {
    const k = value / 1_000;
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`;
  }
  return value.toString();
}

export default function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [typeOptions, setTypeOptions] = useState<string[]>([]);
  const [params, setParams] = useState<ProductSearchParams>({
    limit: 20,
    sort: { column: "created_at", direction: "desc" },
    filters: {},
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [fsStartActive, setFsStartActive] = useState(false);
  const [fsEndActive, setFsEndActive] = useState(false);

  const { loading, execute: fetchProducts } = useApi(ProductService.search);

  // Load distinct types on mount
  useEffect(() => {
    ProductService.getTypes()
      .then((types) => {
        // Remove "Rẻ Vô Địch + Flash Sale"
        const filtered = types.filter((t) => t !== "Rẻ Vô Địch + Flash Sale");
        setTypeOptions(filtered);
      })
      .catch((err) => console.error("Failed to load types", err));
  }, []);

  // Load products for current page
  const loadProducts = useCallback(
    async (targetPage: number) => {
      try {
        const currentParams: ProductSearchParams = {
          ...params,
          page: targetPage,
        };

        if (searchTerm) {
          currentParams.filters = {
            ...currentParams.filters,
            name: searchTerm,
          };
        }

        const response = await fetchProducts(currentParams);
        setProducts(response.data);
        setTotalPages(response.totalPages);
        setTotalCount(response.totalCount);
        setPage(response.page);
      } catch (err) {
        console.error("Failed to load products", err);
      }
    },
    [params, searchTerm, fetchProducts],
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
    loadProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.sort, params.filters]);

  type SortColumn = NonNullable<ProductSearchParams["sort"]>["column"];

  const handleSort = (column: SortColumn) => {
    setParams((prev) => ({
      ...prev,
      sort: {
        column,
        direction:
          prev.sort?.column === column && prev.sort.direction === "desc"
            ? "asc"
            : "desc",
      },
    }));
  };

  const getSortIcon = (column: string) => {
    if (params.sort?.column !== column)
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    return params.sort.direction === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-1 text-blue-500" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1 text-blue-500" />
    );
  };

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

  const COLUMNS_COUNT = 11;

  return (
    <Card className="w-full">
      {/* Filters and Search */}
      <div className="p-4 border-b border-border/40 flex flex-wrap gap-3 items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Type Filter — dropdown with checkboxes */}
          <div
            className="relative"
            ref={(() => {
              const ref = { current: null as HTMLDivElement | null };
              return ref;
            })()}
          >
            <button
              onClick={() => setShowTypeDropdown((v) => !v)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-150 ${
                selectedTypes.length > 0
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-400"
                  : "border-border/60 text-muted-foreground hover:bg-muted/40 dark:border-white/10 dark:hover:bg-white/5"
              }`}
            >
              <Filter className="w-4 h-4" />
              {selectedTypes.length > 0
                ? `Loại (${selectedTypes.length})`
                : "Tất cả loại"}
              <svg
                className={`w-3 h-3 transition-transform ${showTypeDropdown ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showTypeDropdown && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowTypeDropdown(false)}
                />
                {/* Dropdown panel */}
                <div className="absolute left-0 top-full mt-1.5 z-50 w-52 rounded-xl border border-border/60 bg-card shadow-lg dark:border-white/10 dark:shadow-2xl">
                  <div className="p-2 space-y-0.5">
                    {/* All option */}
                    <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-muted/50 dark:hover:bg-white/5 transition-colors">
                      <span
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                          selectedTypes.length === 0
                            ? "bg-blue-500 border-blue-500 text-white dark:bg-blue-400 dark:border-blue-400"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {selectedTypes.length === 0 && (
                          <svg
                            className="w-2.5 h-2.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </span>
                      <span className="text-sm font-medium">Tất cả</span>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selectedTypes.length === 0}
                        onChange={() => {
                          setSelectedTypes([]);
                          setParams((prev) => ({
                            ...prev,
                            filters: { ...prev.filters, type: undefined },
                          }));
                        }}
                      />
                    </label>

                    <div className="h-px bg-border/40 mx-2 dark:bg-white/5" />

                    {typeOptions.map((t) => {
                      const isChecked = selectedTypes.includes(t);
                      return (
                        <label
                          key={t}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-muted/50 dark:hover:bg-white/5 transition-colors"
                        >
                          <span
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                              isChecked
                                ? "bg-blue-500 border-blue-500 text-white dark:bg-blue-400 dark:border-blue-400"
                                : "border-gray-300 dark:border-gray-600"
                            }`}
                          >
                            {isChecked && (
                              <svg
                                className="w-2.5 h-2.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </span>
                          <span className="text-sm">{t}</span>
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={isChecked}
                            onChange={() => {
                              const next = isChecked
                                ? selectedTypes.filter((s) => s !== t)
                                : [...selectedTypes, t];
                              setSelectedTypes(next);
                              setParams((prev) => ({
                                ...prev,
                                filters: {
                                  ...prev.filters,
                                  type: next.length > 0 ? next : undefined,
                                },
                              }));
                            }}
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* FS Start Filter — on header */}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên SP</TableHead>
              <TableHead
                onClick={() => handleSort("price")}
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  Giá {getSortIcon("price")}
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort("sold")}
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  Đã bán {getSortIcon("sold")}
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort("comm")}
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  Hoa hồng {getSortIcon("comm")}
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort("comm_rate")}
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  Tỉ lệ {getSortIcon("comm_rate")}
                </div>
              </TableHead>
              <TableHead>Liên kết</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Mã shop</TableHead>
              <TableHead>Live Start</TableHead>
              <TableHead>Live End</TableHead>
              <TableHead
                onClick={() => {
                  const next = !fsStartActive;
                  setFsStartActive(next);
                  setParams((prev) => ({
                    ...prev,
                    filters: {
                      ...prev.filters,
                      flash_sale_start_before: next ? Date.now() : undefined,
                    },
                  }));
                }}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  FS Start
                  <ListFilter
                    className={`w-4 h-4 ${fsStartActive ? "text-blue-500" : "opacity-50"}`}
                  />
                </div>
              </TableHead>
              <TableHead
                onClick={() => {
                  const next = !fsEndActive;
                  setFsEndActive(next);
                  setParams((prev) => ({
                    ...prev,
                    filters: {
                      ...prev.filters,
                      flash_sale_end_before: next ? Date.now() : undefined,
                    },
                  }));
                }}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  FS End
                  <ListFilter
                    className={`w-4 h-4 ${fsEndActive ? "text-blue-500" : "opacity-50"}`}
                  />
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
                        <div className="h-4 rounded w-full skeleton-shimmer"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell
                      className="max-w-xs truncate"
                      title={product.name}
                    >
                      {product.name}
                    </TableCell>
                    <TableCell>₫{product.price.toLocaleString()}</TableCell>
                    <TableCell title={product.sold.toLocaleString()}>
                      {formatSold(product.sold)}
                    </TableCell>
                    <TableCell>₫{product.comm.toLocaleString()}</TableCell>
                    <TableCell>
                      {(product.comm_rate / 1000).toFixed(1)}%
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      <a
                        href={product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline inline-flex items-center gap-1"
                      >
                        Link
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </TableCell>
                    <TableCell>{product.type}</TableCell>
                    <TableCell>{product.shop_id}</TableCell>
                    <TableCell>{formatTimestamp(product.live_start)}</TableCell>
                    <TableCell>{formatTimestamp(product.live_end)}</TableCell>
                    <TableCell>
                      {formatTimestamp(product.flash_sale_start)}
                    </TableCell>
                    <TableCell>
                      {formatTimestamp(product.flash_sale_end)}
                    </TableCell>
                  </TableRow>
                ))}
            {!loading && products.length === 0 && (
              <TableRow>
                <TableCell colSpan={COLUMNS_COUNT} className="h-24 text-center">
                  Không tìm thấy sản phẩm.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="p-4 flex items-center justify-between border-t border-border/40">
        <span className="text-sm text-muted-foreground">
          Hiển thị{" "}
          {products.length > 0 ? (page - 1) * (params.limit || 20) + 1 : 0}–
          {Math.min(page * (params.limit || 20), totalCount)} trong {totalCount}{" "}
          sản phẩm
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => loadProducts(page - 1)}
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
                onClick={() => loadProducts(p)}
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
            onClick={() => loadProducts(page + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
