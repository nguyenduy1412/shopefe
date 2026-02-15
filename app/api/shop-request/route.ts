import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { ids } = await request.json();

        if (!ids || !Array.isArray(ids)) {
            return NextResponse.json(
                { error: "Invalid input: ids must be an array" },
                { status: 400 }
            );
        }

        const uniqueIds = Array.from(new Set(ids.map((id) => String(id))));
        const shopsToInsert = uniqueIds.map((id) => ({
            id: id,
        }));

        // Chunking to avoid parameter limits, keeping batch size 50 as requested
        const BATCH_SIZE = 50;
        const chunks = [];
        for (let i = 0; i < shopsToInsert.length; i += BATCH_SIZE) {
            chunks.push(shopsToInsert.slice(i, i + BATCH_SIZE));
        }

        let totalCount = 0;
        const promises = chunks.map(async (chunk) => {
            try {
                const result = await prisma.shops.createMany({
                    data: chunk,
                    skipDuplicates: true,
                });
                return result.count;
            } catch (error) {
                console.error("Error inserting chunk:", error);
                return 0;
            }
        });

        const results = await Promise.all(promises);
        totalCount = results.reduce((acc, curr) => acc + curr, 0);

        return NextResponse.json({ count: totalCount });
    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
