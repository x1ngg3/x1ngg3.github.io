import { defineCollection, z } from 'astro:content';

// 文章集合
const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().nullable().optional().default(''),
    date: z.coerce.date(),
    author: z.string().default('x1ngg3'),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
    // 评论绑定键：写一次永不改，与文件名/标题/URL 解耦
    commentId: z.string(),
  }),
});

// 说说集合
const thoughts = defineCollection({
  type: 'content',
  schema: z.object({
    date: z.coerce.date(),
    mood: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  posts,
  thoughts,
};
