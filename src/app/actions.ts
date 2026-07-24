"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth, signOut } from "@/lib/auth";

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function toggleEpisodeWatched(
  tmdbId: number,
  seasonNumber: number,
  episodeNumber: number,
  name: string,
  posterPath: string | null,
  year: string | null,
  episodeCount: number
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

  const watchedCount = await prisma.watchedEpisode.count({ where: { userId, tmdbId } });
  const status =
    watchedCount === 0
      ? "PLANNED"
      : episodeCount > 0 && watchedCount >= episodeCount
        ? "COMPLETED"
        : "WATCHING";

  await prisma.series.upsert({
    where: { userId_tmdbId: { userId, tmdbId } },
    update: { status, name, posterPath, year },
    create: { userId, tmdbId, name, posterPath, year, status },
  });

  revalidatePath(`/series/${tmdbId}`);
  revalidatePath("/library");
}

export async function setRating(
  tmdbId: number,
  name: string,
  posterPath: string | null,
  year: string | null,
  rating: number | null
) {
  const session = await auth();
  if (!session?.user) throw new Error("Не авторизован");
  const userId = Number(session.user.id);

  await prisma.series.upsert({
    where: { userId_tmdbId: { userId, tmdbId } },
    update: { rating },
    create: { userId, tmdbId, name, posterPath, year, rating },
  });

  revalidatePath(`/series/${tmdbId}`);
  revalidatePath("/library");
}

export async function setSeriesBackground(
  tmdbId: number,
  name: string,
  posterPath: string | null,
  year: string | null,
  backgroundPath: string | null
) {
  const session = await auth();
  if (!session?.user) throw new Error("Не авторизован");
  const userId = Number(session.user.id);

  await prisma.series.upsert({
    where: { userId_tmdbId: { userId, tmdbId } },
    update: { backgroundPath },
    create: { userId, tmdbId, name, posterPath, year, backgroundPath },
  });

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
