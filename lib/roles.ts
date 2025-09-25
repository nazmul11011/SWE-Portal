// lib/roles.ts
import { prisma } from "./db";

export async function hasPermission(userId: string, required: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user || !user.role) return false;
  return user.role.permission >= required;
}

export async function getRoleName(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });
  return user?.role?.name || null;
}
