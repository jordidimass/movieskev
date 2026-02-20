<script>
  export let size = 18;
  export let className = "";

  let hovered = false;
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  class={className}
  aria-hidden="true"
  on:mouseenter={() => (hovered = true)}
  on:mouseleave={() => (hovered = false)}
>
  <path d="M19 12H5" class:slide-back={hovered} />
  <path d="m12 19-7-7 7-7" class:arrow-pop={hovered} />
</svg>

<style>
  path {
    transition: transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 220ms ease;
    transform-box: fill-box;
    transform-origin: center;
  }

  .slide-back {
    transform: translateX(-2px);
  }

  .arrow-pop {
    transform: translateX(-3px) scale(1.04);
  }
</style>
