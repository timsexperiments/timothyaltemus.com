<script>
  import Avatar from '$lib/components/avatar.svelte';
  import Profile from '$lib/components/profile.svelte';
  import { formatDate } from '$lib/date';
  import emojiData from '@emoji-mart/data';
  import { toDate } from 'chat-messages';
  import { Picker } from 'emoji-mart';
  import { Popover } from 'flowbite-svelte';
  import { onMount } from 'svelte';
  import ChatClient from './chat';

  /** @type {import('./$types').PageServerData}*/
  export let data;

  /** @type {ChatClient | undefined}*/
  let chatClient;
  /** @type {string} */
  let message = '';
  let reloadingMembers = false;
  /** @type {HTMLFormElement} */
  let form;
  /** @type {HTMLDivElement} */
  let emojiTarget;
  /** @type {HTMLElement & Picker} */
  let emojiPicker;

  /** @type {import('svelte/store').Writable<import('chat-messages').Message[]>} */
  let messages;
  /** @type {import('svelte/store').Writable<User[]>} */
  let members;
  /** @type {import('svelte/store').Writable<boolean>} */
  let isConnected;
  /** @type {import('svelte/store').Writable<string[]>}*/
  let typingUsers;

  onMount(async () => {
    const initialMessages = await fetch('/api/messages').then((response) => response.json());
    const initialMembers = await fetch('/api/members').then((response) => response.json());
    chatClient = new ChatClient(data.user, initialMessages, initialMembers);

    messages = chatClient.messages;
    members = chatClient.members;
    isConnected = chatClient.isConnected;
    typingUsers = chatClient.typing;

    // @ts-ignore
    emojiPicker = new Picker({
      data: emojiData,
      onEmojiSelect: (/** @type {{native: string}} */ data) => {
        message = message + data.native;
      },
      theme: 'light',
    });
  });

  $: if (chatClient) {
    messages = chatClient.messages;
    members = chatClient.members;
    isConnected = chatClient.isConnected;
  }

  $: hasMessages = !!$messages?.length;
  $: hasMembers = !!$members?.length;
  $: if (emojiTarget) {
    emojiTarget.appendChild(emojiPicker);
  }
  $: numTypingUsers = $typingUsers?.length ?? 0;
  $: isUserTyping = ($typingUsers ?? []).includes(chatClient?.user.username ?? '');

  function sendMessage() {
    chatClient?.sendMessage(message);
    form.reset();
  }

  async function refreshMembers() {
    reloadingMembers = true;
    await chatClient?.updateMembers();
    reloadingMembers = false;
  }

  /**
   * @param {string | undefined | null} avatar
   * @returns {globalThis.Avatar}
   */
  function toAvatar(avatar = 'basic') {
    // @ts-ignore
    return avatar;
  }

  /**
   * @param {boolean} isTyping
   */
  function sendTypingEvent(isTyping) {
    chatClient?.sendTypingEvent(isTyping);
  }
</script>

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
          viewBox="0 0 512 512">
          <path
            d="M256 448c141.4 0 256-93.1 256-208S397.4 32 256 32S0 125.1 0 240c0 45.1 17.7 86.8 47.7 120.9c-1.9 24.5-11.4 46.3-21.4 62.9c-5.5 9.2-11.1 16.6-15.2 21.6c-2.1 2.5-3.7 4.4-4.9 5.7c-.6 .6-1 1.1-1.3 1.4l-.3 .3 0 0 0 0 0 0 0 0c-4.6 4.6-5.9 11.4-3.4 17.4c2.5 6 8.3 9.9 14.8 9.9c28.7 0 57.6-8.9 81.6-19.3c22.9-10 42.4-21.9 54.3-30.6c31.8 11.5 67 17.9 104.1 17.9zM128 208a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm128 0a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm96 32a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
        </svg>
      </div>
      <nav class="flex flex-1 flex-col">
        <div class="mb-4 flex items-center gap-2">
          <h2>Online members</h2>
          <svg
            class="h-4 w-4"
            class:animate-spin={reloadingMembers}
            role="button"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            tabindex="0"
            on:keypress={(event) => {
              if ([' ', 'Enter'].includes(event.key)) refreshMembers();
            }}
            on:click={refreshMembers}>
            <path
              d="M463.5 224H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1c-87.5 87.5-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5z" />
          </svg>
        </div>
        {#if hasMembers}
          <ul class="flex flex-col gap-2">
            {#each $members as member}
              <li><Profile user={member} /></li>
            {/each}
          </ul>
        {:else}
          <p class="italic text-stone-500">
            You are not connected to the server click here to join.
          </p>
        {/if}
      </nav>
    </div>
  </div>

  <main class="h-full py-10 pl-72">
    <div class="flex h-full flex-col-reverse">
      <form bind:this={form} class="flex w-full gap-2 p-2" on:submit|preventDefault={sendMessage}>
        <Popover trigger="click" triggeredBy="#emoji-button" class="border-none bg-transparent">
          <div bind:this={emojiTarget}></div>
        </Popover>
        <div class="flex-1 space-y-2">
          <div
            class="flex rounded-md border border-stone-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2">
            <input
              class="flex h-10 w-full rounded-md border-0 border-none border-stone-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-stone-950 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Message #everyone"
              name="message"
              bind:value={message}
              disabled={!$isConnected}
              on:change={() => {
                console.log('Change event occured.');
                if (message.length === 0) {
                  return sendTypingEvent(false);
                }
                if (!isUserTyping) {
                  return sendTypingEvent(true);
                }
              }}
              on:blur={() => {
                if (isUserTyping) {
                  sendTypingEvent(false);
                }
              }}
              aria-invalid="false" />
            <button
              type="button"
              id="emoji-button"
              aria-haspopup="dialog"
              aria-expanded="false"
              data-state="closed"
              disabled={!$isConnected}
              class="px-2 text-stone-500 disabled:cursor-not-allowed disabled:text-stone-500/60">
              <svg
                class="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
        <button
          class="inline-flex h-10 items-center justify-center rounded-md bg-lime-600 px-4 py-2 text-sm font-medium text-stone-50 ring-offset-white transition-colors hover:bg-lime-600/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          disabled={!$isConnected}>
          <svg
            class="-mt-px h-4 w-4 rotate-45 transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
      {#if numTypingUsers > 0}
        <div>
          {$typingUsers.join(', ')}
          {#if numTypingUsers === 1}
            is
          {:else}
            are
          {/if}
          ...
        </div>
      {/if}
      <hr />
      <div class="flex w-full flex-1 p-2">
        {#if hasMessages}
          <ul class="w-full space-y-4">
            {#each $messages as message}
              <li class="flex items-start gap-3">
                <Avatar avatar={toAvatar(message.author?.avatar)} />
                <div class="flex flex-col">
                  <span class="text-sm font-bold">{message.author?.username}</span>
                  <span class="text-sm text-stone-700">{message.content}</span>
                  <span class="text-xs text-stone-500">
                    {formatDate(toDate(message?.createdAt ?? {}))}
                  </span>
                </div>
              </li>
            {/each}
          </ul>
        {:else}
          <div class="flex h-full w-full justify-center">
            <p class="text-center italic text-stone-500">Be the first to start the conversation.</p>
          </div>
        {/if}
      </div>
      <hr />
      <div class="flex w-full items-center justify-end gap-2 p-2">
        <span
          class="h-2 w-2 rounded-full"
          class:bg-emerald-500={$isConnected}
          class:bg-red-600={!$isConnected}></span>
        <span>{$isConnected ? 'Online' : 'Offline'}</span>
      </div>
    </div>
  </main>
</div>
