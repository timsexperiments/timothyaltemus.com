/// <reference types="@sveltejs/kit" />
/// <reference types="@sveltejs/adapter-cloudflare" />
/// <reference types="@cloudflare/workers-types" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    interface Error {
      code: string;
    }
    // interface Locals {}
    // interface PageData {}
    interface Platform {
      env?: {
        CHAT_KV: KVNamespace;
      };
    }
  }

  type Avatar =
    | 'astronaut'
    | 'secret'
    | 'tie'
    | 'nurse'
    | 'basic'
    | 'ninja'
    | 'poo'
    | 'doctor'
    | 'robot';

  type User = { avatar: Avatar; username: string };
}

export {};
