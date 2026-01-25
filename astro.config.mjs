// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://x1ngg3.github.io',
  // 如果部署在子目录，取消下面这行注释并修改路径
  // base: '/blog',
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  }
});
