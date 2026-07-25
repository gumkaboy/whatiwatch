"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateProfileAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Не авторизован");
  const userId = Number(session.user.id);

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const dateOfBirthRaw = String(formData.get("dateOfBirth") ?? "");

  if (!firstName || !lastName) {
    redirect("/profile?error=missing_name");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      firstName,
      lastName,
      city: city || null,
      dateOfBirth: dateOfBirthRaw ? new Date(dateOfBirthRaw) : null,
    },
  });

  redirect("/profile?saved=1");
}

export async function changePasswordAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Не авторизован");
  const userId = Number(session.user.id);

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmNewPassword = String(formData.get("confirmNewPassword") ?? "");

  if (newPassword.length < 8) {
    redirect("/profile?error=weak_password");
  }
  if (newPassword !== confirmNewPassword) {
    redirect("/profile?error=password_mismatch");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Пользователь не найден");

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    redirect("/profile?error=wrong_current_password");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  redirect("/profile?passwordChanged=1");
}
