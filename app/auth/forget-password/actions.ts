"use server";

import { prisma } from "@/lib/db";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

export async function requestOtpAction(regNo: string, email: string) {
  const user = await prisma.user.findUnique({ where: { regNo } });
  if (!user || user.email !== email) {
    return { success: false, message: "Invalid regNo or email" };
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.passwordReset.upsert({
    where: { userId: user.id },
    update: { otp, expiresAt },
    create: { userId: user.id, otp, expiresAt },
  });

  // Send OTP
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: `"SWE Portal" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Password Reset OTP",
    text: `Your OTP is: ${otp} (valid for 5 minutes).`,
  });

  return { success: true };
}

export async function verifyOtpAction(regNo: string, email: string, otp: string) {
  const user = await prisma.user.findUnique({ where: { regNo } });
  if (!user || user.email !== email) {
    return { success: false, message: "Invalid user" };
  }

  const reset = await prisma.passwordReset.findUnique({ where: { userId: user.id } });
  if (!reset || reset.otp !== otp || reset.expiresAt < new Date()) {
    return { success: false, message: "Invalid or expired OTP" };
  }

  const newPassword = Math.random().toString(36).slice(-8);
  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });
  await prisma.passwordReset.delete({ where: { userId: user.id } });

  // Send new password
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: `"SWE Portal" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your New Password",
    text: `Your new password is: ${newPassword}. Please change it after login.`,
  });

  return { success: true };
}
