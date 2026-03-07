"use client";

import CategoryTable from "@/components/categories/CategoryTable";

export default function CategoriesClientWrapper() {
  return (
    <>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Danh mục</h1>
          <p className="text-gray-500">Quản lý kho danh mục sản phẩm của bạn</p>
        </div>
      </div>
      <CategoryTable />
    </>
  );
}
