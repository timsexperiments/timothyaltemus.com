<script>
  import AvatarPicker from '$lib/components/avatar-picker.svelte';

  /** @type {import('./$types').PageData} */
  export let data;

  /** @type {import('./$types').ActionData} */
  export let form;

  export let { initialUsername } = data;
  export let whoErrors = form?.who?.errors;
  export let whyErrors = form?.why?.errors;
</script>

<div class="flex min-h-full w-full flex-col justify-center px-6 py-12 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-sm">
    <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
      Join the chat server
    </h2>
  </div>
  <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    <form class="space-y-6" method="POST" action="/login?/login">
      <div class="space-y-2">
        <label
          class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          for="who">
          What should we call you?
        </label>
        <div
          class="relative flex w-full rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-inset focus-within:ring-lime-600 sm:max-w-md">
          <span class="flex select-none items-center pl-3 text-gray-500 sm:text-sm"> @ </span>
          <input
            type="text"
            name="who"
            id="who"
            autocomplete="username"
            class="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus-within:outline-none focus:ring-0 sm:text-sm sm:leading-6"
            placeholder="tim"
            value={initialUsername}
            aria-describedby="who-helper" />
          <AvatarPicker />
        </div>
        <p
          id="who-description"
          class:text-red-600={whoErrors?.length}
          class="text-sm text-stone-500">
          {#if whoErrors?.length}whoErrors[0]{:else}This is your public display name.{/if}
        </p>
      </div>
      <div class="space-y-2">
        <label
          class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          for="why">
          Why are you here?
        </label>
        <textarea
          id="why"
          name="why"
          aria-describedby="why-description"
          rows="3"
          class="block w-full rounded-md border-0 p-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus-within:outline-none focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
        ></textarea>
        <p
          id="why-description"
          class:text-red-600={whyErrors?.length}
          class="text-sm text-stone-500">
          {#if whyErrors?.length}
            {whyErrors[0]}
          {:else}
            Write a few sentences about yourself
          {/if}
        </p>
      </div>
      <div>
        <button
          class="flex h-10 w-full items-center justify-center rounded-md bg-lime-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm ring-offset-white transition-colors hover:bg-lime-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600 focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          type="submit">
          Join
        </button>
      </div>
    </form>
    {#if initialUsername}
      <p class="mt-10 text-center text-sm text-gray-500">
        Are you {initialUsername}?&nbsp;
        <a href="/chat" class="font-semibold leading-6 text-lime-600 hover:text-lime-500">
          Go to the chat!
        </a>
      </p>
    {/if}
  </div>
</div>

<style>
</style>
