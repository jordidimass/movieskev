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
  <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
  <circle cx="12" cy="12" r="3" />
  <circle cx="12" cy="12" r="1" class:blink={animate} />
</svg>

<style>
  circle {
    transform-origin: center;
    transition: transform 220ms ease, opacity 220ms ease;
  }

  .blink {
    transform: scale(1.45);
    opacity: 0.8;
  }
</style>
