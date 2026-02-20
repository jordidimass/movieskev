const API_KEY = "bf1b3a179a48104bd1bbf23e4b68a18a";
const BASE_URL = "https://api.themoviedb.org/3";

export async function tmdbFetch(pathname, params = {}) {
  const url = new URL(`${BASE_URL}${pathname}`);
  url.searchParams.set("api_key", API_KEY);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB request failed (${response.status})`);
  }

  return response.json();
}
