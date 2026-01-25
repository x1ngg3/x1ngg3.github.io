# 评论系统使用指南

## 概述

本博客使用**基于文件的评论系统**，评论存储在 `public/comments/comments.json` 文件中。

**特点：**
- ✅ 评论永久保存在项目文件中
- ✅ 完全掌控评论内容
- ✅ 无需第三方服务
- ✅ 支持审核机制
- ✅ 支持访客留下名字和网站链接

---

## 访客如何添加评论？

### 步骤 1: 访问文章页面

访问任意文章（如 `/posts/welcome`），滚动到文章底部。

### 步骤 2: 填写评论表单

填写以下信息：
- **你的名字** *（必填）
- **你的网站**（可选，可以留下博客链接）
- **评论内容** *（必填）

### 步骤 3: 生成评论

点击"生成评论"按钮，会自动生成 JSON 格式的评论内容。

### 步骤 4: 提交评论

1. 点击"复制评论"按钮
2. 访问 [GitHub Issue](https://github.com/x1ngg3/blog/issues/new)
3. 粘贴评论内容
4. 提交 Issue

### 步骤 5: 等待审核

博主会审核后将评论添加到文件中，然后部署上线。

---

## 博主如何审核和添加评论？

### 方法 1: 手动添加（推荐）

1. 访问 GitHub Issues，查看评论提交
2. 复制评论 JSON 内容
3. 打开 `public/comments/comments.json`
4. 添加到数组中：

```json
[
  // 已有评论...
  {
    "id": "2",
    "postSlug": "welcome",
    "author": "张三",
    "website": "https://example.com",
    "content": "很棒的文章！",
    "date": "2024-01-25T10:00:00Z",
    "approved": true  // 👈 改为 true 表示已审核
  }
]
```

5. 保存文件
6. 提交并推送：

```bash
git add public/comments/comments.json
git commit -m "Add new comment"
git push
```

7. 等待自动部署完成

### 方法 2: 使用脚本（未来可以添加）

可以创建一个脚本自动从 GitHub Issues 读取评论并添加到文件。

---

## 评论数据结构

```json
{
  "id": "唯一ID（时间戳或UUID）",
  "postSlug": "文章的 slug（如 'welcome'）",
  "author": "评论者名字",
  "website": "评论者网站（可选）",
  "content": "评论内容",
  "date": "ISO 8601 格式的日期时间",
  "approved": true/false
}
```

**字段说明：**
- `id`: 唯一标识符
- `postSlug`: 对应文章的 slug
- `author`: 评论者名字（必需）
- `website`: 网站 URL（可选）
- `content`: 评论内容（必需）
- `date`: 发布日期（ISO 8601 格式）
- `approved`: 是否已审核（true 才会显示）

---

## 评论管理

### 审核评论

只有 `approved: true` 的评论才会显示在页面上。

新提交的评论默认 `approved: false`，需要手动改为 `true`。

### 删除评论

从 `comments.json` 文件中删除对应的评论对象即可。

### 修改评论

直接编辑 `comments.json` 文件中的评论内容。

### 屏蔽垃圾评论

- 不将垃圾评论添加到 `comments.json`
- 或者添加但设置 `approved: false`
- 关闭对应的 GitHub Issue

---

## 文件位置

| 文件 | 说明 |
|------|------|
| `public/comments/comments.json` | 评论数据存储 |
| `src/components/Comments.astro` | 评论组件 |

---

## 示例：完整评论文件

```json
[
  {
    "id": "1",
    "postSlug": "welcome",
    "author": "示例访客",
    "website": "https://example.com",
    "content": "这是一条示例评论！欢迎来到新博客~",
    "date": "2024-01-24T10:00:00Z",
    "approved": true
  },
  {
    "id": "2",
    "postSlug": "welcome",
    "author": "另一位访客",
    "content": "很棒的博客系统！",
    "date": "2024-01-25T14:30:00Z",
    "approved": true
  },
  {
    "id": "3",
    "postSlug": "feature-test",
    "author": "技术爱好者",
    "website": "https://tech-blog.com",
    "content": "功能测试文章写得很详细！",
    "date": "2024-01-25T16:00:00Z",
    "approved": true
  }
]
```

---

## 优点

1. **数据安全**：评论保存在 Git 仓库中，有完整历史记录
2. **完全掌控**：可以自由编辑、删除、导出评论
3. **无需数据库**：纯静态方案，部署简单
4. **易于迁移**：换平台时评论不会丢失
5. **审核机制**：避免垃圾评论

## 缺点

1. **需要手动审核**：评论不能即时显示
2. **访客体验**：需要通过 GitHub 提交（但更能筛选高质量评论）
3. **需要重新部署**：添加评论需要推送代码

---

## 未来改进

### 可选方案 1: Utterances/Giscus

如果希望评论即时显示，可以集成 [Utterances](https://utteranc.es/) 或 [Giscus](https://giscus.app/)：

**优点：**
- 基于 GitHub Issues/Discussions
- 即时显示，无需审核
- 访客用 GitHub 账号登录即可评论

**缺点：**
- 需要访客有 GitHub 账号
- 评论存储在 GitHub，不在项目文件中

### 可选方案 2: 自动化脚本

创建 GitHub Action，自动从 Issues 读取评论并添加到文件。

**步骤：**
1. 监听 Issues 创建事件
2. 解析评论 JSON
3. 自动添加到 `comments.json`
4. 创建 PR 或直接提交

---

## FAQ

### Q: 评论会丢失吗？

**A:** 不会。评论保存在 Git 仓库中，有完整的版本历史。

### Q: 可以导出评论吗？

**A:** 可以，直接复制 `comments.json` 文件即可。

### Q: 评论格式错误怎么办？

**A:** 确保 JSON 格式正确：
- 使用双引号
- 日期使用 ISO 8601 格式
- 布尔值用 `true`/`false`（小写，不加引号）
- 最后一个对象后不要有逗号

### Q: 如何批量导入旧评论？

**A:** 将旧评论转换为 JSON 格式，添加到 `comments.json` 数组中。

### Q: 评论太多怎么办？

**A:** 可以按文章分文件存储：
- `public/comments/welcome.json`
- `public/comments/markdown-cheatsheet.json`

然后修改 `Comments.astro` 组件的读取逻辑。

---

## 技术细节

### 评论加载逻辑

1. 组件读取 `public/comments/comments.json`
2. 筛选当前文章的评论（`postSlug` 匹配）
3. 只显示已审核的评论（`approved === true`）
4. 按日期倒序排列

### 安全性

- 评论内容会被 HTML 转义，防止 XSS 攻击
- 审核机制过滤垃圾内容
- 网站链接使用 `rel="noopener noreferrer"`

---

**这是一个简单但完全可控的评论系统！** ✨

如有任何问题或建议，欢迎提 Issue！
