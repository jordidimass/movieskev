<script>
  export let value = 0;
  export let max = 10;
  export let size = 96;
  export let stroke = 9;

  const clamp = (n, min, maxValue) => Math.min(Math.max(n, min), maxValue);

  $: safeMax = Number(max) > 0 ? Number(max) : 10;
  $: safeValue = clamp(Number(value) || 0, 0, safeMax);
  $: percent = (safeValue / safeMax) * 100;
  $: radius = (size - stroke) / 2;
  $: circumference = 2 * Math.PI * radius;
  $: dashOffset = circumference - (percent / 100) * circumference;
  $: toneClass =
    percent >= 70
      ? "text-emerald-400"
      : percent >= 50
        ? "text-amber-400"
        : "text-rose-400";
</script>

<div class="relative inline-grid place-items-center" style={`width:${size}px;height:${size}px`}>
  <svg viewBox={`0 0 ${size} ${size}`} class="h-full w-full -rotate-90">
    <circle
      cx={size / 2}
      cy={size / 2}
      r={radius}
      fill="none"
      stroke="rgba(255,255,255,0.14)"
      stroke-width={stroke}
    />
    <circle
      cx={size / 2}
      cy={size / 2}
      r={radius}
      fill="none"
      stroke="currentColor"
      stroke-width={stroke}
      stroke-linecap="round"
      stroke-dasharray={circumference}
      stroke-dashoffset={dashOffset}
      class={`${toneClass} transition-[stroke-dashoffset] duration-700 ease-out`}
    />
  </svg>
  <div class="pointer-events-none absolute inset-0 grid place-items-center text-center leading-none">
    <span class="text-lg font-semibold">{safeValue.toFixed(1)}</span>
  </div>
</div>
