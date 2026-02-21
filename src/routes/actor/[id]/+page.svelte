<script>
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { fade, scale, slide } from "svelte/transition";
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
  let selectedGalleryIndex = -1;
  let galleryRowEl;
  let initialized = false;
  let searchTimer;
  let initialState = "";

  $: selectedGalleryItem = selectedGalleryIndex >= 0 ? data.gallery[selectedGalleryIndex] : null;

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

  function openGalleryItem(index) {
    selectedGalleryIndex = index;
  }

  function closeGalleryItem() {
    selectedGalleryIndex = -1;
  }

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeGalleryItem();
    }
  }

  function scrollRow(element, direction) {
    if (!element) return;
    element.scrollBy({ left: direction * 520, behavior: "smooth" });
  }

  function goToAdjacentGalleryItem(direction) {
    if (!data.gallery.length || selectedGalleryIndex < 0) return;
    const last = data.gallery.length - 1;
    if (direction > 0) {
      selectedGalleryIndex = selectedGalleryIndex >= last ? 0 : selectedGalleryIndex + 1;
    } else {
      selectedGalleryIndex = selectedGalleryIndex <= 0 ? last : selectedGalleryIndex - 1;
    }
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

<svelte:window
  on:keydown={(event) => {
    if (!selectedGalleryItem) return;
    if (event.key === "Escape") closeGalleryItem();
    if (event.key === "ArrowRight") goToAdjacentGalleryItem(1);
    if (event.key === "ArrowLeft") goToAdjacentGalleryItem(-1);
  }}
/>

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
      <p class="text-xs uppercase tracking-[0.3em] text-zinc-500">Talent spotlight</p>
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

<main class="shell relative z-10 space-y-6 pb-16">
  <section class="glass p-6">
    <p class="text-xs uppercase tracking-[0.3em] text-zinc-500">Gallery</p>
    <h2 class="mt-1 text-3xl font-semibold">Pictures</h2>
    {#if data.gallery.length}
      <div class="relative mt-6">
        <button type="button" class="absolute left-2 top-[45%] z-10 grid h-10 w-10 place-items-center rounded-full border border-orange-300/40 bg-black/70 text-orange-300 backdrop-blur transition hover:scale-105 hover:border-orange-300 hover:text-orange-200" on:click={() => scrollRow(galleryRowEl, -1)} aria-label="Scroll gallery left">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"></path></svg>
        </button>
        <button type="button" class="absolute right-2 top-[45%] z-10 grid h-10 w-10 place-items-center rounded-full border border-orange-300/40 bg-black/70 text-orange-300 backdrop-blur transition hover:scale-105 hover:border-orange-300 hover:text-orange-200" on:click={() => scrollRow(galleryRowEl, 1)} aria-label="Scroll gallery right">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
        </button>

        <div class="orange-scroll grid grid-flow-col gap-6 overflow-x-auto pb-3" bind:this={galleryRowEl}>
          {#each data.gallery as item, index}
            <button
              type="button"
              class="group relative w-[220px] overflow-hidden rounded-2xl border border-white/10 bg-black/30 text-left"
              on:click={() => openGalleryItem(index)}
              aria-label="Open portrait"
            >
              <img class="h-[330px] w-full object-cover transition duration-300 group-hover:scale-[1.03]" src={item.file_path ? `https://image.tmdb.org/t/p/original${item.file_path}` : "/img/guest.jpg"} alt="Portrait still" />
              <span class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-70"></span>
              <span class="absolute bottom-3 right-3 rounded-lg bg-white/90 p-2 text-zinc-900 shadow-lg transition group-hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
              </span>
            </button>
          {/each}
        </div>
      </div>
    {:else}
      <div class="mt-6 rounded-xl border border-dashed border-white/20 p-6 text-zinc-400">No gallery assets available.</div>
    {/if}
  </section>

  <section class="glass p-6">
    <p class="text-xs uppercase tracking-[0.3em] text-zinc-500">Filmography</p>
    <h2 class="mt-1 text-3xl font-semibold">Movies</h2>
    {#if data.filmography.length}
      <div class="movie-grid">
        {#each data.filmography as movie}
          <a class="poster-card" href={`/title/${slugifyTitle(movie.original_title || movie.title)}?id=${movie.id}&language=${encodeURIComponent(language)}&region=${encodeURIComponent(region)}&year=${encodeURIComponent(year)}&sortRating=${encodeURIComponent(sortRating)}&genre=${encodeURIComponent(genre)}`}>
            <img src={movie.poster_path ? `https://image.tmdb.org/t/p/w400${movie.poster_path}` : "/img/guest.jpg"} alt={`Poster for ${movie.original_title || movie.title}`} />
          </a>
        {/each}
      </div>
    {:else}
      <div class="mt-6 rounded-xl border border-dashed border-white/20 p-6 text-zinc-400">No filmography entries were found.</div>
    {/if}
  </section>
</main>

{#if selectedGalleryItem}
  <div
    class="fixed inset-0 z-[90] grid place-items-center bg-black/45 px-4 backdrop-blur-xl"
    role="button"
    tabindex="0"
    aria-label="Close image modal"
    on:click={handleOverlayClick}
    on:keydown={(event) => (event.key === "Enter" || event.key === " ") && closeGalleryItem()}
    transition:fade={{ duration: 180 }}
  >
    <div class="relative w-[min(88vw,980px)] overflow-hidden rounded-[24px] border border-white/20 bg-zinc-950/90 shadow-2xl" transition:scale={{ duration: 220, start: 0.92 }}>
      <button type="button" class="absolute left-4 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-orange-300/40 bg-black/60 text-orange-300 backdrop-blur transition hover:scale-105 hover:border-orange-300 hover:text-orange-200" on:click={() => goToAdjacentGalleryItem(-1)} aria-label="Previous image">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"></path></svg>
      </button>
      <button type="button" class="absolute right-4 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-orange-300/40 bg-black/60 text-orange-300 backdrop-blur transition hover:scale-105 hover:border-orange-300 hover:text-orange-200" on:click={() => goToAdjacentGalleryItem(1)} aria-label="Next image">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
      </button>
      <button type="button" class="absolute right-4 top-4 z-10 rounded-lg bg-black/60 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white/80 hover:bg-black/80" on:click={closeGalleryItem}>Close</button>
      <img
        class="mx-auto max-h-[85vh] w-auto max-w-full object-contain"
        src={selectedGalleryItem.file_path ? `https://image.tmdb.org/t/p/original${selectedGalleryItem.file_path}` : "/img/guest.jpg"}
        alt="Actor portrait"
      />
    </div>
  </div>
{/if}
