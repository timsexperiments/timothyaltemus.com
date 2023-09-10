/** @type {import('prettier').Config} */
module.exports = {
  singleQuote: true,
  bracketSameLine: true,
  plugins: ['prettier-plugin-tailwindcss', 'prettier-plugin-astro'],
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
};
