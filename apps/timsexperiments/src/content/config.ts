import { defineCollection, z } from 'astro:content';

const articlesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    description: z.string().nonempty(),
    tags: z.string().nonempty().array(),
    title: z.string().nonempty(),
    thumbnail: z.string().nonempty(),
    published: z.date(),
    isDraft: z.boolean().default(false),
  }),
});

export const collections = {
  articles: articlesCollection,
};
