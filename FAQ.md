# 问题解答文档

## 你提出的问题及解决方案

### 1. 换电脑如何再次部署？

**非常简单，只需3个命令：**

```bash
# 1. 克隆仓库
git clone https://github.com/x1ngg3/blog.git
cd blog

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

**详细说明请查看：** [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

包含：
- 前置要求（Node.js、Git）
- 详细步骤说明
- Git 配置方法
- 常见问题解决
- 多电脑同步策略

---

### 2. 如何部署到 GitHub？

**完整部署流程：**

#### 步骤 1: 在 GitHub 创建仓库
- 访问 https://github.com
- 点击 `+` → `New repository`
- 名称: `blog` 或其他
- 选择 `Public`（免费 GitHub Pages 需要）
- **不要勾选** "Add a README"

#### 步骤 2: 推送代码

```bash
# 初始化 Git
git init
git add .
git commit -m "Initial commit"

# 关联远程仓库（替换你的用户名）
git remote add origin https://github.com/x1ngg3/blog.git
git branch -M main
git push -u origin main
```

#### 步骤 3: 配置 GitHub Pages
1. 进入仓库 `Settings` → `Pages`
2. Source 选择 `GitHub Actions`
3. 完成！

#### 步骤 4: 等待部署
- 查看 `Actions` 标签页
- 等待绿色 ✅
- 访问 `https://x1ngg3.github.io/blog/`

**详细指南请查看：** [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)

包含：
- 详细部署步骤
- Personal Access Token 配置
- 自定义域名设置
- 常见问题解决
- 其他部署平台（Vercel、Netlify）

---

### 3. 代码块和代码高亮

**已修复！✅ 代码高亮已经内置且正常工作。**

#### 如何使用代码块？

在 Markdown 文件中使用三个反引号：

````markdown
```javascript
function hello() {
  console.log("Hello, World!");
}
```

```python
def hello():
    print("Hello, World!")
```
````

#### 支持的语言

支持 **所有主流编程语言**，包括：
- JavaScript, TypeScript, JSX, TSX
- Python, Java, C, C++, C#
- Go, Rust, PHP, Ruby
- HTML, CSS, SCSS, Less
- JSON, YAML, XML
- Bash, Shell, PowerShell
- SQL, Markdown
- 等等...

#### 代码高亮主题

当前使用 `github-dark` 主题，可以在 `astro.config.mjs` 修改：

```javascript
markdown: {
  shikiConfig: {
    theme: 'github-dark',  // 改成其他主题
    // 可选主题：github-light, monokai, nord, dracula, solarized-dark 等
  }
}
```

#### 测试文章

已创建 `src/content/posts/feature-test.md` 包含：
- ✅ JavaScript、Python、TypeScript 等多种语言示例
- ✅ 代码高亮测试
- ✅ 行内代码测试

访问 http://localhost:4321/posts/feature-test 查看效果！

---

### 4. URL 形式的图片

**已修复！✅ 现在完全支持 URL 图片。**

#### 如何使用？

在 Markdown 中直接使用 URL：

```markdown
![图片描述](https://example.com/image.jpg)
```

#### 图片使用方式对比

| 方式 | 语法 | 使用场景 |
|------|------|----------|
| **URL 图片** | `![描述](https://example.com/pic.jpg)` | 外部图片、CDN 图片 |
| **本地图片** | `![描述](/images/pic.jpg)` | 自己上传的图片 |

#### 本地图片使用方法

1. 将图片放到 `public/images/` 目录
2. 在 Markdown 中引用：
   ```markdown
   ![我的图片](/images/my-photo.jpg)
   ```

#### 示例文章

`src/content/posts/feature-test.md` 包含：
- ✅ URL 图片示例（Astro Logo、GitHub Logo）
- ✅ 本地图片示例

**注意：** 路径必须以 `/` 开头，例如 `/images/pic.jpg` 而不是 `images/pic.jpg`

---

## 所有功能列表

### ✅ 已实现的功能

1. **文章系统**
   - Markdown/MDX 格式支持
   - 代码高亮（所有主流语言）
   - 图片支持（本地 + URL）
   - 标签分类
   - Front Matter 元数据

2. **说说功能**
   - 时间线展示
   - Markdown 内容支持
   - 心情 emoji
   - 标签

3. **页面**
   - 首页（展示最新文章和说说）
   - 文章列表页
   - 文章详情页
   - 说说列表页
   - 标签索引页
   - 单个标签页
   - 关于页面

4. **样式**
   - 响应式设计
   - 代码高亮主题
   - 卡片hover效果
   - 干净简洁的UI

5. **部署**
   - GitHub Actions 自动部署
   - 支持自定义域名
   - 其他平台支持（Vercel、Netlify）

### 📝 Markdown 语法支持

- ✅ 标题（H1-H6）
- ✅ 段落、换行
- ✅ **粗体**、*斜体*、~~删除线~~
- ✅ 有序列表、无序列表
- ✅ 任务列表 `- [ ]`
- ✅ 引用 `>`
- ✅ 代码块 ` ``` `
- ✅ 行内代码 `` `code` ``
- ✅ 链接 `[text](url)`
- ✅ 图片 `![alt](url)`
- ✅ 表格 `| col |`
- ✅ 分隔线 `---`

### 🎨 样式特性

- ✅ 代码高亮（Shiki）
- ✅ 卡片阴影和hover效果
- ✅ 响应式布局（手机友好）
- ✅ 自定义主题色
- ✅ 渐变色标题
- ✅ 时间线展示（说说页面）

---

## 快速测试

### 测试代码高亮

1. 访问 http://localhost:4321/posts/feature-test
2. 查看各种语言的代码高亮效果

### 测试图片

同一篇测试文章中包含：
- URL 图片（应该能正常显示）
- 本地图片占位符

### 测试说说

1. 访问 http://localhost:4321/thoughts
2. 查看说说是否正常显示

### 测试首页

访问 http://localhost:4321 查看：
- 最新文章列表
- 最新说说列表

---

## 文件说明

### 关键文件

| 文件 | 说明 |
|------|------|
| `astro.config.mjs` | Astro 配置（包括代码高亮主题） |
| `src/styles/global.css` | 全局样式（包括代码块样式） |
| `src/content/config.ts` | Content Collections 配置 |
| `.github/workflows/deploy.yml` | GitHub Actions 部署配置 |

### 内容目录

| 目录 | 说明 |
|------|------|
| `src/content/posts/` | 📝 写文章的地方 |
| `src/content/thoughts/` | 💬 写说说的地方 |
| `public/images/` | 🖼️ 放图片的地方 |

---

## 常见问题

### Q: 代码块没有高亮？

**A:** 检查语言标识是否正确：

````markdown
```javascript  ✅ 正确
```js         ✅ 也可以
```          ❌ 缺少语言标识（会显示但不高亮）
````

### Q: 图片不显示？

**A:** 检查路径：

```markdown
![图片](/images/pic.jpg)     ✅ 正确（开头有 /）
![图片](images/pic.jpg)      ❌ 错误（缺少 /）
![图片](./images/pic.jpg)    ❌ 错误（相对路径）
```

### Q: 说说内容不显示？

**A:** 已修复！确保 Front Matter 格式正确：

```yaml
---
date: 2024-01-25T10:00:00Z  # 必需
mood: "😊"                  # 可选
---

说说内容...
```

### Q: 如何更改代码高亮主题？

**A:** 编辑 `astro.config.mjs`：

```javascript
markdown: {
  shikiConfig: {
    theme: 'dracula',  // 改成你喜欢的主题
  }
}
```

可选主题：
- `github-light` - GitHub 浅色
- `github-dark` - GitHub 深色（当前）
- `monokai` - Monokai
- `nord` - Nord
- `dracula` - Dracula
- `solarized-dark` - Solarized Dark
- `solarized-light` - Solarized Light

---

## 更多帮助

- **快速开始**: [QUICK_START.md](./QUICK_START.md)
- **完整文档**: [README.md](./README.md)
- **换电脑指南**: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- **部署指南**: [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)
- **技术设计**: [TECHNICAL_DESIGN.md](./TECHNICAL_DESIGN.md)

---

**所有问题都已解决！现在可以放心使用了！** ✨

如果还有其他问题，随时告诉我！
