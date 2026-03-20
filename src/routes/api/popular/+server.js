import { json } from "@sveltejs/kit";
import { tmdbFetch } from "$lib/server/tmdb";

const TMDB_MAX_PAGES = 500;
const TMDB_PAGES_PER_UI_PAGE = 4;

export async function GET({ url }) {
  const language = (url.searchParams.get("language") || "en-US").trim() || "en-US";
  const region = (url.searchParams.get("region") || "").trim();
  const year = (url.searchParams.get("year") || "").trim();
  const genre = (url.searchParams.get("genre") || "").trim();
  const sortRating = url.searchParams.get("sortRating") === "asc" ? "asc" : "desc";
  const pageRaw = Number(url.searchParams.get("page") || "1");
  const pageParsed = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const page = Math.max(1, pageParsed);

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

    const start = (page - 1) * TMDB_PAGES_PER_UI_PAGE + 1;
    const pages = Array.from({ length: TMDB_PAGES_PER_UI_PAGE }, (_, idx) => start + idx).filter(
      (p) => p >= 1 && p <= TMDB_MAX_PAGES,
    );

    const first = await tmdbFetch("/discover/movie", { ...baseParams, page: pages[0] || 1 });
    const restPages = pages.slice(1);
    const rest = await Promise.all(restPages.map((p) => tmdbFetch("/discover/movie", { ...baseParams, page: p })));

    const allResults = [first, ...rest].flatMap((d) => d.results || []);
    const tmdbTotalPages = Math.min(Number(first.total_pages) || 0, TMDB_MAX_PAGES);
    const uiTotalPages = tmdbTotalPages ? Math.ceil(tmdbTotalPages / TMDB_PAGES_PER_UI_PAGE) : 0;

    return json({
      results: allResults,
      page,
      total_pages: uiTotalPages,
      total_results: Number(first.total_results) || 0,
    });
  } catch {
    return json({ results: [], page, total_pages: 0, total_results: 0 }, { status: 200 });
  }
}
