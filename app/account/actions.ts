'use server'

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import cloudinary from "cloudinary"
import { randomUUID } from "crypto"
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import bcrypt from "bcryptjs"

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateAccount(data: any, file?: File) {
  const userId = data.userId
  if (!userId) throw new Error("Unauthorized: No user ID provided")

  let profilePicUrl: string | undefined = undefined

  if (file) {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET!

    const result = await new Promise<cloudinary.UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        {
          resource_type: "image",
          upload_preset: uploadPreset,
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result!)
        }
      )
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PassThrough } = require("stream")
      const bufferStream = new PassThrough()
      bufferStream.end(buffer)
      bufferStream.pipe(stream)
    })

    profilePicUrl = result.secure_url
  }

  const { userId: _ignored, skills, ...updateData } = data
  if (profilePicUrl) updateData.profilePic = profilePicUrl

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  })

  if (skills && Array.isArray(skills)) {
    await prisma.userSkill.deleteMany({ where: { userId } })
    if (skills.length > 0) {
      const skillRecords = skills.map(skillId => ({
        id: randomUUID(),
        userId,
        skillId,
      }))
      await prisma.userSkill.createMany({ data: skillRecords })
    }
  }

  revalidatePath("/account")
}

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, message: "All fields are required" };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, message: "New password and Confirm Password do not match" };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return { success: false, message: "User not found" };
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    return { success: false, message: "Current Password is incorrect" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  return { success: true, message: "Password updated successfully" };
}