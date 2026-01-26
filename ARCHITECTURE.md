# 架构说明

本文档面向 AI 和开发者，说明项目的技术架构和文件组织。

## 技术栈

- **框架**：Astro 5.x（静态站点生成器）
- **内容管理**：Astro Content Collections（类型安全的内容管理）
- **样式系统**：原生 CSS + CSS Variables（Apple 设计系统）
- **部署**：GitHub Pages + GitHub Actions
- **开发工具**：TypeScript, Node.js 18+

## 项目结构

```
blog/
├── src/
│   ├── content/
│   │   ├── config.ts              # Content Collections 配置
│   │   ├── posts/                 # 博客文章（Markdown）
│   │   │   ├── welcome.md
│   │   │   ├── markdown-cheatsheet.md
│   │   │   └── feature-test.md
│   │   └── thoughts/              # 说说（Markdown）
│   │       ├── first-thought.md
│   │       ├── coffee-and-code.md
│   │       └── dark-mode-thinking.md
│   │
│   ├── layouts/
│   │   └── BaseLayout.astro       # 基础布局（导航栏、页脚）
│   │
│   ├── pages/
│   │   ├── index.astro            # 首页（Hero + 双列内容预览）
│   │   ├── posts/
│   │   │   ├── index.astro        # 文章列表页
│   │   │   └── [slug].astro       # 文章详情页（动态路由）
│   │   ├── thoughts/
│   │   │   └── index.astro        # 说说列表页
│   │   └── about.astro            # 关于页面
│   │
│   └── styles/
│       └── global.css             # 全局样式（Apple 设计系统）
│
├── public/                        # 静态资源
│   └── favicon.svg
│
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actions 部署配置
│
├── astro.config.mjs               # Astro 配置（base path, output 等）
├── package.json
└── tsconfig.json
```

## 核心文件说明

### Content Collections (`src/content/config.ts`)

定义两个内容集合的 Schema：

- **posts**：博客文章
  - `title: string` - 标题
  - `description: string` - 描述
  - `date: Date` - 发布日期

- **thoughts**：说说
  - `date: Date` - 发布时间
  - `mood?: string` - 心情 emoji（可选）

### 页面路由

- `/` - 首页（Hero + 最新文章/说说预览）
- `/posts` - 文章列表
- `/posts/[slug]` - 文章详情
- `/thoughts` - 说说列表
- `/about` - 关于页面

### Apple 设计系统 (`src/styles/global.css`)

核心设计元素：

1. **配色系统**：
   - `--color-text: #1d1d1f`（主文本）
   - `--color-text-secondary: #86868b`（次要文本）
   - `--color-primary: #0071e3`（主色调）

2. **玻璃拟态效果**：
   - `--glass-bg: rgba(255, 255, 255, 0.72)`
   - `backdrop-filter: blur(20px) saturate(180%)`

3. **字体系统**：
   - SF Pro Display/Text（通过 -apple-system）
   - 负字间距（`letter-spacing: -0.003em`）
   - 抗锯齿渲染

4. **阴影层级**：
   - `--shadow-sm/md/lg/xl`（4 级阴影系统）

5. **动画**：
   - `cubic-bezier(0.4, 0, 0.2, 1)`（流畅过渡）

### 首页布局 (`src/pages/index.astro`)

单页布局，包含：

1. **Hero Section**：
   - 标题、副标题、描述
   - 行动按钮（浏览文章、看看说说）
   - 淡入动画

2. **双列内容预览**：
   - 左列：最新 6 篇文章
   - 右列：最新 8 条说说
   - 玻璃拟态卡片 + hover 效果
   - 响应式：移动端切换为单列

### 部署配置 (`.github/workflows/deploy.yml`)

自动化流程：
1. 触发：push 到 main 分支
2. Node.js 18 环境
3. 安装依赖 → 构建 → 部署到 GitHub Pages

## 内容管理

### 文章 Schema

```typescript
const posts = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date()
  })
});
```

### 说说 Schema

```typescript
const thoughts = defineCollection({
  schema: z.object({
    date: z.date(),
    mood: z.string().optional()
  })
});
```

## 样式架构

### 全局样式 (global.css)
- CSS 变量系统
- 重置样式
- 基础排版
- 工具类（.container, .card, .button）

### 组件样式
- Scoped styles（`<style>` 标签）
- 继承全局 CSS 变量
- 响应式断点：768px, 968px

## 响应式设计

### 断点
- **968px**：双列 → 单列（首页内容区）
- **768px**：移动端优化（字号、间距、Hero 尺寸）

### 移动端优化
- Hero 标题：4rem → 2.5rem
- 卡片内边距：1.5rem → 1.25rem
- 导航间距：2rem → 1.5rem

## AI 接手指南

### 关键概念

1. **Astro Content Collections**：类型安全的内容管理，自动生成类型
2. **静态生成**：所有页面构建时生成 HTML
3. **动态路由**：`[slug].astro` 通过 `getStaticPaths()` 生成路径
4. **Scoped CSS**：`<style>` 标签内样式自动作用域隔离

### 常见修改

- **修改首页内容数量**：`index.astro` 中的 `.slice(0, n)`
- **调整样式**：优先修改 `global.css` 中的 CSS 变量
- **修改导航**：`BaseLayout.astro` 中的 `.nav-links`
- **添加页面**：在 `src/pages/` 创建 `.astro` 文件

### 部署配置

- **base path**：`astro.config.mjs` 中的 `base: '/blog/'`
- **输出模式**：`output: 'static'`（静态站点）
- **构建目录**：`dist/`（GitHub Actions 自动部署）

## 注意事项

1. **内容文件**：frontmatter 必须符合 Schema 定义
2. **日期格式**：posts 用 `2024-01-20`，thoughts 用 ISO 8601
3. **CSS 作用域**：全局样式用 `:global()`
4. **构建命令**：`npm run build` 后检查 `dist/` 目录
5. **推送部署**：每次 push 到 main 自动触发 GitHub Actions
