"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function resetPasswordAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) {
    redirect("/forgot-password?error=invalid_email");
  }
  if (password.length < 8) {
    redirect(`/reset-password?token=${token}&error=weak_password`);
  }
  if (password !== confirmPassword) {
    redirect(`/reset-password?token=${token}&error=password_mismatch`);
  }

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt < new Date()
  ) {
    redirect("/reset-password?error=invalid_token");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  redirect("/login?reset=1");
}
