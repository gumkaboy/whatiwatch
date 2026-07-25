"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

const TOKEN_TTL_MS = 60 * 60 * 1000;

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email) {
    redirect("/forgot-password?error=invalid_email");
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // не сообщаем, существует ли такой email — иначе форма превращается
  // в способ проверить, кто зарегистрирован на сайте
  if (user) {
    const token = randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
    });

    const host = (await headers()).get("host");
    const protocol = host?.startsWith("localhost") ? "http" : "https";
    const resetUrl = `${protocol}://${host}/reset-password?token=${token}`;

    await sendPasswordResetEmail(email, resetUrl);
  }

  redirect("/forgot-password?sent=1");
}
