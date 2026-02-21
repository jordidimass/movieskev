<script>
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import Input from "$ui/input.svelte";
  import Button from "$ui/button.svelte";
  import Select from "$ui/select.svelte";
  import SlidersHorizontal from "$ui/sliders-horizontal.svelte";
  import Eye from "$ui/eye.svelte";
  import ArrowLeft from "$ui/arrow-left.svelte";
  import CircularProgress from "$ui/circular-progress.svelte";
  import { slugifyTitle } from "$lib/utils/slug";

  export let data;

  let query = "";
  let language = "en-US";
  let region = "";
  let year = "";
  let sortRating = "desc";
  let genre = "";
  let panelOpen = false;
  let castRowEl;
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

  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.href = buildSearchUrl();
  }

  function scrollRow(element, direction) {
    if (!element) return;
    element.scrollBy({ left: direction * 480, behavior: "smooth" });
  }

  function letterboxdUrl(movie) {
    const title = movie?.title || movie?.original_title || "";
    const year = (movie?.release_date || "").slice(0, 4);
    const query = `${title} ${year}`.trim();
    return `https://letterboxd.com/search/${encodeURIComponent(query)}/`;
  }

  onMount(() => {
    parseFiltersFromUrl();
    initialState = currentState();
    initialized = true;
  });

  $: movieTitle = data.movie.title || data.movie.original_title || "Untitled";
  $: releaseDateLabel = formatReleaseDate(data.movie.release_date);

  function formatReleaseDate(rawDate) {
    if (!rawDate) return "";
    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) return rawDate;
    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
  }

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
  <section class="glass relative mt-6 grid gap-8 p-6 lg:grid-cols-[minmax(280px,420px)_1fr] lg:p-8">
    <Button type="button" variant="outline" className="absolute right-4 top-4 z-10 h-10 w-10 rounded-full p-0" on:click={goBack} aria-label="Go back">
      <ArrowLeft size={18} className="text-orange-200" />
    </Button>
    <div class="aspect-[2/3] min-h-[420px] rounded-2xl bg-cover bg-center" style={`background-image:url(https://image.tmdb.org/t/p/original${data.movie.poster_path || ""})`}></div>
    <div class="flex flex-col justify-center gap-4">
      {#if data.movieLogoUrl}
        <img
          class="max-h-20 w-auto max-w-full object-contain [filter:drop-shadow(0_10px_24px_rgba(0,0,0,0.55))] sm:max-h-24"
          src={data.movieLogoUrl}
          alt={`${movieTitle} logo`}
          loading="eager"
          decoding="async"
        />
        <h1 class="sr-only">{movieTitle}</h1>
      {:else}
        <h1 class="text-4xl font-semibold sm:text-5xl">{movieTitle}</h1>
      {/if}
      <div class="flex flex-wrap items-center gap-5 text-sm text-zinc-300">
        {#if data.movie.vote_average}
          <div class="flex items-center gap-3">
            <CircularProgress value={data.movie.vote_average} max={10} size={56} stroke={7} />
            <span class="text-xs uppercase tracking-[0.22em] text-zinc-400">TMDB score</span>
          </div>
        {/if}
        {#if releaseDateLabel}<span>Released {releaseDateLabel}</span>{/if}
        {#if data.movie.runtime}<span>{data.movie.runtime} min</span>{/if}
      </div>
      {#if data.director}
        <a
          href={`/director/${slugifyTitle(data.director.name)}?id=${data.director.id}&language=${encodeURIComponent(language)}&region=${encodeURIComponent(region)}&year=${encodeURIComponent(year)}&sortRating=${encodeURIComponent(sortRating)}&genre=${encodeURIComponent(genre)}`}
          class="w-fit text-sm text-orange-200 transition hover:text-orange-100"
        >
          Directed by {data.director.name}
        </a>
      {/if}
      {#if data.movie.overview}<p class="text-zinc-300">{data.movie.overview}</p>{/if}
      <div class="flex flex-wrap gap-3">
        <a
          href={letterboxdUrl(data.movie)}
          target="_blank"
          rel="noopener noreferrer"
          class="group inline-flex w-fit items-center gap-2 rounded-xl border border-orange-300/30 bg-black/35 px-3 py-2 text-xs uppercase tracking-[0.18em] text-orange-200 transition hover:border-orange-300 hover:bg-black/55"
        >
          <Eye size={16} className="text-orange-300 transition group-hover:text-orange-200" active={false} />
          View on Letterboxd
        </a>
        {#if data.trailerUrl}
          <a
            href={data.trailerUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="group inline-flex w-fit items-center gap-2 rounded-xl border border-orange-300/30 bg-black/35 px-3 py-2 text-xs uppercase tracking-[0.18em] text-orange-200 transition hover:border-orange-300 hover:bg-black/55"
          >
            Watch Trailer
          </a>
        {/if}
      </div>
    </div>
  </section>
</header>

<main class="shell relative z-10 pb-16">
  <section class="glass p-6">
    <p class="text-xs uppercase tracking-[0.3em] text-zinc-500">Cast</p>
    <h2 class="mt-1 text-3xl font-semibold">Lead talent</h2>
    {#if data.cast.length}
      <div class="relative mt-6">
        <button type="button" class="absolute left-2 top-[45%] z-10 grid h-10 w-10 place-items-center rounded-full border border-orange-300/40 bg-black/70 text-orange-300 backdrop-blur transition hover:scale-105 hover:border-orange-300 hover:text-orange-200" on:click={() => scrollRow(castRowEl, -1)} aria-label="Scroll cast left">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"></path></svg>
        </button>
        <button type="button" class="absolute right-2 top-[45%] z-10 grid h-10 w-10 place-items-center rounded-full border border-orange-300/40 bg-black/70 text-orange-300 backdrop-blur transition hover:scale-105 hover:border-orange-300 hover:text-orange-200" on:click={() => scrollRow(castRowEl, 1)} aria-label="Scroll cast right">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
        </button>

        <div class="orange-scroll grid grid-flow-col gap-6 overflow-x-auto pb-3" bind:this={castRowEl}>
          {#each data.cast as member}
            <article class="w-[200px] text-center">
              <a href={`/actor/${slugifyTitle(member.name)}?id=${member.id}&language=${encodeURIComponent(language)}&region=${encodeURIComponent(region)}&year=${encodeURIComponent(year)}&sortRating=${encodeURIComponent(sortRating)}&genre=${encodeURIComponent(genre)}`}>
                <img class="h-[300px] w-full rounded-2xl object-cover" src={member.profile_path ? `https://image.tmdb.org/t/p/w400${member.profile_path}` : "/img/guest.jpg"} alt={`Portrait of ${member.name}`} />
              </a>
              <p class="mt-3 text-sm">{member.name}</p>
            </article>
          {/each}
        </div>
      </div>
    {:else}
      <div class="mt-6 rounded-xl border border-dashed border-white/20 p-6 text-zinc-400">Cast information is not available.</div>
    {/if}
  </section>
</main>
