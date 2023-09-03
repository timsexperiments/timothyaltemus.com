<script>
  import Avatar from './avatar.svelte';

  /** @type {User} */
  export let user;

  /** @type {'xs' | 'sm' | 'md' | 'lg'} */
  export let size = 'md';

  let avatar = user.avatar;
</script>

<div class="flex items-center gap-2">
  <Avatar {avatar} size="sm" />
  <span
    class:text-xs={size === 'xs'}
    class:text-sm={size === 'sm'}
    class:text-base={size === 'md'}
    class:text-lg={size === 'lg'}>
    {user.username}
  </span>
</div>
