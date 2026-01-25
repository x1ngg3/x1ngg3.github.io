# 快速开始指南

## 第一次使用

### 1. 本地运行项目

```bash
# 启动开发服务器
npm run dev
```

浏览器访问：http://localhost:4321

你应该能看到：
- ✅ 首页显示2篇示例文章和3条说说
- ✅ 顶部导航栏正常工作
- ✅ 所有页面都能访问

### 2. 查看示例内容

示例文章位于：
- `src/content/posts/welcome.md`
- `src/content/posts/markdown-cheatsheet.md`

示例说说位于：
- `src/content/thoughts/first-thought.md`
- `src/content/thoughts/dark-mode-thinking.md`
- `src/content/thoughts/coffee-and-code.md`

## 写你的第一篇文章

### 步骤1：创建文件

在 `src/content/posts/` 目录创建一个新文件，例如 `2024-01-24-my-first-post.md`

### 步骤2：填写内容

```markdown
---
title: "我的第一篇文章"
description: "这是我在新博客上的第一篇文章"
date: 2024-01-24
tags: ["随笔", "博客"]
---

## 这是标题

这是正文内容...
```

### 步骤3：预览

保存文件后，开发服务器会自动刷新，你能立即看到新文章！

## 写你的第一条说说

### 步骤1：创建文件

在 `src/content/thoughts/` 目录创建一个新文件，例如 `2024-01-24-my-thought.md`

### 步骤2：填写内容

```markdown
---
date: 2024-01-24T15:30:00Z
mood: "🎉"
---

今天开始用新博客啦！感觉很棒~
```

### 步骤3：预览

保存后访问 http://localhost:4321/thoughts 查看

## 部署到 GitHub Pages

### 前置条件

1. 在 GitHub 创建一个仓库（可以命名为 `blog`）
2. 确保本地已安装 Git

### 步骤1：初始化 Git

```bash
git init
git add .
git commit -m "Initial commit"
```

### 步骤2：关联远程仓库

```bash
# 替换成你的 GitHub 用户名
git remote add origin https://github.com/x1ngg3/blog.git
git branch -M main
git push -u origin main
```

### 步骤3：配置 GitHub Pages

1. 进入你的 GitHub 仓库
2. 点击 `Settings` → `Pages`
3. 在 **Source** 下拉菜单选择 `GitHub Actions`
4. 完成！

### 步骤4：等待部署

- 推送代码后，GitHub Actions 会自动构建和部署
- 访问 `Actions` 标签页查看构建进度
- 构建完成后，你的博客会发布到：`https://x1ngg3.github.io/`

## 常用操作

### 修改网站标题和信息

编辑 `src/layouts/BaseLayout.astro` 文件：

```astro
const {
  title = '你的名字 的博客',  // 👈 修改这里
  description = '你的博客描述'  // 👈 修改这里
} = Astro.props;
```

同时修改导航栏中的名字：

```astro
<a href="/" class="logo">
  <span class="logo-text">你的名字</span>  // 👈 修改这里
</a>
```

### 修改首页欢迎语

编辑 `src/pages/index.astro` 文件：

```astro
<h1 class="hero-title">Hi, 我是 你的名字 👋</h1>  // 👈 修改这里
<p class="hero-description">
  这里写你的个人简介...  // 👈 修改这里
</p>
```

### 修改关于页面

编辑 `src/pages/about/index.astro`，替换成你自己的信息

### 修改主题颜色

编辑 `src/styles/global.css` 文件，修改这几个变量：

```css
:root {
  --color-primary: #3b82f6;      /* 主题色，改成你喜欢的颜色 */
  --color-primary-hover: #2563eb; /* 悬停颜色 */
}
```

推荐配色：
- 蓝色：`#3b82f6`
- 紫色：`#8b5cf6`
- 绿色：`#10b981`
- 粉色：`#ec4899`

### 添加图片

1. 将图片放到 `public/images/` 目录
2. 在文章中使用相对路径引用：

```markdown
![图片描述](/images/your-image.jpg)
```

## 日常写作工作流

```bash
# 1. 写新文章或说说（在 src/content/ 目录下）

# 2. 本地预览（可选）
npm run dev

# 3. 提交并推送
git add .
git commit -m "新文章：xxx"
git push

# 4. 等待1-2分钟，自动部署完成！
```

## 故障排查

### 本地运行报错

```bash
# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm install
```

### 构建失败

```bash
# 本地测试构建
npm run build

# 如果有错误，会显示具体信息
```

### 页面显示为空

- 检查文章的 Front Matter 格式是否正确
- 确保文件名不包含特殊字符
- 确保日期格式正确：`YYYY-MM-DD`

## 进阶功能

### 添加评论功能

告诉 AI："帮我集成 Giscus 评论系统"

### 添加搜索功能

告诉 AI："帮我添加文章搜索功能"

### 添加深色模式

告诉 AI："帮我添加深色模式切换"

### 自定义样式

告诉 AI 你想要的效果，例如：
- "文章卡片改成圆角矩形"
- "导航栏改成透明背景"
- "首页改成两栏布局"

## 需要帮助？

- 查看 [README.md](./README.md) 了解更多信息
- 查看 [TECHNICAL_DESIGN.md](./TECHNICAL_DESIGN.md) 了解技术细节
- 如有问题，让 AI 帮你解决！

---

**祝你写作愉快！✨**
