/** @type {import('prettier').Config} */
module.exports = {
  singleQuote: true,
  bracketSameLine: true,
  plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
};
