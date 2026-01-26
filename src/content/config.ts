import { defineCollection, z } from 'astro:content';

// 文章集合
const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    author: z.string().default('x1ngg3'),
    draft: z.boolean().default(false),
  }),
});

// 说说集合
const thoughts = defineCollection({
  type: 'content',
  schema: z.object({
    date: z.coerce.date(),
    mood: z.string().optional(),
  }),
});

export const collections = {
  posts,
  thoughts,
};
