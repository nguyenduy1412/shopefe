import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const items = await request.json();

        if (!Array.isArray(items)) {
            return NextResponse.json(
                { error: "Invalid input: body must be an array" },
                { status: 400 }
            );
        }

        // 1. Create Shops
        const uniqueShopIds = Array.from(new Set(items.map((item) => String(item.shopId))));
        const shopsToInsert = uniqueShopIds.map((id) => ({ id }));

        // Chunking shops
        const SHOP_BATCH = 50;
        for (let i = 0; i < shopsToInsert.length; i += SHOP_BATCH) {
            const chunk = shopsToInsert.slice(i, i + SHOP_BATCH);
            await prisma.shops.createMany({
                data: chunk,
                skipDuplicates: true,
            });
        }

        // 2. Create Products
        const productsToInsert = items.map((item) => ({
            id: String(item.id),
            shop_id: String(item.shopId),
            link: `https://shopee.vn/product/${item.shopId}/${item.id}`,
            name: `Product ${item.id}`,
            price: 0,
            comm_rate: 0,
            comm: 0,
            sold: 0,
            type: "unknown",
            updated_at: new Date(), // Required by schema
        }));

        // Chunking products
        const PROD_BATCH = 50;
        const prodPromises = [];

        for (let i = 0; i < productsToInsert.length; i += PROD_BATCH) {
            const chunk = productsToInsert.slice(i, i + PROD_BATCH);
            prodPromises.push(
                prisma.products.createMany({
                    data: chunk,
                    skipDuplicates: true
                }).then((res: { count: number }) => res.count).catch((e: unknown) => {
                    console.error("Error inserting products chunk", e);
                    return 0;
                })
            );
        }

        const results = await Promise.all(prodPromises);
        const totalCount = results.reduce((acc: number, count: number) => acc + count, 0);

        return NextResponse.json({
            message: "Success",
            count: totalCount,
        });
    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
