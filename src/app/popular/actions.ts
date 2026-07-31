"use server";

import { getPopularWellRatedSeries } from "@/lib/tmdb";

export async function loadMorePopular(page: number) {
  return getPopularWellRatedSeries(page);
}
