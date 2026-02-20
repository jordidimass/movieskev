<script>
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import Button from "$ui/button.svelte";
  import Input from "$ui/input.svelte";
  import Select from "$ui/select.svelte";
  import SlidersHorizontal from "$ui/sliders-horizontal.svelte";
  import { slugifyTitle } from "$lib/utils/slug";

  export let data;

  let query = data.initialQuery;
  let language = data.initialLanguage;
  let region = data.initialRegion;
  let year = data.initialYear;
  let sortRating = data.initialSortRating;
  let genre = data.initialGenre;

  let loading = true;
  let movies = [];
  let panelOpen = false;
  let searchTimer;
  let initialized = false;

  function buildFilterParams() {
    const params = new URLSearchParams();
    if (query.trim()) params.set("find", query.trim());
    if (language) params.set("language", language);
    if (region) params.set("region", region);
    if (year) params.set("year", year);
    if (sortRating) params.set("sortRating", sortRating);
    if (genre) params.set("genre", genre);
    return params;
  }

  function syncUrlState() {
    const params = buildFilterParams();
    const target = params.toString() ? `/?${params.toString()}` : "/";
    window.history.replaceState(window.history.state, "", target);
  }

  async function loadPopular() {
    loading = true;
    const params = new URLSearchParams({
      language,
      sortRating,
    });

    if (region) params.set("region", region);
    if (year) params.set("year", year);
    if (genre) params.set("genre", genre);

    const response = await fetch(`/api/popular?${params.toString()}`);
    const body = await response.json();
    movies = body.results || [];
    loading = false;
  }

  async function runSearch() {
    const trimmed = query.trim();
    if (!trimmed) {
      await loadPopular();
      return;
    }

    loading = true;
    const params = new URLSearchParams({
      find: trimmed,
      language,
      sortRating,
    });

    if (region) params.set("region", region);
    if (year) params.set("year", year);
    if (genre) params.set("genre", genre);

    const response = await fetch(`/api/search?${params.toString()}`);
    const body = await response.json();
    movies = body.results || [];
    loading = false;
  }

  function queueSearch() {
    if (!initialized) return;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      syncUrlState();
      runSearch();
    }, 220);
  }

  function submitSearch(event) {
    event.preventDefault();
    syncUrlState();
    runSearch();
    panelOpen = false;
  }

  onMount(async () => {
    initialized = true;
    await runSearch();
  });

  $: query, queueSearch();
  $: language, queueSearch();
  $: region, queueSearch();
  $: year, queueSearch();
  $: sortRating, queueSearch();
  $: genre, queueSearch();

  function activeFiltersQuery() {
    const params = buildFilterParams();
    return params.toString();
  }
</script>

<div class="fixed inset-0 z-0 opacity-25 mix-blend-soft-light" style="background-image:url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='1' height='1' fill='rgba(255,255,255,0.08)'/%3E%3C/svg%3E')"></div>

<nav class="shell glass sticky top-4 z-40 mt-8 flex flex-col gap-4 p-5 sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
    <a class="text-3xl font-semibold tracking-[0.14em]" href="/">
      MOVIES<span class="text-pink-600">KEV</span>
    </a>

    <form class="relative w-full flex-1" on:submit={submitSearch}>
      <div class="flex w-full gap-2 sm:gap-3">
        <Input
          bind:value={query}
          name="find"
          placeholder="Search movies or talent"
          autocomplete="off"
          className="h-11"
        />
        <Button
          type="button"
          variant="ghost"
          className="h-11 w-11 rounded-full border-0 bg-white/5 p-0 hover:bg-white/15"
          on:click={() => (panelOpen = !panelOpen)}
          aria-label="Toggle filters"
        >
          <SlidersHorizontal size={18} active={panelOpen} className="opacity-95" />
        </Button>
      </div>

      {#if panelOpen}
        <div transition:slide={{ duration: 220 }} class="mt-4 w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div class="flex gap-4 overflow-x-auto pb-1">
            <label class="min-w-[180px] space-y-1 text-sm">
              <span class="text-xs uppercase tracking-[0.2em] text-zinc-400">Language</span>
              <Select bind:value={language}>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Espanol (ES)</option>
                <option value="es-MX">Espanol (MX)</option>
                <option value="fr-FR">Francais</option>
              </Select>
            </label>
            <label class="min-w-[180px] space-y-1 text-sm">
              <span class="text-xs uppercase tracking-[0.2em] text-zinc-400">Region</span>
              <Select bind:value={region}>
                <option value="">Worldwide</option>
                <option value="US">United States</option>
                <option value="ES">Spain</option>
                <option value="MX">Mexico</option>
                <option value="GB">United Kingdom</option>
              </Select>
            </label>
            <label class="min-w-[180px] space-y-1 text-sm">
              <span class="text-xs uppercase tracking-[0.2em] text-zinc-400">Year</span>
              <Input bind:value={year} type="number" min="1900" max="2099" placeholder="e.g. 2024" className="rounded-xl" />
            </label>
            <label class="min-w-[220px] space-y-1 text-sm">
              <span class="text-xs uppercase tracking-[0.2em] text-zinc-400">Sort by rating</span>
              <Select bind:value={sortRating}>
                <option value="desc">Highest first</option>
                <option value="asc">Lowest first</option>
              </Select>
            </label>
            <label class="min-w-[220px] space-y-1 text-sm">
              <span class="text-xs uppercase tracking-[0.2em] text-zinc-400">Genre</span>
              <Select bind:value={genre}>
                <option value="">All genres</option>
                <option value="28">Action</option>
                <option value="12">Adventure</option>
                <option value="16">Animation</option>
                <option value="35">Comedy</option>
                <option value="80">Crime</option>
                <option value="18">Drama</option>
                <option value="14">Fantasy</option>
                <option value="27">Horror</option>
                <option value="10749">Romance</option>
                <option value="878">Science Fiction</option>
                <option value="53">Thriller</option>
              </Select>
            </label>
          </div>
        </div>
      {/if}
    </form>
  </nav>

<main class="shell relative z-10 pb-14">
  {#if loading}
    <div class="glass p-10 text-center text-zinc-300">Loading movies...</div>
  {:else if movies.length}
    <div class="movie-grid">
      {#each movies as movie}
        <a class="poster-card" href={`/title/${slugifyTitle(movie.title || movie.original_title)}?id=${movie.id}${activeFiltersQuery() ? `&${activeFiltersQuery()}` : ""}`}>
          <img src={movie.poster_path ? `https://image.tmdb.org/t/p/w400${movie.poster_path}` : "/img/guest.jpg"} alt={`Poster for ${movie.title || movie.original_title}`} />
        </a>
      {/each}
    </div>
  {:else}
    <div class="glass p-10 text-center text-zinc-400">No matches found. Try another title or cast member.</div>
  {/if}
</main>
