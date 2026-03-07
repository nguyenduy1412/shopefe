"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ProductService, ProductSearchParams } from "@/services/products";
import { CategoryService } from "@/services/categories";
import { Category, Product } from "@/types/database";
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
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [childCategories, setChildCategories] = useState<
    Record<string, Category[]>
  >({});
  const [expandedParents, setExpandedParents] = useState<Set<string>>(
    new Set(),
  );
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([]);
  const [showCatDropdown, setShowCatDropdown] = useState(false);
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
  const [showLinksView, setShowLinksView] = useState(false);
  const [selectedLines, setSelectedLines] = useState<[number, number] | null>(
    null,
  );
  const [showLimitDropdown, setShowLimitDropdown] = useState(false);

  const sttRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLTextAreaElement>(null);

  const linksValue = products.map((p) => p.link).join("\n");

  const handleLinksScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (sttRef.current) {
      sttRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleLinksSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;

    if (target.selectionStart === target.selectionEnd) {
      setSelectedLines(null);
      return;
    }

    // 1. Find line indices
    const textBeforeSelection = target.value.substring(
      0,
      target.selectionStart,
    );
    const selectedText = target.value.substring(
      target.selectionStart,
      target.selectionEnd,
    );

    const startLineIndex = textBeforeSelection.split("\n").length - 1;
    let endLineIndex = startLineIndex + selectedText.split("\n").length - 1;

    // Prevent highlighting a trailing empty new line if selection ends exactly at \n
    if (selectedText.endsWith("\n") && selectedText.length > 1) {
      endLineIndex = Math.max(startLineIndex, endLineIndex - 1);
    }

    // Always highlight the full line if even 1 character on that line is selected.
    setSelectedLines([startLineIndex, endLineIndex]);
  };

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

  // Load parent categories on mount
  useEffect(() => {
    CategoryService.getParents()
      .then((cats) => setParentCategories(cats))
      .catch((err) => console.error("Failed to load categories", err));
  }, []);

  // Load children when a parent is expanded
  const loadChildren = async (parentCatid: string) => {
    if (childCategories[parentCatid]) return; // already loaded
    try {
      const result = await CategoryService.search({
        limit: 200,
        filters: { parent_catid: parentCatid },
        sort: { column: "display_name", direction: "asc" },
      });
      setChildCategories((prev) => ({ ...prev, [parentCatid]: result.data }));
    } catch (err) {
      console.error("Failed to load child categories", err);
    }
  };

  const toggleParentExpand = (catid: string) => {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(catid)) {
        next.delete(catid);
      } else {
        next.add(catid);
        loadChildren(catid);
      }
      return next;
    });
  };

  const toggleCatId = (catid: string) => {
    const next = selectedCatIds.includes(catid)
      ? selectedCatIds.filter((c) => c !== catid)
      : [...selectedCatIds, catid];
    setSelectedCatIds(next);
    setParams((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        catid: next.length > 0 ? next : undefined,
      },
    }));
  };

  const clearCatFilter = () => {
    setSelectedCatIds([]);
    setParams((prev) => ({
      ...prev,
      filters: { ...prev.filters, catid: undefined },
    }));
  };

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
  }, [params.limit, params.sort, params.filters]);

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
          <div className="relative">
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

          {/* Category Filter — dropdown with parent/child hierarchy */}
          <div className="relative">
            <button
              onClick={() => setShowCatDropdown((v) => !v)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-150 ${
                selectedCatIds.length > 0
                  ? "border-purple-500 bg-purple-50 text-purple-700 dark:border-purple-400 dark:bg-purple-500/10 dark:text-purple-400"
                  : "border-border/60 text-muted-foreground hover:bg-muted/40 dark:border-white/10 dark:hover:bg-white/5"
              }`}
            >
              <ListFilter className="w-4 h-4" />
              {selectedCatIds.length > 0
                ? `Danh mục (${selectedCatIds.length})`
                : "Tất cả danh mục"}
              <svg
                className={`w-3 h-3 transition-transform ${showCatDropdown ? "rotate-180" : ""}`}
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

            {showCatDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowCatDropdown(false)}
                />
                <div className="absolute left-0 top-full mt-1.5 z-50 w-72 rounded-xl border border-border/60 bg-card shadow-lg dark:border-white/10 dark:shadow-2xl">
                  <div className="p-2 space-y-0.5 max-h-80 overflow-y-auto">
                    {/* All option */}
                    <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-muted/50 dark:hover:bg-white/5 transition-colors">
                      <span
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          selectedCatIds.length === 0
                            ? "bg-purple-500 border-purple-500 text-white dark:bg-purple-400 dark:border-purple-400"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {selectedCatIds.length === 0 && (
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
                      <span className="text-sm font-medium">
                        Tất cả danh mục
                      </span>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selectedCatIds.length === 0}
                        onChange={clearCatFilter}
                      />
                    </label>

                    <div className="h-px bg-border/40 mx-2 dark:bg-white/5" />

                    {parentCategories.map((parent) => {
                      const isParentChecked = selectedCatIds.includes(
                        parent.catid,
                      );
                      const isExpanded = expandedParents.has(parent.catid);
                      const children = childCategories[parent.catid] || [];
                      return (
                        <div key={parent.catid}>
                          {/* Parent row */}
                          <div className="flex items-center gap-1 px-1 py-0.5 rounded-lg hover:bg-muted/50 dark:hover:bg-white/5 transition-colors">
                            {/* Expand toggle */}
                            <button
                              type="button"
                              onClick={() => toggleParentExpand(parent.catid)}
                              className="p-1.5 rounded-md hover:bg-muted dark:hover:bg-white/10 flex-shrink-0 transition-colors"
                            >
                              <svg
                                className={`w-3 h-3 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                            {/* Checkbox label */}
                            <label className="flex items-center gap-2 flex-1 cursor-pointer py-1">
                              <span
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                  isParentChecked
                                    ? "bg-purple-500 border-purple-500 text-white dark:bg-purple-400 dark:border-purple-400"
                                    : "border-gray-300 dark:border-gray-600"
                                }`}
                              >
                                {isParentChecked && (
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
                              <span className="text-sm font-medium truncate">
                                {parent.display_name || parent.name}
                              </span>
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={isParentChecked}
                                onChange={() => toggleCatId(parent.catid)}
                              />
                            </label>
                          </div>

                          {/* Children rows */}
                          {isExpanded && (
                            <div className="ml-6 space-y-0.5">
                              {children.length === 0 ? (
                                <div className="px-3 py-1.5 text-xs text-muted-foreground italic">
                                  Đang tải...
                                </div>
                              ) : (
                                children.map((child) => {
                                  const isChildChecked =
                                    selectedCatIds.includes(child.catid);
                                  return (
                                    <label
                                      key={child.catid}
                                      className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-muted/50 dark:hover:bg-white/5 transition-colors"
                                    >
                                      <span
                                        className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                          isChildChecked
                                            ? "bg-purple-500 border-purple-500 text-white dark:bg-purple-400 dark:border-purple-400"
                                            : "border-gray-300 dark:border-gray-600"
                                        }`}
                                      >
                                        {isChildChecked && (
                                          <svg
                                            className="w-2 h-2"
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
                                      <span className="text-xs truncate">
                                        {child.display_name || child.name}
                                      </span>
                                      <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={isChildChecked}
                                        onChange={() =>
                                          toggleCatId(child.catid)
                                        }
                                      />
                                    </label>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* FS Start Filter — on header */}
          <div className="flex items-center gap-2 px-2 border-l border-border/40 ml-2 pl-4">
            <Switch
              id="links-view"
              checked={showLinksView}
              onCheckedChange={setShowLinksView}
            />
            <Label
              htmlFor="links-view"
              className="cursor-pointer text-sm font-medium"
            >
              Hiển thị Link SP
            </Label>
          </div>
        </div>
      </div>

      {/* Table / Links View */}
      <div className="overflow-x-auto min-h-[400px]">
        {showLinksView ? (
          <div className="p-4 h-full flex gap-3">
            <div
              ref={sttRef}
              className="w-16 h-[400px] overflow-hidden text-center bg-muted/50 text-muted-foreground border-dashed border rounded-md font-mono text-sm leading-relaxed whitespace-pre-wrap flex flex-col py-2 select-none"
            >
              {products.map((_, i) => {
                const stt = (page - 1) * (params.limit || 20) + i + 1;
                const isSelected =
                  selectedLines &&
                  i >= selectedLines[0] &&
                  i <= selectedLines[1];
                return (
                  <div
                    key={i}
                    className={`w-full px-1 ${isSelected ? "bg-[#b3d4fc] text-black dark:bg-[#1a4a82] dark:text-blue-100" : ""}`}
                  >
                    {stt}
                  </div>
                );
              })}
            </div>
            <Textarea
              ref={linksRef}
              className="w-full h-[400px] resize-none font-mono text-sm leading-relaxed whitespace-pre overflow-x-auto"
              readOnly
              onScroll={handleLinksScroll}
              onSelect={handleLinksSelect}
              value={linksValue}
              placeholder={
                loading ? "Đang tải dữ liệu..." : "Chưa có link sản phẩm nào."
              }
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">STT</TableHead>
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
                      {Array.from({ length: COLUMNS_COUNT + 1 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 rounded w-full skeleton-shimmer"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : products.map((product, index) => (
                    <TableRow key={product.id}>
                      <TableCell className="text-center text-muted-foreground font-medium">
                        {(page - 1) * (params.limit || 20) + index + 1}
                      </TableCell>
                      <TableCell
                        className="max-w-xs truncate whitespace-normal"
                        title={product.name}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="line-clamp-2">{product.name}</span>
                          {(() => {
                            type ProductCat = {
                              display_name?: string;
                              name?: string;
                            };
                            const p = product as Product & {
                              categories?: ProductCat | null;
                            };
                            const cat = p.categories;
                            const catName = cat?.display_name || cat?.name;
                            if (!catName) return null;
                            return (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 w-fit">
                                {catName}
                              </span>
                            );
                          })()}
                        </div>
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

                      <TableCell>{product.shop_id}</TableCell>
                      <TableCell>
                        {formatTimestamp(product.live_start)}
                      </TableCell>
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
                  <TableCell
                    colSpan={COLUMNS_COUNT + 1}
                    className="h-24 text-center"
                  >
                    Không tìm thấy sản phẩm.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      <div className="p-4 flex items-center justify-between border-t border-border/40 gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm text-muted-foreground">
            Hiển thị{" "}
            {products.length > 0 ? (page - 1) * (params.limit || 20) + 1 : 0}–
            {Math.min(page * (params.limit || 20), totalCount)} trong{" "}
            {totalCount} sản phẩm
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
