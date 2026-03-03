"use client";

import { useState } from "react";
import ProductTable from "@/components/products/ProductTable";
import { ImportProductsModal } from "@/components/products/ImportProductsModal";

export default function ProductsClientWrapper() {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleImportSuccess = () => {
        // Increment the key to force ProductTable to remount and fetch fresh data
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <>
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold">Sản phẩm</h1>
                    <p className="text-gray-500">Quản lý kho sản phẩm của bạn</p>
                </div>
                <ImportProductsModal onImportSuccess={handleImportSuccess} />
            </div>
            <ProductTable key={refreshKey} />
        </>
    );
}
