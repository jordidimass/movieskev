import { json } from "@sveltejs/kit";
import { tmdbFetch } from "$lib/server/tmdb";

const TMDB_MAX_PAGES = 500;
const TMDB_PAGES_PER_UI_PAGE = 4;

export async function GET({ url }) {
  const find = (url.searchParams.get("find") || "").trim();
  const language = (url.searchParams.get("language") || "en-US").trim() || "en-US";
  const region = (url.searchParams.get("region") || "").trim();
  const year = (url.searchParams.get("year") || "").trim();
  const genre = (url.searchParams.get("genre") || "").trim();
  const sortRating = url.searchParams.get("sortRating") === "asc" ? "asc" : "desc";
  const pageRaw = Number(url.searchParams.get("page") || "1");
  const pageParsed = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const page = Math.max(1, pageParsed);

  if (!find) {
    return json({ results: [], page, total_pages: 0, total_results: 0 });
  }

  try {
    const baseParams = {
      query: find,
      language,
      region,
      primary_release_year: year,
    };

    const start = (page - 1) * TMDB_PAGES_PER_UI_PAGE + 1;
    const pages = Array.from({ length: TMDB_PAGES_PER_UI_PAGE }, (_, idx) => start + idx).filter(
      (p) => p >= 1 && p <= TMDB_MAX_PAGES,
    );

    const first = await tmdbFetch("/search/movie", { ...baseParams, page: pages[0] || 1 });
    const restPages = pages.slice(1);
    const rest = await Promise.all(restPages.map((p) => tmdbFetch("/search/movie", { ...baseParams, page: p })));

    const merged = [first, ...rest].flatMap((d) => d.results || []);
    const unique = Array.from(new Map(merged.map((m) => [m.id, m])).values());

    const genreFiltered = genre
      ? unique.filter((movie) => Array.isArray(movie.genre_ids) && movie.genre_ids.includes(Number(genre)))
      : unique;

    const sortedResults = [...genreFiltered].sort((a, b) => {
      const diff = (Number(b.vote_average) || 0) - (Number(a.vote_average) || 0);
      return sortRating === "asc" ? -diff : diff;
    });

    const tmdbTotalPages = Math.min(Number(first.total_pages) || 0, TMDB_MAX_PAGES);
    const uiTotalPages = tmdbTotalPages ? Math.ceil(tmdbTotalPages / TMDB_PAGES_PER_UI_PAGE) : 0;

    return json({
      results: sortedResults,
      page,
      total_pages: uiTotalPages,
      total_results: Number(first.total_results) || 0,
    });
  } catch {
    return json({ results: [], page, total_pages: 0, total_results: 0 }, { status: 200 });
  }
}
