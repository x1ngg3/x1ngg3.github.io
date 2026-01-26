# x1ngg3 的博客

基于 Astro 5.x 构建的个人博客，采用 Apple 风格设计美学。

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
---

文章内容使用 Markdown 编写...
```

### 发布说说

在 `src/content/thoughts/` 创建 Markdown 文件：

```markdown
---
date: 2024-01-20T14:30:00Z
mood: "☕"
---

说说内容，支持完整 Markdown 语法...
```

说说支持所有 Markdown 特性：代码块、列表、引用、图片等。

## 自定义

### 修改首页

编辑 `src/pages/index.astro`：
- Hero 区域：标题、副标题、描述文字
- 内容预览：调整显示文章/说说数量（`.slice(0, 6)` / `.slice(0, 8)`）

### 样式调整

- **全局样式**：`src/styles/global.css`（颜色、字体、间距）
- **布局样式**：`src/layouts/BaseLayout.astro`（导航、页脚）
- **页面样式**：各页面 `<style>` 标签内

### 配置导航

在 `src/layouts/BaseLayout.astro` 的 `.nav-links` 区域修改。

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
- **样式**：原生 CSS（Apple 设计系统）
- **部署**：GitHub Pages + GitHub Actions
- **内容**：Markdown + Astro Content Collections

## 项目结构

查看 `ARCHITECTURE.md` 了解详细的技术架构和文件组织。
