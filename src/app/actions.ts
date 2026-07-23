"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth, signOut } from "@/lib/auth";
import { WatchStatus } from "@/generated/prisma/client";

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function saveTracking(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Не авторизован");
  const userId = Number(session.user.id);

  const tmdbId = Number(formData.get("tmdbId"));
  const name = String(formData.get("name") ?? "");
  const posterPath = (formData.get("posterPath") as string) || null;
  const year = (formData.get("year") as string) || null;
  const status = formData.get("status") as WatchStatus;
  const currentSeason = Number(formData.get("currentSeason") || 0);
  const currentEpisode = Number(formData.get("currentEpisode") || 0);
  const ratingRaw = formData.get("rating");
  const rating = ratingRaw && ratingRaw !== "" ? Number(ratingRaw) : null;

  await prisma.series.upsert({
    where: { userId_tmdbId: { userId, tmdbId } },
    update: { name, posterPath, year, status, currentSeason, currentEpisode, rating },
    create: { userId, tmdbId, name, posterPath, year, status, currentSeason, currentEpisode, rating },
  });

  revalidatePath(`/series/${tmdbId}`);
  revalidatePath("/library");
}

export async function toggleEpisodeWatched(
  tmdbId: number,
  seasonNumber: number,
  episodeNumber: number
) {
  const session = await auth();
  if (!session?.user) throw new Error("Не авторизован");
  const userId = Number(session.user.id);

  const existing = await prisma.watchedEpisode.findUnique({
    where: {
      userId_tmdbId_seasonNumber_episodeNumber: { userId, tmdbId, seasonNumber, episodeNumber },
    },
  });

  if (existing) {
    await prisma.watchedEpisode.delete({ where: { id: existing.id } });
  } else {
    await prisma.watchedEpisode.create({
      data: { userId, tmdbId, seasonNumber, episodeNumber },
    });
  }

  revalidatePath(`/series/${tmdbId}`);
}

export async function removeTracking(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Не авторизован");
  const userId = Number(session.user.id);

  const tmdbId = Number(formData.get("tmdbId"));

  await prisma.series.delete({ where: { userId_tmdbId: { userId, tmdbId } } }).catch(() => {
    // записи могло не быть — это не ошибка
  });

  revalidatePath(`/series/${tmdbId}`);
  revalidatePath("/library");
}
