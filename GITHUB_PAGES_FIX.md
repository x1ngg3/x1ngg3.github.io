# GitHub Pages 部署错误修复

## 问题描述

收到 GitHub 邮件说构建失败，错误信息显示正在使用 Jekyll 构建：
```
GitHub Pages: jekyll v3.10.0
```

## 问题原因

**GitHub Pages 默认使用 Jekyll 构建！**

- GitHub Pages 看到代码后，会自动尝试用 Jekyll 构建
- 但我们的项目是 **Astro**，不是 Jekyll
- 我们需要使用 **GitHub Actions** 自定义构建流程

## ✅ 解决方案（已完成）

### 1. 添加 `.nojekyll` 文件

我已经创建了 `public/.nojekyll` 文件（空文件），这会告诉 GitHub Pages：
> "不要用 Jekyll 构建，我们有自己的构建流程！"

### 2. 配置 GitHub Pages Source

**⚠️ 重要：你需要在 GitHub 上手动配置！**

请按照以下步骤操作：

1. **访问仓库设置**
   ```
   https://github.com/x1ngg3/x1ngg3.github.io/settings/pages
   ```

2. **找到 "Build and deployment" 部分**

3. **Source 下拉菜单选择：**
   ```
   GitHub Actions  ← 选择这个！
   ```

   **不要选择：**
   - ❌ Deploy from a branch
   - ❌ main / (root)
   - ❌ main / docs

4. **保存后会自动重新部署**

---

## 📋 完整步骤截图说明

### 步骤 1: 进入 Settings

在你的仓库页面：
```
https://github.com/x1ngg3/x1ngg3.github.io
```

点击顶部的 **Settings** 标签。

### 步骤 2: 进入 Pages

在左侧菜单找到 **Pages**（在 Code and automation 部分）。

### 步骤 3: 配置 Source

在 "Build and deployment" 部分：

**Source:** 点击下拉菜单，选择 **GitHub Actions**

如果看到这个选项说明：
- ✅ Custom workflow using GitHub Actions
- ✅ Use a suggested workflow, browse all workflows, or create your own

就对了！

### 步骤 4: 等待部署

- 配置完成后会自动触发新的部署
- 访问 Actions 标签页查看进度：
  ```
  https://github.com/x1ngg3/x1ngg3.github.io/actions
  ```
- 等待绿色 ✅

---

## 🔍 如何验证配置正确

### 方法 1: 查看 Actions 页面

访问：
```
https://github.com/x1ngg3/x1ngg3.github.io/actions
```

应该看到：
- ✅ "Deploy to GitHub Pages" workflow 正在运行或已完成
- ❌ 不应该看到 "pages build and deployment" (Jekyll)

### 方法 2: 查看 Settings → Pages

应该显示：
```
Source: GitHub Actions
Your site is live at https://x1ngg3.github.io/
```

---

## 🐛 故障排查

### 问题 1: 找不到 "GitHub Actions" 选项

**原因：** 仓库中没有 GitHub Actions workflow 文件

**解决：** 确认 `.github/workflows/deploy.yml` 文件存在并已推送

```bash
# 检查文件是否存在
ls -la .github/workflows/deploy.yml

# 如果不存在，重新推送
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions workflow"
git push
```

### 问题 2: Actions 显示错误

查看错误信息，常见问题：
- `npm ci` 失败：删除 `package-lock.json` 重新生成
- 构建失败：本地运行 `npm run build` 检查

### 问题 3: 部署成功但网站空白

检查 `astro.config.mjs` 的 `base` 配置：
- 如果仓库名是 `x1ngg3.github.io`：删除或注释 `base` ✅
- 如果仓库名是其他（如 `blog`）：设置 `base: '/blog'`

---

## 📖 Jekyll vs GitHub Actions 对比

| 方式 | 适用项目 | 优点 | 缺点 |
|------|---------|------|------|
| **Jekyll** | Jekyll 博客 | 自动构建 | 只支持 Jekyll |
| **GitHub Actions** | 任何项目 | 完全自定义 | 需要配置 |

我们使用的是 **GitHub Actions + Astro**，需要：
1. `.github/workflows/deploy.yml` - 构建脚本 ✅ 已有
2. `public/.nojekyll` - 禁用 Jekyll ✅ 已添加
3. Settings → Pages → Source: GitHub Actions ⚠️ 需要手动配置

---

## ✅ 检查清单

配置完成后，确认以下内容：

- [ ] `.github/workflows/deploy.yml` 文件存在
- [ ] `public/.nojekyll` 文件存在
- [ ] Settings → Pages → Source 已设置为 "GitHub Actions"
- [ ] Actions 页面显示 "Deploy to GitHub Pages" workflow
- [ ] workflow 运行成功（绿色 ✅）
- [ ] 能访问 `https://x1ngg3.github.io/`

---

## 🚀 配置完成后

1. **自动部署会立即开始**
   - 查看 Actions 页面
   - 等待 1-2 分钟

2. **访问你的博客**
   ```
   https://x1ngg3.github.io/
   ```

3. **以后每次推送都会自动部署**
   ```bash
   git add .
   git commit -m "更新"
   git push
   # 自动触发部署！
   ```

---

## 💡 为什么需要 .nojekyll 文件？

`.nojekyll` 是一个**空文件**，告诉 GitHub Pages：

> "嘿 GitHub，不要用 Jekyll 构建我的网站！我有自己的构建流程（Astro + GitHub Actions）"

**没有这个文件的后果：**
- GitHub 会尝试用 Jekyll 构建
- 因为项目不是 Jekyll，所以会失败
- 你会收到错误邮件

**有了这个文件：**
- GitHub 不会尝试 Jekyll 构建
- 会使用你在 `.github/workflows/deploy.yml` 中定义的构建流程
- Astro 正常构建和部署

---

## 📝 相关文件

| 文件 | 作用 |
|------|------|
| `.github/workflows/deploy.yml` | 定义如何构建和部署 |
| `public/.nojekyll` | 禁用 Jekyll |
| `astro.config.mjs` | Astro 配置（包括 site URL） |

---

## 🆘 还是不行？

### 检查 1: GitHub Actions 权限

Settings → Actions → General → Workflow permissions：
- 确保选择 "Read and write permissions"

### 检查 2: Pages 配置

Settings → Pages：
- Source: **必须**是 "GitHub Actions"
- 不能是 "Deploy from a branch"

### 检查 3: 查看详细日志

Actions → 点击失败的 workflow → 查看每一步的详细输出

---

## 🎯 下一步

1. **立即操作**：访问 Settings → Pages，配置 Source
2. **等待部署**：查看 Actions 页面
3. **访问网站**：`https://x1ngg3.github.io/`

**配置正确后，就再也不会收到这种错误邮件了！** ✨
