"use server";

import { cookies } from "next/headers";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Vui lòng nhập email và mật khẩu" };
  }

  const user = await prisma.user.findFirst({ where: { username: email } });
  if (!user) {
    return { error: "Tài khoản không tồn tại (Chế độ test)" };
  }

  const cookieStore = await cookies();
  cookieStore.set("bypassed_user_id", user.id, { path: "/", httpOnly: true });

  return { success: true };
}

export async function registerAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  if (!email || !password || !fullName) {
    return { error: "Vui lòng điền đủ thông tin" };
  }

  const role = await prisma.role.findUnique({
    where: { code: "NHAN_VIEN" },
  });

  if (!role) {
    return { error: "Lỗi hệ thống: Không tìm thấy quyền NHAN_VIEN" };
  }

  try {
    const newId = crypto.randomUUID();
    await prisma.user.create({
      data: {
        id: newId,
        username: email,
        fullName: fullName,
        role_id: role.id,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set("bypassed_user_id", newId, { path: "/", httpOnly: true });

    return { success: true };
  } catch (e) {
    console.error("Database Sync Error", e);
    return { error: "Lỗi khởi tạo tài khoản (Chế độ test)" };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("bypassed_user_id");
}

export async function getMockSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("bypassed_user_id")?.value;

  if (userId) {
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: { role: true }
    });
    if (user) {
      return {
        data: {
          user: {
            id: user.id,
            email: user.username,
            user_metadata: { full_name: user.fullName },
            role_id: user.role_id,
            role: user.role,
          },
        },
        error: null,
      };
    }
  }

  return { data: { user: null }, error: new Error("No session") };
}
