<script>
  import { createMessage } from 'chat-messages';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import ChatClient from './chat.js';

  /** @type {import('./$types').PageServerData}*/
  export let data;

  /** @type {string} */
  let message;

  /** @type {import('svelte/store').Writable<import('chat-messages').Message[]>} */
  const messages = writable(data.messages);
  /** @type {import('svelte/store').Writable<import('chat-messages').User[]>} */
  const members = writable(data.onlineUsers);

  /** @type {import('chat-messages').Message[]}*/
  let previousMessages = [];

  /**
   * @param {import('svelte/store').Writable<*>} store
   * @param {string} apiEndpoint
   */
  async function fetchAndUpdate(store, apiEndpoint) {
    const response = await fetch(apiEndpoint);
    const data = await response.json();
    store.set(data);
  }

  /** @type {ChatClient | undefined} */
  let chatClient;
  onMount(() => {
    chatClient = new ChatClient();

    const messagesSubscription = chatClient.messages.subscribe(async () => {
      try {
        const response = await fetch('/api/messages');
        const data = await response.json();
        messages.set(data);
        previousMessages = data;
      } catch (error) {
        console.error('Fetch failed:', error);
        messages.set(previousMessages);
      }
    });

    const membersSubscription = chatClient.members.subscribe(async () => {
      await fetchAndUpdate(members, '/api/members');
    });

    return () => {
      messagesSubscription.unsubscribe();
      membersSubscription.unsubscribe();
      chatClient?.disconnect();
    };
  });

  async function sendMessage() {
    const message = 'Hello, world!';
    previousMessages = [...$messages];
    messages.update((current) => [
      ...current,
      createMessage({ author: data.user, content: message, createdAt: new Date() }),
    ]);
  }
</script>

<form on:submit|preventDefault={sendMessage}>
  <input type="text" bind:value={message} placeholder="Type your message..." />
  <button type="submit">Send</button>
</form>

<h2>Messages</h2>
<ul>
  {#each $messages as message}
    <li>{message}</li>
  {/each}
</ul>

<div class="h-full">
  <div class="fixed inset-y-0 z-50 flex w-72 flex-col">
    <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-stone-900 px-6 text-stone-50">
      <div class="flex h-16 shrink-0 items-center justify-between pt-4">
        <svg
          class="h-10 w-10 text-lime-600"
          fill="currentColor"
          aria-hidden="true"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          height="1em"
          viewBox="0 0 512 512">
          <path
            d="M256 448c141.4 0 256-93.1 256-208S397.4 32 256 32S0 125.1 0 240c0 45.1 17.7 86.8 47.7 120.9c-1.9 24.5-11.4 46.3-21.4 62.9c-5.5 9.2-11.1 16.6-15.2 21.6c-2.1 2.5-3.7 4.4-4.9 5.7c-.6 .6-1 1.1-1.3 1.4l-.3 .3 0 0 0 0 0 0 0 0c-4.6 4.6-5.9 11.4-3.4 17.4c2.5 6 8.3 9.9 14.8 9.9c28.7 0 57.6-8.9 81.6-19.3c22.9-10 42.4-21.9 54.3-30.6c31.8 11.5 67 17.9 104.1 17.9zM128 208a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm128 0a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm96 32a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
        </svg>
      </div>
      <nav class="flex flex-1 flex-col">
        <h2>Members</h2>
        <ul>
          {#each $members as member}
            <li>{member}</li>
          {/each}
        </ul>
      </nav>
    </div>
  </div>

  <main class="h-full py-10 pl-72">
    <slot />
  </main>
</div>
