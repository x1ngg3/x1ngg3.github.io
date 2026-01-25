# 将新博客部署到 x1ngg3.github.io 的完整指南

## 目标

- 新博客部署到 `x1ngg3.github.io` 仓库
- 旧 Hexo 博客保留（可选）或删除

## 方案选择

### 方案 A: 保留旧博客（推荐）

**结果：**
- 新博客：`https://x1ngg3.github.io/` ✅ 主域名
- 旧博客：`https://x1ngg3.github.io/old-blog/` 或独立仓库

### 方案 B: 完全替换旧博客

**结果：**
- 新博客：`https://x1ngg3.github.io/` ✅ 主域名
- 旧博客：删除或备份到本地

---

## 方案 A: 保留旧博客（详细步骤）

### 步骤 1: 重命名旧仓库

1. 访问 https://github.com/x1ngg3/x1ngg3.github.io
2. 点击 `Settings`
3. 在 "Repository name" 输入新名字，例如：`blog-hexo-backup`
4. 点击 `Rename`

**新的 URL：** `https://github.com/x1ngg3/blog-hexo-backup`

### 步骤 2: 更新新博客配置

编辑 `astro.config.mjs`：

```javascript
export default defineConfig({
  site: 'https://x1ngg3.github.io',
  // 删除或注释掉 base
  // base: '/blog',  ← 注释这一行
});
```

### 步骤 3: 推送新博客到 x1ngg3.github.io

```bash
# 在新博客目录下

# 1. 添加远程仓库（使用新的仓库名）
git remote add origin https://github.com/x1ngg3/x1ngg3.github.io.git

# 2. 推送代码
git branch -M main
git push -u origin main
```

### 步骤 4: 配置 GitHub Pages

1. 进入 https://github.com/x1ngg3/x1ngg3.github.io
2. Settings → Pages
3. Source 选择 `GitHub Actions`
4. 完成！

### 步骤 5: 等待部署

- 访问 Actions 标签页
- 等待构建完成（绿色 ✅）
- 访问 `https://x1ngg3.github.io/`

**完成！新博客现在是主站了！** 🎉

### （可选）步骤 6: 旧博客迁移到子目录

如果你想保留旧博客的访问：

1. 克隆旧仓库：
   ```bash
   git clone https://github.com/x1ngg3/blog-hexo-backup.git
   ```

2. 将旧博客的静态文件复制到新博客的 `public/old-blog/` 目录

3. 推送：
   ```bash
   git add public/old-blog
   git commit -m "Add old blog"
   git push
   ```

4. 旧博客访问地址：`https://x1ngg3.github.io/old-blog/`

---

## 方案 B: 完全替换（简化版）

### 步骤 1: 备份旧博客（可选）

```bash
# 克隆到本地备份
git clone https://github.com/x1ngg3/x1ngg3.github.io.git old-blog-backup
```

### 步骤 2: 删除旧仓库内容

**选项 1: 强制推送（简单但危险）**

```bash
# 在新博客目录下
git remote add origin https://github.com/x1ngg3/x1ngg3.github.io.git
git push -f origin main
```

**选项 2: 在 GitHub 上删除旧仓库后重新创建（推荐）**

1. 访问 https://github.com/x1ngg3/x1ngg3.github.io
2. Settings → 滚动到最下方 → Delete this repository
3. 输入 `x1ngg3/x1ngg3.github.io` 确认删除
4. 创建新仓库，名称为 `x1ngg3.github.io`
5. 推送新博客代码

### 步骤 3: 更新配置

编辑 `astro.config.mjs`：

```javascript
export default defineConfig({
  site: 'https://x1ngg3.github.io',
  // 删除 base 配置
});
```

### 步骤 4: 推送代码

```bash
git init
git add .
git commit -m "Initial commit: New Astro blog"
git branch -M main
git remote add origin https://github.com/x1ngg3/x1ngg3.github.io.git
git push -u origin main
```

### 步骤 5: 配置 GitHub Pages

Settings → Pages → Source 选择 `GitHub Actions`

---

## 推荐操作流程

**我推荐使用方案 A**，原因：
- ✅ 旧博客不会丢失
- ✅ 可以随时查看旧文章
- ✅ 更安全，不会误删重要内容
- ✅ 可以从旧博客迁移内容

### 完整操作步骤（方案 A）

```bash
# 1. 在 GitHub 上将 x1ngg3.github.io 重命名为 blog-hexo-backup
# （通过网页操作，Settings → Repository name）

# 2. 在新博客目录下
cd /Users/yizixu/project_one/blog

# 3. 更新配置文件
# 编辑 astro.config.mjs，删除或注释 base 配置

# 4. 初始化 Git（如果还没有）
git init
git add .
git commit -m "Initial commit: New Astro blog"

# 5. 关联新的远程仓库
git remote add origin https://github.com/x1ngg3/x1ngg3.github.io.git
git branch -M main

# 6. 推送代码
git push -u origin main

# 7. 在 GitHub 上配置 Pages
# Settings → Pages → Source 选择 GitHub Actions

# 8. 完成！访问 https://x1ngg3.github.io/
```

---

## 验证清单

部署完成后，检查：

- [ ] 访问 `https://x1ngg3.github.io/` 能看到新博客
- [ ] 首页正常显示
- [ ] 文章列表正常
- [ ] 文章详情页正常
- [ ] 图片正常加载
- [ ] 样式正常

---

## 常见问题

### Q: 推送时提示 "remote already exists"？

```bash
# 删除旧的 remote
git remote remove origin

# 重新添加
git remote add origin https://github.com/x1ngg3/x1ngg3.github.io.git
```

### Q: 推送时提示 "permission denied"？

- 检查 Personal Access Token 是否正确
- 重新生成 token：https://github.com/settings/tokens

### Q: 网站显示 404？

- 等待 5-10 分钟（GitHub Pages 需要时间）
- 检查 Settings → Pages 是否配置正确
- 检查 Actions 是否构建成功

### Q: 样式丢失？

- 检查 `astro.config.mjs` 中是否删除了 `base` 配置
- 重新构建和部署

### Q: 想恢复旧博客？

```bash
# 1. 访问 https://github.com/x1ngg3/blog-hexo-backup
# 2. Settings → Repository name
# 3. 改回 x1ngg3.github.io
```

---

## 旧博客访问地址变化

### 之前
- 旧博客：`https://x1ngg3.github.io/`

### 之后（方案 A）
- 新博客：`https://x1ngg3.github.io/` ✅ 主域名
- 旧博客：保存在 `blog-hexo-backup` 仓库，需要重新部署到子目录

### 之后（方案 B）
- 新博客：`https://x1ngg3.github.io/` ✅ 主域名
- 旧博客：仅本地备份（如果做了备份）

---

## 时间估计

- **方案 A**：10-15 分钟
- **方案 B**：5-10 分钟

---

## 小贴士

1. **操作前先备份**：至少克隆旧仓库到本地
2. **先测试再删除**：确认新博客正常后再考虑删除旧博客
3. **保留历史记录**：可以将旧博客的重要文章迁移到新博客
4. **更新书签**：如果 URL 有变化，记得更新浏览器书签

---

**选择方案 A，安全且灵活！** ✅
