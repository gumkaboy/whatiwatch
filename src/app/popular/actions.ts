"use server";

import { getPopularSeriesFromTrakt } from "@/lib/trakt";

export async function loadMorePopular(page: number) {
  return getPopularSeriesFromTrakt(100, page);
}
