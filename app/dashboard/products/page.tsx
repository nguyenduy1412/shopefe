import ProductTable from "@/components/products/ProductTable";

export default function ProductsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-gray-500">Manage your products inventory</p>
      </div>
      <ProductTable />
    </div>
  );
}
