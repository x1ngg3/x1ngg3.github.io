# x1ngg3 的博客

基于 Astro 5.x 构建的个人博客，以桌面阅读为主。视觉参考 Volantis：全屏摄影封面、图标导航、白色内容卡片与右侧资料栏。

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建部署
npm run build
```

## 写作指南

### 发布文章

在 `src/content/posts/` 创建 Markdown 文件：

```markdown
---
title: "文章标题"
description: "简短描述"
date: 2024-01-20
category: Reading
commentId: my-first-post
---

文章内容使用 Markdown 编写...
```

- `category`：手动指定分类，例如 `Reading`、`Life`、`Security`；省略时为 `Writing`。首页、列表和正文使用同一字段，列表支持按分类筛选。
- `commentId`：必填且唯一，发布后不要修改，用于稳定绑定评论，与标题和文件名无关。

### 发布说说

在 `src/content/thoughts/` 创建 Markdown 文件：

```markdown
---
date: 2024-01-20T14:30:00Z
mood: "☕"
---

说说内容，支持完整 Markdown 语法...
```

说说支持所有 Markdown 特性：代码块、列表、引用、图片等。侧栏显示完整标题和限高文字摘要，点击标题跳到 `/thoughts#note-文件名`；说说页保留完整内容，点击日期可获取该条说说的锚点链接。

## 自定义

### 修改首页

编辑 `src/pages/index.astro`：
- 首屏：全屏封面、站点名称、图标入口与向下浏览按钮
- 左侧：最新文章卡片，数量由 `.slice(0, 6)` 控制
- 右侧：资料、文章分类和最近说说，编辑 `src/components/BlogSidebar.astro`，说说数量由 `.slice(0, 3)` 控制
- 头像：`public/images/avatar.webp`（256×256），导航使用圆角方形，侧栏资料、首页文章卡片和说说使用圆形；侧栏头像容器负责裁切。网页版本移除图片元数据，原始照片不变，Giscus 用户头像不受影响。
- 网站图标：由同一头像生成 `public/favicon-avatar.png`（48×48，圆角）和 `public/apple-touch-icon-avatar.png`（180×180），在 `BaseLayout.astro` 中统一引用；更换头像时同步更新这两个文件。
- 封面：使用指定照片 `DJI_20240916081052_0037_D.jpg` 的网页优化版，存于 `public/images/DJI_20240916081052_0037_D.webp`（2560×1440）；侧栏使用同目录下的 `DJI_20240916081052_0037_D-thumb.webp`（640×360），无需第三方图片服务。网页版本移除 EXIF 等元数据，原始照片不变。

文章页的标题、摘要、正文保持同列；宽屏有目录时显示右侧粘性目录，没有目录时正文居中。文末支持复制文章链接、Twitter 和邮件分享。

评论使用 Giscus 内置 `light` 主题：白色正文区、极浅灰蓝色的“撰写／预览”栏（`#f6f8fa`），其余框线与间距保持原生样式。保留原有评论绑定和表情反应，不附加表情面板。旧的 `public/giscus-theme.css` 保留但不再加载，本地预览不依赖正式站点的旧主题文件。

### 样式调整

- **全局样式**：`src/styles/global.css`（颜色、字体、间距）
- **布局样式**：`src/layouts/BaseLayout.astro`（导航、页脚）
- **内容布局**：`src/layouts/ContentLayout.astro`（卡片主栏与共用侧栏）
- **图标**：`src/components/Icon.astro`（站内统一 SVG 图标，不依赖系统 emoji 字形）
- **页面样式**：各页面 `<style>` 标签内

桌面外层宽度为 1160px，侧栏 264px。封面独立占满一屏（`100dvh`，回退为 `100vh`），主导航与正文排在首屏之后，下滚后导航吸顶；不再使用封面高度扣减或导航负边距。文章卡片与侧栏顶部对齐。主色、卡片内边距、导航高度和阴影统一在全局变量中调整。未填写摘要的文章会从正文生成文字节选，不改写 Markdown 原文。

### 配置导航

主导航编辑 `src/layouts/BaseLayout.astro` 的 `navigation` 数组；封面导航编辑 `src/pages/index.astro` 的 `dockLinks` 数组。分类支持 `/posts?category=Reading#categories` 直接访问。

封面的“博客”和“往下看看”跳到 `#latest`，锚点放在“最新文章”标题栏而非内容容器外沿，让吸顶导航完整到顶，不残留封面边缘。

## 部署到 GitHub Pages

### 首次部署

1. 创建 GitHub 仓库（公开）
2. 配置仓库 Settings → Pages → Source 选择 "GitHub Actions"
3. 推送代码：

```bash
git remote add origin https://github.com/yourusername/blog.git
git push -u origin main
```

GitHub Actions 将自动构建并部署到 `https://yourusername.github.io/blog/`

### 新电脑部署

```bash
# 克隆仓库
git clone https://github.com/yourusername/blog.git
cd blog

# 安装依赖
npm install

# 本地开发
npm run dev

# 修改后推送
git add .
git commit -m "Update content"
git push
```

每次推送到 main 分支都会自动触发重新部署。

## 技术栈

- **框架**：Astro 5.x
- **样式**：原生 CSS（浅灰背景、白色卡片、青绿强调色、系统无衬线字体）
- **部署**：GitHub Pages + GitHub Actions
- **内容**：Markdown + Astro Content Collections

## 项目结构

查看 `ARCHITECTURE.md` 了解详细的技术架构和文件组织。
