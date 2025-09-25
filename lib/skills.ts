// lib/skills.ts
import { prisma } from "@/lib/db"

export async function getSkills() {
  return await prisma.skill.findMany({
    select: { id: true, name: true },
  })
}
