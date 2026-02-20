<script>
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import Input from "$ui/input.svelte";
  import Button from "$ui/button.svelte";
  import Select from "$ui/select.svelte";
  import SlidersHorizontal from "$ui/sliders-horizontal.svelte";
  import { slugifyTitle } from "$lib/utils/slug";

  export let data;

  let query = "";
  let language = "en-US";
  let region = "";
  let year = "";
  let sortRating = "desc";
  let genre = "";
  let panelOpen = false;
  let initialized = false;
  let searchTimer;
  let initialState = "";

  function buildSearchUrl() {
    const params = new URLSearchParams();
    if (query.trim()) params.set("find", query.trim());
    if (language) params.set("language", language);
    if (region) params.set("region", region);
    if (year) params.set("year", year);
    if (sortRating) params.set("sortRating", sortRating);
    if (genre) params.set("genre", genre);
    return `/?${params.toString()}`;
  }

  function currentState() {
    return JSON.stringify({ query: query.trim(), language, region, year, sortRating, genre });
  }

  function runSearchNavigation() {
    goto(buildSearchUrl());
  }

  function queueSearch() {
    if (!initialized) return;
    if (currentState() === initialState) return;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      runSearchNavigation();
    }, 220);
  }

  function parseFiltersFromUrl() {
    const params = new URLSearchParams(window.location.search);
    query = params.get("find") || "";
    language = params.get("language") || "en-US";
    region = params.get("region") || "";
    year = params.get("year") || "";
    sortRating = params.get("sortRating") === "asc" ? "asc" : "desc";
    genre = params.get("genre") || "";
  }

  onMount(() => {
    parseFiltersFromUrl();
    initialState = currentState();
    initialized = true;
  });

  $: query, queueSearch();
  $: language, queueSearch();
  $: region, queueSearch();
  $: year, queueSearch();
  $: sortRating, queueSearch();
  $: genre, queueSearch();
</script>

<div class="fixed inset-0 z-0 opacity-25 mix-blend-soft-light" style="background-image:url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='1' height='1' fill='rgba(255,255,255,0.08)'/%3E%3C/svg%3E')"></div>

<nav class="shell glass sticky top-4 z-40 mt-8 flex flex-col gap-4 p-5 sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
  <a class="text-3xl font-semibold tracking-[0.14em]" href="/">MOVIES<span class="text-pink-600">KEV</span></a>
  <form class="relative w-full flex-1" action={buildSearchUrl()}>
    <div class="flex gap-2 sm:gap-3">
      <Input bind:value={query} name="find" placeholder="Search movies or talent" autocomplete="off" className="h-11" />
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
      <div transition:slide={{ duration: 220 }} class="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div class="flex gap-4 overflow-x-auto pb-1">
          <label class="min-w-[180px] space-y-1 text-sm"><span class="text-xs uppercase tracking-[0.2em] text-zinc-400">Language</span><Select bind:value={language}><option value="en-US">English (US)</option><option value="es-ES">Espanol (ES)</option><option value="es-MX">Espanol (MX)</option><option value="fr-FR">Francais</option></Select></label>
          <label class="min-w-[180px] space-y-1 text-sm"><span class="text-xs uppercase tracking-[0.2em] text-zinc-400">Region</span><Select bind:value={region}><option value="">Worldwide</option><option value="US">United States</option><option value="ES">Spain</option><option value="MX">Mexico</option><option value="GB">United Kingdom</option></Select></label>
          <label class="min-w-[180px] space-y-1 text-sm"><span class="text-xs uppercase tracking-[0.2em] text-zinc-400">Year</span><Input bind:value={year} type="number" min="1900" max="2099" className="rounded-xl" /></label>
          <label class="min-w-[220px] space-y-1 text-sm"><span class="text-xs uppercase tracking-[0.2em] text-zinc-400">Sort by rating</span><Select bind:value={sortRating}><option value="desc">Highest first</option><option value="asc">Lowest first</option></Select></label>
          <label class="min-w-[220px] space-y-1 text-sm"><span class="text-xs uppercase tracking-[0.2em] text-zinc-400">Genre</span><Select bind:value={genre}><option value="">All genres</option><option value="28">Action</option><option value="12">Adventure</option><option value="16">Animation</option><option value="35">Comedy</option><option value="80">Crime</option><option value="18">Drama</option><option value="14">Fantasy</option><option value="27">Horror</option><option value="10749">Romance</option><option value="878">Science Fiction</option><option value="53">Thriller</option></Select></label>
        </div>
      </div>
    {/if}
  </form>
</nav>

<header class="shell relative z-10 py-8 sm:py-10">
  <section class="glass mt-6 grid gap-8 p-6 lg:grid-cols-[minmax(280px,420px)_1fr] lg:p-8">
    <div class="aspect-[2/3] min-h-[420px] rounded-2xl bg-cover bg-center" style={`background-image:url(${data.person.profile_path ? `https://image.tmdb.org/t/p/original${data.person.profile_path}` : "/img/guest.jpg"})`}></div>
    <div class="flex flex-col justify-center gap-4">
      <p class="text-xs uppercase tracking-[0.3em] text-zinc-500">Director spotlight</p>
      <h1 class="text-4xl font-semibold sm:text-5xl">{data.person.name}</h1>
      <div class="flex flex-wrap gap-3 text-sm text-zinc-300">
        {#if data.person.birthday}<span>Born {data.person.birthday}</span>{/if}
        {#if data.person.place_of_birth}<span>{data.person.place_of_birth}</span>{/if}
        {#if data.person.known_for_department}<span>{data.person.known_for_department}</span>{/if}
      </div>
      {#if data.person.biography}<p class="text-zinc-300">{data.person.biography}</p>{/if}
    </div>
  </section>
</header>

<main class="shell relative z-10 pb-16">
  <section class="glass p-6">
    <p class="text-xs uppercase tracking-[0.3em] text-zinc-500">Filmography</p>
    <h2 class="mt-1 text-3xl font-semibold">Directed movies</h2>
    {#if data.filmography.length}
      <div class="movie-grid">
        {#each data.filmography as movie}
          <a class="poster-card" href={`/title/${slugifyTitle(movie.original_title || movie.title)}?id=${movie.id}&language=${encodeURIComponent(language)}&region=${encodeURIComponent(region)}&year=${encodeURIComponent(year)}&sortRating=${encodeURIComponent(sortRating)}&genre=${encodeURIComponent(genre)}`}>
            <img src={movie.poster_path ? `https://image.tmdb.org/t/p/w400${movie.poster_path}` : "/img/guest.jpg"} alt={`Poster for ${movie.original_title || movie.title}`} />
          </a>
        {/each}
      </div>
    {:else}
      <div class="mt-6 rounded-xl border border-dashed border-white/20 p-6 text-zinc-400">No directed movies were found.</div>
    {/if}
  </section>
</main>
