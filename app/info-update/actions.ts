"use server";

import { prisma } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function findStudent(regNo: string) {
    const student = await prisma.user.findUnique({
        where: { regNo },
        select: {
            id: true,
            regNo: true,
            fullName: true,
            profilePic: true,
            linkedinId: true,
            githubId: true,
            facebook: true,
        },
    });
    return student;
}

export async function updateStudentInfo(
  studentId: string,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    let profilePicUrl: string | undefined;

    const file = formData.get("profilePic");
    if (file instanceof File && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET!;

      const upload = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            upload_preset: uploadPreset,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result!);
          }
        );

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { PassThrough } = require("stream");
        const bufferStream = new PassThrough();
        bufferStream.end(buffer);
        bufferStream.pipe(stream);
      });

      profilePicUrl = upload.secure_url;
    }

    const linkedinValue = formData.get("linkedin");
    const githubValue = formData.get("github");
    const facebookValue = formData.get("facebook");

    const linkedin =
      typeof linkedinValue === "string" ? linkedinValue.trim() : undefined;
    const github =
      typeof githubValue === "string" ? githubValue.trim() : undefined;
    const facebook =
      typeof facebookValue === "string" ? facebookValue.trim() : undefined;

    const updateData: Record<string, string> = {};

    if (profilePicUrl) updateData.profilePic = profilePicUrl;
    if (linkedin) updateData.linkedinId = linkedin;
    if (github) updateData.githubId = github;
    if (facebook) updateData.facebook = facebook;

    if (Object.keys(updateData).length === 0) {
      return { success: false, message: "No changes to update." };
    }

    await prisma.user.update({
      where: { id: studentId },
      data: updateData,
    });

    revalidatePath("/info-update");
    return { success: true, message: "Profile updated successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Failed to update profile" };
  }
}