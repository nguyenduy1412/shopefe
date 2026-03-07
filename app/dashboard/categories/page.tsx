import CategoriesClientWrapper from "@/components/categories/CategoriesClientWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý danh mục | ShopeFe",
  description: "Trang quản lý danh mục sản phẩm của hệ thống ShopeFe.",
};

export default function CategoriesPage() {
  return (
    <div className="p-6">
      <CategoriesClientWrapper />
    </div>
  );
}
