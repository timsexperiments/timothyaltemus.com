<script>
  import Avatar from './avatar.svelte';
  import InputDropdown from './input-dropdown.svelte';
  import { AVATARS } from './server/constants';

  /** @type {globalThis.Avatar} */
  let avatar = 'basic';
  let isExpanded = false;

  /**
   * Sets the selected avatar.
   *
   * @param newAvatar {globalThis.Avatar} the avatar that was selected.
   */
  function select(newAvatar) {
    avatar = newAvatar;
    isExpanded = false;
  }
</script>

<InputDropdown bind:expanded={isExpanded}>
  <div slot="display">
    <Avatar {avatar} size="xs" />
  </div>
  <div slot="options">
    {#each AVATARS as avatar}
      <button
        type="button"
        class="flex w-full justify-center p-2 hover:bg-slate-200"
        on:click={() => select(avatar)}>
        <Avatar {avatar} />
      </button>
    {/each}
  </div>
</InputDropdown>
<input type="hidden" name="avatar" value={avatar} />
