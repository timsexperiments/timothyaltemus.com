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

<div class="flex flex-grow items-center justify-center">
  <div class="max-w-md bg-white shadow sm:rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <h1 class="text-base font-semibold leading-6 text-gray-900">Who are you?</h1>
      <form
        method="POST"
        action="/login?/login"
        class="mt-2 gap-x-2 sm:flex sm:items-end sm:justify-between">
        <div>
          <div class="mt-2 grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-6">
            <div class="group/input sm:col-span-full">
              <label for="who" class="block text-sm font-medium leading-6 text-gray-900">
                What should we call you?
              </label>
              <div class="mt-2">
                <div
                  class="relative flex w-full rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-inset focus-within:ring-lime-600 sm:max-w-md">
                  <span class="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                    @
                  </span>
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
                {#if whoErrors?.length}
                  <p class="mt-2 text-sm text-red-600" id="who-helper">{whoErrors[0]}</p>
                {/if}
              </div>
            </div>
            <div class="col-span-full">
              <label for="why" class="block text-sm font-medium leading-6 text-gray-900">
                Why are you here?
              </label>
              <div class="mt-2">
                <textarea
                  id="why"
                  name="why"
                  rows="3"
                  class="block w-full rounded-md border-0 p-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus-within:outline-none focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                ></textarea>
              </div>

              <p class="mt-2 text-sm text-gray-600" class:text-red-600={whyErrors?.length}>
                {whyErrors?.length ? whyErrors[0] : 'Write a few sentences about yourself.'}
              </p>
            </div>
          </div>
        </div>
        <div class="mt-5 sm:ml-6 sm:mt-0 sm:flex sm:flex-shrink-0 sm:items-center">
          <button
            type="submit"
            class="inline-flex items-center rounded-md bg-lime-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-lime-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-500">
            Join
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

<style>
</style>
