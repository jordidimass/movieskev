import { error } from "@sveltejs/kit";
import { tmdbFetch } from "$lib/server/tmdb";
import { unslugifyTitle } from "$lib/utils/slug";

export async function load({ params, url }) {
  const idFromQuery = Number(url.searchParams.get("id"));
  let movieId = Number.isFinite(idFromQuery) && idFromQuery > 0 ? idFromQuery : null;

  if (!movieId) {
    try {
      const query = unslugifyTitle(params.slug);

      if (!query) {
        throw error(404, "Movie not found");
      }

      const search = await tmdbFetch("/search/movie", {
        query,
        language: "en-US",
        include_adult: false,
      });

      const firstMatch = search.results?.[0];
      if (!firstMatch?.id) {
        throw error(404, "Movie not found");
      }

      movieId = firstMatch.id;
    } catch {
      throw error(404, "Movie not found");
    }
  }

  try {
    const [movie, credits, videos, images] = await Promise.all([
      tmdbFetch(`/movie/${movieId}`),
      tmdbFetch(`/movie/${movieId}/credits`),
      tmdbFetch(`/movie/${movieId}/videos`, { language: "en-US" }),
      tmdbFetch(`/movie/${movieId}/images`, { include_image_language: "en,null" }),
    ]);

    const logoCandidates = (images.logos || [])
      .filter((item) => item?.file_path)
      .filter((item) => item.file_path.toLowerCase().endsWith(".png"));

    const rankedLogos = logoCandidates.sort((a, b) => {
      const aLangScore = a.iso_639_1 === "en" ? 2 : a.iso_639_1 ? 1 : 0;
      const bLangScore = b.iso_639_1 === "en" ? 2 : b.iso_639_1 ? 1 : 0;
      if (aLangScore !== bLangScore) return bLangScore - aLangScore;

      const aRatioScore = a.width > 0 && a.height > 0 ? a.width / a.height : 0;
      const bRatioScore = b.width > 0 && b.height > 0 ? b.width / b.height : 0;
      if (aRatioScore !== bRatioScore) return bRatioScore - aRatioScore;

      const aVoteScore = (a.vote_average || 0) * (a.vote_count || 0);
      const bVoteScore = (b.vote_average || 0) * (b.vote_count || 0);
      if (aVoteScore !== bVoteScore) return bVoteScore - aVoteScore;

      return (b.width || 0) - (a.width || 0);
    });

    const bestLogoPath = rankedLogos[0]?.file_path || "";

    const youtubeVideos = (videos.results || []).filter((item) => item.site === "YouTube" && item.key);
    const trailer =
      youtubeVideos.find((item) => item.type === "Trailer" && item.official) ||
      youtubeVideos.find((item) => item.type === "Trailer") ||
      youtubeVideos[0];

    const director =
      (credits.crew || []).find((item) => item.job === "Director") ||
      (credits.crew || []).find((item) => item.department === "Directing") ||
      null;

    return {
      movie,
      cast: credits.cast || [],
      trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : "",
      movieLogoUrl: bestLogoPath ? `https://image.tmdb.org/t/p/w780${bestLogoPath}` : "",
      director: director ? { id: director.id, name: director.name } : null,
    };
  } catch {
    throw error(404, "Movie not found");
  }
}
