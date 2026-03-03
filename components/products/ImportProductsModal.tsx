"use client";

import { useState, useRef } from "react";
import * as xlsx from "xlsx";
import { Upload, FileDown, Loader2 } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface ImportData {
    shopId: string;
    id: string; // productId
}

const SHOPEE_URL_REGEX = /https:\/\/shopee\.vn\/.*?-i\.(\d+)\.(\d+)|https:\/\/shopee\.vn\/product\/(\d+)\/(\d+)/i;

export function ImportProductsModal({ onImportSuccess }: { onImportSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [textInput, setTextInput] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const parseUrls = (urls: string[]): ImportData[] => {
        const validData: ImportData[] = [];

        urls.forEach((url) => {
            const match = url.trim().match(SHOPEE_URL_REGEX);
            if (match) {
                // Handle format: shopee.vn/...-i.SHOPID.PRODUCTID
                if (match[1] && match[2]) {
                    validData.push({ shopId: match[1], id: match[2] });
                }
                // Handle format: shopee.vn/product/SHOPID/PRODUCTID
                else if (match[3] && match[4]) {
                    validData.push({ shopId: match[3], id: match[4] });
                }
            }
        });

        return validData;
    };

    const handleImportText = async () => {
        if (!textInput.trim()) return;

        const urls = textInput.split("\n").filter((line) => line.trim() !== "");
        const parsedData = parseUrls(urls);

        if (parsedData.length === 0) {
            toast.error("Không tìm thấy link hợp lệ", {
                description: "Vui lòng kiểm tra lại định dạng link Shopee.",
            });
            return;
        }

        await submitData(parsedData);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);

        const reader = new FileReader();
        reader.onload = async (evt: ProgressEvent<FileReader>) => {
            try {
                const bstr = evt.target?.result;
                const wb = xlsx.read(bstr, { type: "binary" });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];

                // Convert sheet to array of arrays
                const data = xlsx.utils.sheet_to_json<string[]>(ws, { header: 1 });

                // Extract first column and filter empty rows
                const urls = data.map((row) => row[0]).filter((cell) => typeof cell === 'string' && cell.trim() !== "");

                const parsedData = parseUrls(urls);

                if (parsedData.length === 0) {
                    toast.error("Không tìm thấy link hợp lệ trong file", {
                        description: "Vui lòng đảm bảo cột đầu tiên chứa link Shopee.",
                    });
                    setLoading(false);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    return;
                }

                await submitData(parsedData);
            } catch (error) {
                console.error("Error parsing Excel:", error);
                toast.error("Lỗi đọc file", {
                    description: "Không thể xử lý file Excel này.",
                });
                setLoading(false);
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsBinaryString(file);
    };

    const submitData = async (data: ImportData[]) => {
        setLoading(true);
        try {
            const response = await fetch("/api/product-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("API request failed");
            }

            const result = await response.json();

            toast.success("Import thành công", {
                description: `Đã import thành công ${result.count} sản phẩm hiện có hoặc mới.`,
            });

            setOpen(false);
            setTextInput("");
            onImportSuccess();

        } catch (error) {
            console.error("Error importing products:", error);
            toast.error("Lỗi import", {
                description: "Đã xảy ra lỗi khi lưu sản phẩm vào hệ thống.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <FileDown className="w-4 h-4" />
                    Import Sản Phẩm
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Import Sản Phẩm Shopee</DialogTitle>
                    <DialogDescription>
                        Nhập danh sách link sản phẩm Shopee để tự động import shopId và productId vào hệ thống.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="text" className="w-full mt-2">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="text">Dán từ Text/Excel</TabsTrigger>
                        <TabsTrigger value="file">Tải lên File Excel</TabsTrigger>
                    </TabsList>

                    <TabsContent value="text" className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Danh sách Link (Mỗi link 1 dòng)</label>
                            <Textarea
                                placeholder="https://shopee.vn/product/379382494/12087565736..."
                                className="min-h-[200px] resize-none font-mono text-sm"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <DialogFooter>
                            <Button onClick={handleImportText} disabled={loading || !textInput.trim()}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Xử lý & Import
                            </Button>
                        </DialogFooter>
                    </TabsContent>

                    <TabsContent value="file" className="space-y-4 pt-4">
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl aspect-video flex flex-col items-center justify-center p-6 bg-muted/5 transition-colors hover:bg-muted/10">
                            <Upload className="w-10 h-10 text-muted-foreground mb-4" />
                            <div className="text-center space-y-2">
                                <p className="text-sm font-medium">Kéo thả file .xlsx hoặc click để chọn</p>
                                <p className="text-xs text-muted-foreground">Hệ thống sẽ lấy dữ liệu từ Cột A (cột đầu tiên) của Sheet 1</p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                className="hidden"
                                onChange={handleFileUpload}
                                id="excel-upload"
                            />
                            <Button
                                variant="secondary"
                                className="mt-6"
                                disabled={loading}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Chọn File Excel"}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
