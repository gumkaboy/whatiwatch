"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth, signOut } from "@/lib/auth";
import { getSeasonEpisodes, getSeriesDetails } from "@/lib/tmdb";

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function toggleEpisodeWatched(
  tmdbId: number,
  seasonNumber: number,
  episodeNumber: number,
  name: string,
  posterPath: string | null,
  year: string | null,
  episodeCount: number,
  runtime: number | null
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
      data: { userId, tmdbId, seasonNumber, episodeNumber, runtime },
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

export async function setSeriesBackground(tmdbId: number, backgroundPath: string | null) {
  const session = await auth();
  if (!session?.user) throw new Error("Не авторизован");
  const userId = Number(session.user.id);

  // фон не должен сам по себе добавлять сериал в библиотеку — обновляем,
  // только если запись уже существует (создана оценкой/просмотром/сохранением)
  await prisma.series.updateMany({
    where: { userId, tmdbId },
    data: { backgroundPath },
  });

  revalidatePath(`/series/${tmdbId}`);
}

export async function toggleLibrarySave(
  tmdbId: number,
  name: string,
  posterPath: string | null,
  year: string | null
) {
  const session = await auth();
  if (!session?.user) throw new Error("Не авторизован");
  const userId = Number(session.user.id);

  const existing = await prisma.series.findUnique({
    where: { userId_tmdbId: { userId, tmdbId } },
  });

  if (existing) {
    await prisma.series.delete({ where: { userId_tmdbId: { userId, tmdbId } } });
  } else {
    await prisma.series.create({
      data: { userId, tmdbId, name, posterPath, year, status: "PLANNED" },
    });
  }

  revalidatePath(`/series/${tmdbId}`);
  revalidatePath("/library");
}

export async function markAllAiredWatched(tmdbId: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Не авторизован");
  const userId = Number(session.user.id);

  const series = await getSeriesDetails(tmdbId);
  const seasonNumbers = series.seasons
    .map((s) => s.season_number)
    .filter((n) => n > 0);

  const now = new Date();
  const airedEpisodes: { seasonNumber: number; episodeNumber: number; runtime: number | null }[] =
    [];

  for (const seasonNumber of seasonNumbers) {
    const episodes = await getSeasonEpisodes(tmdbId, seasonNumber);
    for (const ep of episodes) {
      if (ep.air_date && new Date(ep.air_date) <= now) {
        airedEpisodes.push({
          seasonNumber,
          episodeNumber: ep.episode_number,
          runtime: ep.runtime,
        });
      }
    }
  }

  const existing = await prisma.watchedEpisode.findMany({
    where: { userId, tmdbId },
    select: { seasonNumber: true, episodeNumber: true },
  });
  const existingKeys = new Set(existing.map((e) => `${e.seasonNumber}-${e.episodeNumber}`));
  const allAiredWatched =
    airedEpisodes.length > 0 &&
    airedEpisodes.every((e) => existingKeys.has(`${e.seasonNumber}-${e.episodeNumber}`));

  if (allAiredWatched) {
    await prisma.watchedEpisode.deleteMany({ where: { userId, tmdbId } });
  } else {
    const toCreate = airedEpisodes.filter(
      (e) => !existingKeys.has(`${e.seasonNumber}-${e.episodeNumber}`)
    );
    if (toCreate.length > 0) {
      await prisma.watchedEpisode.createMany({
        data: toCreate.map((e) => ({ userId, tmdbId, ...e })),
      });
    }
  }

  const watchedCount = await prisma.watchedEpisode.count({ where: { userId, tmdbId } });
  const status =
    watchedCount === 0
      ? "PLANNED"
      : airedEpisodes.length > 0 && watchedCount >= airedEpisodes.length
        ? "COMPLETED"
        : "WATCHING";
  const name = series.name;
  const posterPath = series.poster_path;
  const year = series.first_air_date?.slice(0, 4) ?? null;

  await prisma.series.upsert({
    where: { userId_tmdbId: { userId, tmdbId } },
    update: { status, name, posterPath, year },
    create: { userId, tmdbId, name, posterPath, year, status },
  });

  revalidatePath(`/series/${tmdbId}`);
  revalidatePath("/library");
}

export async function addComment(tmdbId: number, text: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Не авторизован");
  const userId = Number(session.user.id);

  const trimmed = text.trim();
  if (!trimmed) throw new Error("Комментарий не может быть пустым");

  await prisma.comment.create({
    data: { userId, tmdbId, text: trimmed },
  });

  revalidatePath(`/series/${tmdbId}`);
}

export async function deleteComment(commentId: number, tmdbId: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Не авторизован");
  const userId = Number(session.user.id);

  await prisma.comment.deleteMany({ where: { id: commentId, userId } });

  revalidatePath(`/series/${tmdbId}`);
}
