import { error } from "@sveltejs/kit";
import { tmdbFetch } from "$lib/server/tmdb";

export async function load({ params }) {
  try {
    const [movie, credits] = await Promise.all([
      tmdbFetch(`/movie/${params.id}`),
      tmdbFetch(`/movie/${params.id}/credits`),
    ]);

    return {
      movie,
      cast: credits.cast || [],
    };
  } catch {
    throw error(404, "Movie not found");
  }
}
