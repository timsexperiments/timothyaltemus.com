<script>
  export let expanded = false;

  function toggle() {
    expanded = !expanded;
  }
</script>

<div class="relative inline-block text-left">
  <div>
    <button
      on:click={toggle}
      type="button"
      class="-xml-px relative inline-flex items-center gap-x-1.5 rounded-md border-transparent px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-transparent focus-within:outline-none focus-within:ring-2 focus-within:ring-lime-600 hover:border-transparent hover:bg-gray-50 hover:ring-2 hover:ring-lime-600"
      id="menu-button"
      aria-expanded="true"
      aria-haspopup="true">
      <slot name="display" />
      <svg
        class="-mr-1 h-5 w-5 text-gray-400"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true">
        <path
          fill-rule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clip-rule="evenodd" />
      </svg>
    </button>
  </div>

  <div
    class="absolute right-0 mt-2 origin-top-right scale-95 divide-y divide-gray-100 overflow-hidden rounded-md bg-white opacity-0 shadow-lg ring-1 ring-black ring-opacity-5 transition duration-75 ease-in-out hover:ring-transparent focus:outline-none"
    class:opacity-0={!expanded}
    class:scale-95={!expanded}
    class:opacity-100={expanded}
    class:scale-100={expanded}
    class:-z-10={!expanded}
    class:z-100={expanded}
    role="menu"
    aria-orientation="vertical"
    aria-labelledby="menu-button"
    tabindex="-1">
    <slot name="options" />
  </div>
</div>
