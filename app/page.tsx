import { getMockSession } from "@/app/actions/auth";
import { AuthCard } from "@/components/auth/AuthCard";
import { CheckInCard } from "@/components/auth/CheckInCard";
import { PrismaClient } from "@/lib/generated/prisma";
import { getICTDate, getICTNow } from "@/lib/timezone";

const prisma = new PrismaClient();

export default async function Home() {
  const {
    data: { user },
  } = await getMockSession();

  if (!user) {
    return <AuthCard />;
  }

  // Get today's record (using normalized ICT date)
  const today = getICTDate(getICTNow());

  const record = await prisma.timekeeping.findFirst({
    where: {
      user_id: user.id,
      date: today,
    },
  });

  return <CheckInCard user={user as any} existingRecord={record} />;
}
