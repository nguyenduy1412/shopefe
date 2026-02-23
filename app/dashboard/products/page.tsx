import ProductTable from "@/components/products/ProductTable";

export default function ProductsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Sản phẩm</h1>
        <p className="text-gray-500">Quản lý kho sản phẩm của bạn</p>
      </div>
      <ProductTable />
    </div>
  );
}
