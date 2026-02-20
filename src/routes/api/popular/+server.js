import { json } from "@sveltejs/kit";
import { tmdbFetch } from "$lib/server/tmdb";

export async function GET({ url }) {
  const language = (url.searchParams.get("language") || "en-US").trim() || "en-US";
  const region = (url.searchParams.get("region") || "").trim();
  const year = (url.searchParams.get("year") || "").trim();
  const genre = (url.searchParams.get("genre") || "").trim();
  const sortRating = url.searchParams.get("sortRating") === "asc" ? "asc" : "desc";

  try {
    const baseParams = {
      language,
      include_adult: false,
      include_video: false,
      "vote_count.gte": 200,
      sort_by: sortRating === "asc" ? "vote_average.asc" : "vote_average.desc",
    };

    if (region) baseParams.region = region;
    if (year) baseParams.primary_release_year = year;
    if (genre) baseParams.with_genres = genre;

    const [page1, page2, page3, page4] = await Promise.all([
      tmdbFetch("/discover/movie", { ...baseParams, page: 1 }),
      tmdbFetch("/discover/movie", { ...baseParams, page: 2 }),
      tmdbFetch("/discover/movie", { ...baseParams, page: 3 }),
      tmdbFetch("/discover/movie", { ...baseParams, page: 4 }),
    ]);

    return json({
      results: [
        ...(page1.results || []),
        ...(page2.results || []),
        ...(page3.results || []),
        ...(page4.results || []),
      ],
    });
  } catch {
    return json({ results: [] }, { status: 200 });
  }
}
