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
  Loader2,
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

export default function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [nextCursor, setNextCursor] = useState<string | number | null>(null);
  const [params, setParams] = useState<ProductSearchParams>({
    limit: 10,
    sort: { column: "created_at", direction: "desc" },
    filters: {},
  });
  const [searchTerm, setSearchTerm] = useState("");

  const {
    loading,
    error,
    execute: fetchProducts,
  } = useApi(ProductService.search);

  // Initial load or filter change
  const loadProducts = useCallback(
    async (isLoadMore = false) => {
      try {
        const currentParams = { ...params };
        if (isLoadMore && nextCursor) {
          currentParams.cursor = nextCursor;
        } else {
          delete currentParams.cursor;
        }

        // Sync search term to name filter
        if (searchTerm) {
          currentParams.filters = {
            ...currentParams.filters,
            name: searchTerm,
          };
        }

        const response = await fetchProducts(currentParams);

        if (isLoadMore) {
          setProducts((prev) => [...prev, ...response.data]);
        } else {
          setProducts(response.data);
        }
        setNextCursor(response.nextCursor || null);
      } catch (err) {
        console.error("Failed to load products", err);
      }
    },
    [params, searchTerm, nextCursor, fetchProducts],
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

  // Reload when params (except cursor) change
  useEffect(() => {
    loadProducts(false);
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

  return (
    <Card className="w-full">
      {/* Filters and Search */}
      <div className="p-4 border-b flex flex-wrap gap-4 items-center justify-between dark:border-gray-800">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search products..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Simple Type Filter Dropdown Mockup */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <Select
            className="w-[180px]"
            onChange={(e) =>
              setParams((prev) => ({
                ...prev,
                filters: { ...prev.filters, type: e.target.value || undefined },
              }))
            }
          >
            <option value="">All Types</option>
            <option value="clothing">Clothing</option>
            <option value="electronics">Electronics</option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead
                onClick={() => handleSort("created_at")}
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  Created At {getSortIcon("created_at")}
                </div>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead
                onClick={() => handleSort("price")}
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  Price {getSortIcon("price")}
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort("sold")}
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  Sold {getSortIcon("sold")}
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort("comm")}
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  Comm {getSortIcon("comm")}
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort("comm_rate")}
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  % Rate {getSortIcon("comm_rate")}
                </div>
              </TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Shop ID</TableHead>
              <TableHead>Live Start</TableHead>
              <TableHead>Live End</TableHead>
              <TableHead>FS Start</TableHead>
              <TableHead>FS End</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && products.length === 0
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 14 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse dark:bg-gray-700"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.id}</TableCell>
                    <TableCell>
                      {new Date(product.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell
                      className="max-w-xs truncate"
                      title={product.name}
                    >
                      {product.name}
                    </TableCell>
                    <TableCell>₫{product.price.toLocaleString()}</TableCell>
                    <TableCell>{product.sold}</TableCell>
                    <TableCell>₫{product.comm.toLocaleString()}</TableCell>
                    <TableCell>{product.comm_rate}%</TableCell>
                    <TableCell className="max-w-xs truncate">
                      <a
                        href={product.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Link
                      </a>
                    </TableCell>
                    <TableCell>{product.type}</TableCell>
                    <TableCell>{product.shop_id}</TableCell>
                    <TableCell>
                      {product.live_start
                        ? new Date(product.live_start * 1000).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {product.live_end
                        ? new Date(product.live_end * 1000).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {product.flash_sale_start
                        ? new Date(
                            product.flash_sale_start * 1000,
                          ).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {product.flash_sale_end
                        ? new Date(
                            product.flash_sale_end * 1000,
                          ).toLocaleString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
            {!loading && products.length === 0 && (
              <TableRow>
                <TableCell colSpan={14} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Load More Step */}
      <div className="p-4 flex justify-center border-t dark:border-gray-800">
        {loading && products.length > 0 && (
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        )}
        {!loading && nextCursor && (
          <Button variant="outline" onClick={() => loadProducts(true)}>
            Load More
          </Button>
        )}
      </div>
    </Card>
  );
}
