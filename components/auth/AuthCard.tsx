"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { loginAction, registerAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

export function AuthCard() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(formData: FormData) {
    setIsLoading(true);
    const res = await loginAction(formData);
    setIsLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Đăng nhập thành công!");
      // Refresh router so layout correctly catches the new session
      router.refresh();
    }
  }

  async function handleRegister(formData: FormData) {
    setIsLoading(true);
    const res = await registerAction(formData);
    setIsLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Đăng ký thành công! Bạn có thể chấm công ngay bây giờ.");
      router.refresh();
    }
  }

  return (
    <div className="flex w-full min-h-[100dvh] items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <motion.div
        layout
        className="w-full max-w-sm backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 shadow-2xl border-0 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800 rounded-xl flex flex-col"
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-cyan-400" />

        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            Shopefe Portal
          </CardTitle>
          <CardDescription className="text-center text-slate-500 dark:text-slate-400">
            Hệ thống quản lý nội bộ & Chấm công
          </CardDescription>
        </CardHeader>

        <div className="w-full">
          <div className="px-6 mb-2">
            <div className="flex w-full p-1 bg-slate-100 dark:bg-slate-800 rounded-lg relative">
              <button
                onClick={() => setActiveTab("login")}
                className={`relative flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors z-10 ${
                  activeTab === "login"
                    ? "text-slate-900 dark:text-slate-100"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                }`}
              >
                {activeTab === "login" && (
                  <motion.div
                    layout
                    layoutId="active-tab-indicator"
                    className="absolute inset-0 bg-white dark:bg-slate-900 shadow-sm rounded-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative">Đăng nhập</span>
              </button>
              <button
                onClick={() => setActiveTab("register")}
                className={`relative flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors z-10 ${
                  activeTab === "register"
                    ? "text-slate-900 dark:text-slate-100"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                }`}
              >
                {activeTab === "register" && (
                  <motion.div
                    layout
                    layoutId="active-tab-indicator"
                    className="absolute inset-0 bg-white dark:bg-slate-900 shadow-sm rounded-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative">Đăng ký</span>
              </button>
            </div>
          </div>

          <div className="relative w-full h-full pb-4">
            {/* 
              By using grid layout with 1 column/row and placing all items in it 
              we can achieve absolute-like stacking without losing the document height of the tallest element
            */}
            <div className="grid grid-cols-1 grid-rows-1">
              <AnimatePresence initial={false} mode="popLayout">
                {activeTab === "login" && (
                  <motion.div
                    key="login-tab"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                    className="w-full col-start-1 row-start-1"
                  >
                    <form action={handleLogin}>
                      <CardContent className="space-y-4 pt-4 pb-2">
                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="text-slate-700 dark:text-slate-300"
                          >
                            Email
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="nguyenvana@shopefe.com"
                            required
                            className="bg-slate-50 dark:bg-slate-950 focus-visible:ring-blue-500 transition-shadow"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="password"
                            className="text-slate-700 dark:text-slate-300"
                          >
                            Mật khẩu
                          </Label>
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="bg-slate-50 dark:bg-slate-950 focus-visible:ring-blue-500 transition-shadow"
                          />
                        </div>

                        {/* Spacer để chiều cao Đăng nhập bằng đúng chiều cao Đăng ký (tránh màn hình bị giật kích thước). 
                            Đăng ký có 3 trường, Đăng nhập có 2 trường => Cần bù 1 trường (khoảng 68-70px).
                            Tuy nhiên do nút Quên mật khẩu làm form Dăng nhập cao lên, ta chỉ cần bù một phần nhỏ. */}
                        <div
                          className="space-y-2 invisible pointer-events-none select-none h-[12px]"
                          aria-hidden="true"
                          tabIndex={-1}
                        ></div>
                      </CardContent>
                      <CardFooter className="pt-2 flex flex-col space-y-3">
                        <Button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md shadow-blue-500/20 transition-all hover:shadow-blue-500/40"
                          disabled={isLoading}
                        >
                          {isLoading ? "Đang xử lý..." : "Đăng nhập"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                          onClick={() =>
                            toast.info("Tính năng đang được phát triển")
                          }
                        >
                          Quên mật khẩu?
                        </Button>
                      </CardFooter>
                    </form>
                  </motion.div>
                )}

                {activeTab === "register" && (
                  <motion.div
                    key="register-tab"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                    className="w-full col-start-1 row-start-1"
                  >
                    <form action={handleRegister}>
                      <CardContent className="space-y-4 pt-4 pb-2">
                        <div className="space-y-2">
                          <Label
                            htmlFor="reg-email"
                            className="text-slate-700 dark:text-slate-300"
                          >
                            Email
                          </Label>
                          <Input
                            id="reg-email"
                            name="email"
                            type="email"
                            placeholder="ten.ho@shopefe.com"
                            required
                            className="bg-slate-50 dark:bg-slate-950 focus-visible:ring-blue-500 transition-shadow"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="reg-fullname"
                            className="text-slate-700 dark:text-slate-300"
                          >
                            Họ và Tên
                          </Label>
                          <Input
                            id="reg-fullname"
                            name="fullName"
                            type="text"
                            placeholder="Nguyễn Văn A"
                            required
                            className="bg-slate-50 dark:bg-slate-950 focus-visible:ring-blue-500 transition-shadow"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="reg-password"
                            className="text-slate-700 dark:text-slate-300"
                          >
                            Mật khẩu
                          </Label>
                          <Input
                            id="reg-password"
                            name="password"
                            type="password"
                            required
                            className="bg-slate-50 dark:bg-slate-950 focus-visible:ring-blue-500 transition-shadow"
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2">
                        <Button
                          type="submit"
                          className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 font-medium shadow-md transition-all"
                          disabled={isLoading}
                        >
                          {isLoading
                            ? "Đang tạo tài khoản..."
                            : "Đăng ký tài khoản"}
                        </Button>
                      </CardFooter>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
