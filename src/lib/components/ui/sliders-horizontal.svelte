<script>
  export let size = 18;
  export let className = "";
  export let active = false;

  let hovered = false;

  $: animate = active || hovered;
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
  <line x1="21" y1="4" x2="14" y2="4" />
  <line x1="10" y1="4" x2="3" y2="4" />
  <line x1="21" y1="12" x2="12" y2="12" />
  <line x1="8" y1="12" x2="3" y2="12" />
  <line x1="12" y1="20" x2="3" y2="20" />
  <line x1="21" y1="20" x2="16" y2="20" />

  <g class:move-top={animate}>
    <line x1="14" y1="2" x2="14" y2="6" />
  </g>
  <g class:move-mid={animate}>
    <line x1="8" y1="10" x2="8" y2="14" />
  </g>
  <g class:move-bottom={animate}>
    <line x1="16" y1="18" x2="16" y2="22" />
  </g>
</svg>

<style>
  g {
    transition: transform 240ms cubic-bezier(0.34, 1.56, 0.64, 1);
    transform-box: fill-box;
  }

  .move-top {
    transform: translateX(-4px);
  }

  .move-mid {
    transform: translateX(5px);
  }

  .move-bottom {
    transform: translateX(-7px);
  }
</style>
