import { error } from "@sveltejs/kit";
import { tmdbFetch } from "$lib/server/tmdb";
import { unslugifyTitle } from "$lib/utils/slug";

export async function load({ params, url }) {
  const idFromQuery = Number(url.searchParams.get("id"));
  const idFromPath = Number(params.id);
  let personId = null;

  if (Number.isFinite(idFromQuery) && idFromQuery > 0) {
    personId = idFromQuery;
  } else if (Number.isFinite(idFromPath) && idFromPath > 0) {
    personId = idFromPath;
  } else {
    const query = unslugifyTitle(params.id);
    if (!query) {
      throw error(404, "Actor not found");
    }

    const people = await tmdbFetch("/search/person", {
      query,
      language: "en-US",
      include_adult: false,
    });

    const firstMatch = people.results?.[0];
    if (!firstMatch?.id) {
      throw error(404, "Actor not found");
    }

    personId = firstMatch.id;
  }

  try {
    const [person, movies, images] = await Promise.all([
      tmdbFetch(`/person/${personId}`),
      tmdbFetch(`/person/${personId}/movie_credits`),
      tmdbFetch(`/person/${personId}/images`),
    ]);

    return {
      person,
      filmography: movies.cast || [],
      gallery: images.profiles || [],
    };
  } catch {
    throw error(404, "Actor not found");
  }
}
